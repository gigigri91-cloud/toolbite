(function () {
  var KEY = 'toolbite-cookie-preferences';
  var banner = document.getElementById('cookie-consent-banner');
  var modal = document.getElementById('cookie-preferences-modal');
  var acceptBtn = document.getElementById('cookie-accept-btn');
  var manageBtn = document.getElementById('cookie-manage-btn');
  var closeBtn = document.getElementById('cookie-modal-close');
  var saveBtn = document.getElementById('cookie-save-preferences');
  var analyticsToggle = document.getElementById('cookie-analytics-toggle');
  var advertisingToggle = document.getElementById('cookie-advertising-toggle');

  if (!banner || !modal || !acceptBtn || !manageBtn || !closeBtn || !saveBtn || !analyticsToggle || !advertisingToggle) return;

  function readPrefs() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function writePrefs(prefs) {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {}
  }

  function openModal() {
    var prefs = readPrefs();
    analyticsToggle.checked = !!(prefs && prefs.analytics);
    advertisingToggle.checked = !!(prefs && prefs.advertising);
    modal.classList.remove('hidden');
  }

  function closeModal() { modal.classList.add('hidden'); }

  if (!readPrefs()) banner.classList.remove('hidden');

  acceptBtn.addEventListener('click', function () {
    writePrefs({ necessary: true, analytics: true, advertising: true, consentedAt: new Date().toISOString() });
    banner.classList.add('hidden');
  });

  manageBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });

  saveBtn.addEventListener('click', function () {
    writePrefs({ necessary: true, analytics: analyticsToggle.checked, advertising: advertisingToggle.checked, consentedAt: new Date().toISOString() });
    banner.classList.add('hidden');
    closeModal();
  });

  var reopenLinks = document.querySelectorAll('[data-open-cookie-settings="true"]');
  reopenLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      banner.classList.add('hidden');
      openModal();
    });
  });
}());
