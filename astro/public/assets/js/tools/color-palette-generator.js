(function () {
  function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
  }

  function copyColor(color, element) {
    if (window.tbCopyText) {
      window.tbCopyText(color, null);
    } else {
      try {
        navigator.clipboard.writeText(color);
      } catch (_) {}
    }
    var span = element.querySelector('span');
    if (!span) return;
    var orig = span.textContent;
    span.textContent = 'Copied!';
    setTimeout(function () { span.textContent = orig; }, 1500);
  }

  function generatePalette() {
    var container = document.getElementById('paletteContainer');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < 5; i++) {
      var color = generateRandomColor();
      var div = document.createElement('div');
      div.className = 'palette-swatch';
      div.style.backgroundColor = color;
      div.setAttribute('title', 'Click to copy ' + color);
      (function (c, d) {
        d.onclick = function () { copyColor(c, d); };
      })(color, div);
      var span = document.createElement('span');
      span.className = 'palette-hex';
      span.textContent = color;
      div.appendChild(span);
      container.appendChild(div);
    }
  }

  // Expune global pentru butonul onclick din HTML
  window.generatePalette = generatePalette;

  // Auto-generate la load
  if (document.getElementById('paletteContainer')) {
    generatePalette();
  }
})();
