let lastQRUrl = '';

    function generateQR() {
      const text = document.getElementById('qr-input').value.trim();
      if (!text) { alert('Please enter some text or a URL first.'); return; }
      const size = document.getElementById('qr-size').value;
      const ecc = document.getElementById('qr-error').value;
      const encoded = encodeURIComponent(text);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=${ecc}&data=${encoded}`;
      const img = document.getElementById('qr-image');
      img.src = url;
      img.width = size;
      img.height = size;
      lastQRUrl = url;
      document.getElementById('qr-encoded-text').textContent = 'Encoded: ' + text;
      const result = document.getElementById('qr-result');
      result.classList.remove('hidden');
      result.classList.add('flex');
    }

    function downloadQR() {
      if (!lastQRUrl) return;
      const a = document.createElement('a');
      a.href = lastQRUrl;
      a.download = 'qrcode-toolbite.png';
      a.target = '_blank';
      a.click();
    }

    function copyQRLink() {
      if (!lastQRUrl) return;
      navigator.clipboard.writeText(lastQRUrl).then(() => {
        const btn = document.getElementById('copy-link-btn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '🔗 Copy API Link'; }, 2000);
      });
    }

    document.getElementById('qr-size').addEventListener('input', function() {
      document.getElementById('qr-size-label').textContent = this.value;
    });

    document.getElementById('qr-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateQR(); }
    });
