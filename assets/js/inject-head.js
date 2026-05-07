// assets/js/inject-head.js
// NOTE: Phase 3 uses manual consolidation strategy (documented), not runtime head injection.
// This diagnostic helper captures page-type detection and asset path logic.
(function () {
  var pathname = window.location.pathname;
  var filename = pathname.split('/').pop() || 'index.html';
  var isHome = filename === 'index.html' && (pathname === '/' || pathname === '/index.html');
  var isTool = pathname.indexOf('/tools/') !== -1;
  var isGuide = pathname.indexOf('/guides/') !== -1;
  var isCategory = pathname.indexOf('/categories/') !== -1;

  function getAssetPath() {
    var depth = pathname.split('/').filter(function (s) { return s.length > 0; }).length - 1;
    if (depth <= 0) return '';
    return Array(depth).fill('..').join('/') + '/';
  }

  window.__toolbiteHeadContext = {
    pathname: pathname,
    filename: filename,
    isHome: isHome,
    isTool: isTool,
    isGuide: isGuide,
    isCategory: isCategory,
    assetPath: getAssetPath()
  };
}());
