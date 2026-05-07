(function () {
  function getPathPrefix() {
    var path = window.location.pathname;
    var depth = path.split('/').filter(function (s) { return s.length > 0; }).length - 1;
    if (depth <= 0) return '';
    return Array(depth).fill('..').join('/') + '/';
  }

  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function processTemplate(html, vars) {
    var result = html;
    for (var key in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, key)) {
        var pattern = new RegExp('{' + key + '}', 'g');
        result = result.replace(pattern, vars[key]);
      }
    }
    return result;
  }

  function injectHeader(pathPrefix, currentPage) {
    var isHome = currentPage === 'index.html' || currentPage === '';
    var isGuides = window.location.pathname.indexOf('/guides/') !== -1;
    var isContact = currentPage === 'contact.html';

    fetch(pathPrefix + 'assets/html/header.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var vars = {
          pathPrefix: pathPrefix,
          homeActive: isHome ? 'text-orange-700 ' : '',
          guidesActive: isGuides ? 'text-orange-500 ' : '',
          contactActive: isContact ? 'text-orange-500 ' : ''
        };
        var processed = processTemplate(html, vars);
        var headerEl = document.getElementById('site-header');
        if (headerEl) {
          headerEl.outerHTML = processed;
        } else {
          document.body.insertAdjacentHTML('afterbegin', processed);
        }
      })
      .catch(function () {});
  }

  function injectFooter(pathPrefix) {
    fetch(pathPrefix + 'assets/html/footer.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var processed = processTemplate(html, { pathPrefix: pathPrefix });
        var footerEl = document.querySelector('footer');
        if (footerEl) {
          footerEl.outerHTML = processed;
        } else {
          document.body.insertAdjacentHTML('beforeend', processed);
        }
      })
      .catch(function () {});
  }

  function run() {
    var pathPrefix = getPathPrefix();
    var currentPage = getCurrentPage();
    injectHeader(pathPrefix, currentPage);
    injectFooter(pathPrefix);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}());
