(function () {
  let TOOLS = [];
  const params = new URLSearchParams(window.location.search);
  const initialQ = (params.get('q') || '').trim();
  const input = document.getElementById('search-input');
  const summary = document.getElementById('search-summary');
  const count = document.getElementById('results-count');
  const grid = document.getElementById('results-grid');
  const noResults = document.getElementById('no-results');

  if (!input || !summary || !count || !grid || !noResults) return;
  input.value = initialQ;

  function getMatches(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(function (tool) {
      return (tool.name + ' ' + tool.desc + ' ' + (tool.tags || '')).toLowerCase().includes(q);
    });
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const form = document.querySelector('form[role="search"]');
  const cardMap = new Map();

  function createCard(tool) {
    const card = document.createElement('a');
    card.href = tool.url;
    card.className = 'tool-card-tb tb-filter-item fade-in-up is-visible bg-white p-6 rounded-2xl hover:-translate-y-1 duration-300 flex items-center gap-4 group border border-gray-100 shadow-sm hover:shadow-md';
    card.innerHTML = '<div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition">' + tool.icon + '</div>' +
      '<div><h3 class="font-bold text-lg text-gray-900 dark:text-white">' + tool.name + '</h3><p class="text-sm text-gray-500">' + tool.desc + '</p></div>';
    return card;
  }

  function buildCards() {
    cardMap.clear();
    grid.innerHTML = '';
    TOOLS.forEach(function (tool) {
      const card = createCard(tool);
      cardMap.set(tool.url, card);
      grid.appendChild(card);
    });
  }

  function updateUrl(raw) {
    const next = raw.trim();
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('q', next);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  }

  function hideCard(card) {
    if (card.classList.contains('hidden')) return;
    if (reduceMotion) {
      card.classList.add('hidden');
      card.classList.remove('is-filtered-out');
      return;
    }
    card.classList.add('is-filtered-out');
    window.setTimeout(function () {
      if (card.classList.contains('is-filtered-out')) card.classList.add('hidden');
    }, 220);
  }

  function showCard(card) {
    if (reduceMotion) {
      card.classList.remove('hidden');
      card.classList.remove('is-filtered-out');
    } else {
      card.classList.remove('hidden');
      card.classList.add('is-filtered-out');
      window.requestAnimationFrame(function () {
        card.classList.remove('is-filtered-out');
      });
    }
    if (card.classList.contains('fade-in-up')) card.classList.add('is-visible');
  }

  function render(raw) {
    const q = raw.trim();
    const matches = getMatches(raw);
    const matchUrls = new Set(matches.map(function (tool) { return tool.url; }));
    let visibleCount = 0;

    TOOLS.forEach(function (tool) {
      const card = cardMap.get(tool.url);
      if (!card) return;
      const shouldShow = !q || matchUrls.has(tool.url);
      if (shouldShow) {
        visibleCount += 1;
        showCard(card);
      } else {
        hideCard(card);
      }
    });

    count.textContent = 'Showing ' + visibleCount + ' tool' + (visibleCount === 1 ? '' : 's');
    if (!q) {
      summary.textContent = 'Browse all tools or type to filter by name, description, or category tags.';
      noResults.classList.add('hidden');
    } else if (!visibleCount) {
      summary.textContent = 'No matches for "' + q + '".';
      noResults.classList.remove('hidden');
    } else {
      summary.textContent = 'Search results for "' + q + '".';
      noResults.classList.add('hidden');
    }

    updateUrl(raw);
  }

  async function init() {
    summary.textContent = 'Loading tools...';
    try {
      const response = await fetch('/data/tools.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load tools list.');
      TOOLS = await response.json();
      if (!Array.isArray(TOOLS)) throw new Error('Invalid tools data format.');
      buildCards();
      render(initialQ);
      input.addEventListener('input', function () {
        render(input.value);
      });
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          render(input.value);
        });
      }
    } catch (error) {
      TOOLS = [];
      buildCards();
      count.textContent = 'Showing 0 tools';
      summary.textContent = 'Search is temporarily unavailable. Please try again.';
      noResults.classList.remove('hidden');
    }
  }

  init();
})();
