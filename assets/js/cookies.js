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

  function getCookie(name) {
    var prefix = name + '=';
    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(prefix) === 0) return cookie.slice(prefix.length);
    }
    return '';
  }

  function readPrefs() {
    try {
      var raw = getCookie(KEY);
      return raw ? JSON.parse(decodeURIComponent(raw)) : null;
    } catch (_) { return null; }
  }

  function writePrefs(prefs) {
    try {
      var encoded = encodeURIComponent(JSON.stringify(prefs));
      document.cookie = KEY + '=' + encoded + '; path=/; max-age=' + (60 * 60 * 24 * 365) + '; SameSite=Lax';
    } catch (_) {}
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
