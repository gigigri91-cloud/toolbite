(function () {
  var searchInput = document.getElementById('category-search');
  var toolsGrid = document.getElementById('category-tools-grid');
  var copyLinkButton = document.querySelector('.copy-tool-link');
  if (!toolsGrid) return;

  var cards = Array.prototype.slice.call(toolsGrid.querySelectorAll('a.tb-card'));

  function matchesCard(card, query) {
    if (!query) return true;
    return card.textContent.toLowerCase().indexOf(query) !== -1;
  }

  function filterCards(raw) {
    var query = (raw || '').trim().toLowerCase();
    cards.forEach(function (card) {
      card.classList.toggle('hidden', !matchesCard(card, query));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }

  if (copyLinkButton) {
    copyLinkButton.addEventListener('click', function () {
      window.tbCopyText(window.location.href, copyLinkButton);
    });
  }
})();
