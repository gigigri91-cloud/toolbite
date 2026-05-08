(function () {
  var guideLinks = [
    ['JSON formatter guide: fix invalid JSON fast', '../guides/json-formatter-guide.html'],
    ['How to decode JWT safely', '../guides/jwt-decoder-guide.html'],
    ['SEO slug best practices', '../guides/seo-slug-best-practices.html'],
    ['How to compress images for web', '../guides/compress-images-guide.html'],
    ['Base64 encoding explained', '../guides/base64-encoding-guide.html'],
    ['UUID and GUID explained', '../guides/uuid-guid-guide.html'],
    ['URL encoding explained', '../guides/url-encoding-guide.html'],
    ['QR codes explained', '../guides/qr-code-guide.html'],
    ['How to generate strong passwords', '../guides/password-guide.html']
  ];

  var host = document.getElementById('author-guides-list');
  if (!host) return;

  guideLinks.forEach(function (item) {
    var link = document.createElement('a');
    link.href = item[1];
    link.className = 'bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition font-semibold text-gray-800 hover:text-blue-600';
    link.textContent = item[0];
    host.appendChild(link);
  });
})();
