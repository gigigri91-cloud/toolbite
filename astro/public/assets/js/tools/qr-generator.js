(function () {
  let lastPngDataUrl = '';
  const input = document.getElementById('qr-input');
  const sizeInput = document.getElementById('qr-size');
  const errorInput = document.getElementById('qr-error');
  const generateBtn = document.getElementById('qr-generate-btn');
  const result = document.getElementById('qr-result');
  const canvas = document.getElementById('qr-canvas');
  const encodedText = document.getElementById('qr-encoded-text');
  const downloadBtn = document.getElementById('qr-download-btn');
  const copyBtn = document.getElementById('copy-link-btn');
  const sizeLabel = document.getElementById('qr-size-label');

  if (!input || !sizeInput || !errorInput || !generateBtn || !result || !canvas || !encodedText || !downloadBtn || !copyBtn || typeof qrcode !== 'function') {
    return;
  }

  function buildQr(value, ecc) {
    var qr = qrcode(0, ecc);
    qr.addData(value);
    qr.make();
    return qr;
  }

  function renderToCanvas(qr, targetCanvas, size) {
    var ctx = targetCanvas.getContext('2d');
    var modules = qr.getModuleCount();
    var scale = Math.floor(size / modules);
    var offset = Math.floor((size - modules * scale) / 2);
    targetCanvas.width = size;
    targetCanvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#111827';
    for (var row = 0; row < modules; row += 1) {
      for (var col = 0; col < modules; col += 1) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(offset + col * scale, offset + row * scale, scale, scale);
        }
      }
    }
  }

  function generateQR() {
    var text = input.value.trim();
    if (!text) return;
    var size = Number(sizeInput.value) || 300;
    var ecc = errorInput.value || 'M';
    var qr = buildQr(text, ecc);
    renderToCanvas(qr, canvas, size);
    lastPngDataUrl = canvas.toDataURL('image/png');
    encodedText.textContent = 'Encoded: ' + text;
    result.classList.remove('hidden');
    result.classList.add('flex');
  }

  function downloadQR() {
    if (!lastPngDataUrl) return;
    var a = document.createElement('a');
    a.href = lastPngDataUrl;
    a.download = 'qrcode-toolbite.png';
    a.click();
  }

  generateBtn.addEventListener('click', generateQR);
  downloadBtn.addEventListener('click', downloadQR);
  copyBtn.addEventListener('click', function () {
    if (!lastPngDataUrl) return;
    window.tbCopyText(lastPngDataUrl, copyBtn);
  });

  sizeInput.addEventListener('input', function () {
    sizeLabel.textContent = this.value;
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateQR();
    }
  });
})();
