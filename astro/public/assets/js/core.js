(function () {
  var requiredShellHooks = ['mobile-menu-button', 'mobile-menu', 'theme-toggle'];
  var missingShellHooks = requiredShellHooks.filter(function (id) { return !document.getElementById(id); });
  if (missingShellHooks.length) {
    document.dispatchEvent(new CustomEvent('tb:dom-contract-missing', { detail: { area: 'shell', missing: missingShellHooks } }));
  }

  var menuButton = document.getElementById('mobile-menu-button');
  var mobileMenu = document.getElementById('mobile-menu');
  if (!menuButton || !mobileMenu) return;

  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle('hidden', !isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  menuButton.addEventListener('click', function () {
    setMenuOpen(mobileMenu.classList.contains('hidden'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  document.addEventListener('click', function (event) {
    if (mobileMenu.classList.contains('hidden')) return;
    if (mobileMenu.contains(event.target) || menuButton.contains(event.target)) return;
    setMenuOpen(false);
  });

  setMenuOpen(false);
})();

(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function getTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  function render() {
    var isDark = getTheme() === 'dark';
    toggle.innerHTML = isDark
      ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  setTheme(getTheme());

  toggle.addEventListener('click', function () {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    render();
  });

  render();
})();

(function () {
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll('.tb-reveal, .fade-in-up')
  );
  if (!revealTargets.length) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach(function (el) { observer.observe(el); });
})();

(function () {
  function flashButton(button, label) {
    if (!button) return;
    var original = button.textContent;
    button.textContent = label;
    window.setTimeout(function () {
      button.textContent = original;
    }, 1500);
  }

  window.tbCopyText = function (text, button) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () {
        flashButton(button, 'Copied!');
        return true;
      }).catch(function () {
        flashButton(button, 'Copy failed');
        return false;
      });
    }

    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      flashButton(button, 'Copied!');
      return Promise.resolve(true);
    } catch (_) {
      flashButton(button, 'Copy failed');
      return Promise.resolve(false);
    } finally {
      textArea.remove();
    }
  };
})();
