/* extracted from main.js */
(function () {
    const fileIn = document.getElementById('file-in');
    if (!fileIn) return;
    const btn     = document.getElementById('compress-btn');
    const cv      = document.getElementById('cv');
    const ctx     = cv ? cv.getContext('2d') : null;
    const img     = new Image();
    const dl      = document.getElementById('dl');
    const stats   = document.getElementById('stats');
    const qInput  = document.getElementById('quality');
    const mimeSel = document.getElementById('mime-out');
    const hint    = document.getElementById('hint');
    let lastBlobUrl = null;

    if (qInput) qInput.addEventListener('input', () => {
        document.getElementById('q-val').textContent = qInput.value;
    });

    fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        dl.classList.add('hidden');
        stats.textContent = '';
        if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null; }
        if (!f) { btn.disabled = true; return; }
        const url = URL.createObjectURL(f);
        img.onload = () => {
            URL.revokeObjectURL(url);
            cv.width = img.naturalWidth; cv.height = img.naturalHeight;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, 0, 0);
            btn.disabled = false;
            hint.classList.toggle('hidden', f.type !== 'image/png');
        };
        img.onerror = () => { URL.revokeObjectURL(url); btn.disabled = true; };
        img.src = url;
    });

    if (btn) btn.addEventListener('click', () => {
        const mime = mimeSel.value;
        const q    = parseFloat(qInput.value);
        cv.toBlob(blob => {
            if (!blob) { stats.textContent = 'Could not compress. Try another format.'; return; }
            if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
            lastBlobUrl = URL.createObjectURL(blob);
            dl.href = lastBlobUrl;
            dl.download = mime === 'image/webp' ? 'compressed.webp' : 'compressed.jpg';
            dl.classList.remove('hidden');
            const orig = fileIn.files[0];
            stats.textContent = `Original ~ ${(orig.size / 1024).toFixed(1)} KB → compressed ~ ${(blob.size / 1024).toFixed(1)} KB`;
        }, mime, q);
    });
})();

/* -----------------------------------------------
