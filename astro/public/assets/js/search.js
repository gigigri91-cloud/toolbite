(function () {
  var input = document.getElementById("search-input");
  var summary = document.getElementById("search-summary");
  var count = document.getElementById("results-count");
  var grid = document.getElementById("results-grid");
  var noResults = document.getElementById("no-results");
  var overlay = document.getElementById("search-overlay");
  var template = document.getElementById("search-result-card-template");
  var categoryFilter = document.getElementById("search-category-filter");
  if (!input) return;
  var requiredSearchHooks = ["search-input", "search-summary", "results-count", "results-grid", "no-results"];
  var missingSearchHooks = requiredSearchHooks.filter(function (id) { return !document.getElementById(id); });
  if (missingSearchHooks.length) {
    document.dispatchEvent(new CustomEvent("tb:dom-contract-missing", { detail: { area: "search", missing: missingSearchHooks } }));
  }

  var tools = [];
  var hotIndex = -1;
  var filtered = [];
  var debounceId = null;
  var maxQueryLength = 80;

  function decodeEntities(value) {
    return String(value || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function fuzzyMatch(value, query) {
    if (!query) return true;
    var v = value.toLowerCase();
    var q = query.toLowerCase();
    if (v.indexOf(q) !== -1) return true;
    var i = 0;
    for (var j = 0; j < v.length && i < q.length; j++) {
      if (v[j] === q[i]) i++;
    }
    return i === q.length;
  }

  function safeUrl(url) {
    return /^([a-z0-9\-_/]+)\.html$/i.test(url || "");
  }

  function createFallbackCard(tool) {
    var card = document.createElement("a");
    card.className = "tb-card tb-card-interactive tb-card-pad-lg tb-card-row search-result-card";
    card.href = safeUrl(tool.url) ? "/" + tool.url : "/search.html";
    card.innerHTML =
      '<div class="tb-tool-icon tb-icon-blue"></div><div><h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg"></h3><p class="text-sm text-gray-500 dark:text-gray-400"></p></div>';
    card.querySelector(".tb-tool-icon").textContent = decodeEntities(tool.icon || "🧰");
    card.querySelector("h3").textContent = decodeEntities(tool.title || tool.name || "Untitled");
    card.querySelector("p").textContent = decodeEntities(tool.description || tool.desc || "");
    return card;
  }

  function createTemplateCard(tool, index) {
    var node = template.content.firstElementChild.cloneNode(true);
    node.href = safeUrl(tool.url) ? "/" + tool.url : "/search.html";
    node.dataset.index = String(index);
    node.querySelector(".tb-tool-icon").textContent = decodeEntities(tool.icon || "🧰");
    node.querySelector("h3").textContent = decodeEntities(tool.title || tool.name || "Untitled");
    node.querySelector("p").textContent = decodeEntities(tool.description || tool.desc || "");
    if (index === hotIndex) node.classList.add("ring-2", "ring-blue-500");
    return node;
  }

  function renderCards(list, q) {
    if (!grid) return;
    filtered = list;
    grid.innerHTML = "";
    if (template && template.content && template.content.firstElementChild) {
      list.forEach(function (tool, idx) {
        grid.appendChild(createTemplateCard(tool, idx));
      });
    } else {
      list.forEach(function (tool) {
        grid.appendChild(createFallbackCard(tool));
      });
    }
    if (count) {
      count.textContent = "Showing " + list.length + " result" + (list.length === 1 ? "" : "s");
    }
    if (summary) {
      summary.textContent = q ? 'Results for "' + q + '"' : "Browse all tools or search by intent.";
    }
    if (noResults) {
      noResults.classList.toggle("hidden", list.length !== 0);
    }
  }

  function applyFilter() {
    var q = input.value.trim().slice(0, maxQueryLength);
    if (input.value.length > maxQueryLength) input.value = q;
    var category = categoryFilter ? categoryFilter.value : "all";
    var list = tools.filter(function (tool) {
      if (category !== "all" && tool.category !== category) return false;
      return fuzzyMatch(
        decodeEntities(tool.title || tool.name || "") + " " + decodeEntities(tool.description || tool.desc || "") + " " + decodeEntities(tool.tags || ""),
        q
      );
    });
    hotIndex = list.length ? Math.min(hotIndex, list.length - 1) : -1;
    renderCards(list, q);
    var url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
    if (category !== "all") url.searchParams.set("category", category); else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function openOverlay() {
    if (!overlay) return;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    input.focus();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches("[data-suggestion]")) {
      input.value = target.getAttribute("data-suggestion") || "";
      applyFilter();
      input.focus();
    }
    if (target.matches("[data-close-overlay]")) closeOverlay();
  });

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openOverlay();
      return;
    }
    if (event.key === "/" && document.activeElement !== input) {
      event.preventDefault();
      openOverlay();
      return;
    }
    if (event.key === "Escape") {
      closeOverlay();
      return;
    }
    if (event.key === "ArrowDown") {
      hotIndex = Math.min(filtered.length - 1, hotIndex + 1);
      renderCards(filtered, input.value.trim());
    }
    if (event.key === "ArrowUp") {
      hotIndex = Math.max(0, hotIndex - 1);
      renderCards(filtered, input.value.trim());
    }
    if (event.key === "Enter" && hotIndex >= 0 && filtered[hotIndex] && safeUrl(filtered[hotIndex].url)) {
      window.location.href = "/" + filtered[hotIndex].url;
    }
  });

  input.addEventListener("input", function () {
    if (debounceId) window.clearTimeout(debounceId);
    debounceId = window.setTimeout(applyFilter, 140);
  });
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilter);

  fetch("/data/tools.json", { cache: "no-store" })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      tools = Array.isArray(data) ? data.slice(0, 1200) : [];
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var category = params.get("category") || "all";
      input.value = q;
      if (categoryFilter && category) categoryFilter.value = category;
      applyFilter();
    })
    .catch(function () {
      if (summary) summary.textContent = "Search is temporarily unavailable. Please try again.";
      if (count) count.textContent = "Showing 0 results";
      if (noResults) noResults.classList.remove("hidden");
    });
})();
