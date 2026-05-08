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
  let debounceTimer = null;

  function isSafeRelativeUrl(url) {
    return typeof url === 'string' && /^\/[a-z0-9\-_/]+\.html$/i.test(url);
  }

  function createCard(tool) {
    const card = document.createElement('a');
    card.href = isSafeRelativeUrl(tool.url) ? tool.url : '/search.html';
    card.className = 'tb-card tb-card-interactive tb-card-pad-lg tb-card-row tool-card-tb tb-filter-item fade-in-up is-visible';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'tb-tool-icon tb-icon-blue';
    iconWrap.textContent = typeof tool.icon === 'string' && tool.icon.trim() ? tool.icon.trim() : '🧰';

    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
    title.textContent = tool.name || 'Untitled tool';

    const desc = document.createElement('p');
    desc.className = 'text-sm text-gray-500 dark:text-gray-400';
    desc.textContent = tool.desc || 'Open this tool to continue.';

    content.appendChild(title);
    content.appendChild(desc);
    card.appendChild(iconWrap);
    card.appendChild(content);
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
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(function () {
          render(input.value);
        }, 200);
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
