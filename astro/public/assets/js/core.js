(function () {
  var requiredShellHooks = ['mobile-menu-button', 'mobile-menu'];
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

  // Ctrl+K / Cmd+K → search
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var overlay = document.getElementById('tb-search-overlay');
      if (overlay && typeof overlay.show === 'function') {
        overlay.show();
      } else {
        window.location.href = '/search.html';
      }
    }
  });

  // Recent tools — salvează ultimele 5 tool-uri vizitate
  (function () {
    var path = window.location.pathname;
    if (!path.includes('/tools/')) return;
    try {
      var slug = path.split('/tools/')[1].replace('.html', '');
      var title = document.title.split('—')[0].trim() || slug;
      var icon = document.querySelector('.tb-tool-hero__eyebrow') ? '🔧' : '🔧';
      var iconEl = document.querySelector('.wow-tool-card__icon, .tb-tool-hero [data-icon]');
      if (iconEl) icon = iconEl.textContent.trim().charAt(0) || icon;
      var recent = JSON.parse(localStorage.getItem('tb_recent') || '[]');
      recent = recent.filter(function (t) { return t.slug !== slug; });
      recent.unshift({ slug: slug, title: title, icon: icon, path: path });
      recent = recent.slice(0, 5);
      localStorage.setItem('tb_recent', JSON.stringify(recent));
    } catch (_) {}
  })();

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
