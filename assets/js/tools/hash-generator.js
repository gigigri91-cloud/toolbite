/* extracted from main.js */
(function () {
    const inp = document.getElementById('hash-input');
    const out = document.getElementById('hash-output');
    const algoSel = document.getElementById('hash-algo');
    const err = document.getElementById('hash-error');
    const copyBtn = document.getElementById('hash-copy-btn');
    if (!inp || !out || !algoSel) return;

    function bufToHex(buffer) {
        return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    document.getElementById('hash-compute-btn')?.addEventListener('click', async () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        out.value = '';
        if (copyBtn) copyBtn.disabled = true;

        if (!window.crypto || !crypto.subtle) {
            if (err) {
                err.textContent = 'Web Crypto API unavailable. Use HTTPS or a modern browser.';
                err.classList.remove('hidden');
            }
            return;
        }

        const algo = algoSel.value;
        try {
            const data = new TextEncoder().encode(inp.value);
            const hashBuf = await crypto.subtle.digest(algo, data);
            out.value = bufToHex(hashBuf);
            if (copyBtn) copyBtn.disabled = false;
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not compute hash.';
                err.classList.remove('hidden');
            }
        }
    });

    copyBtn?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const o = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = o; }, 1500);
    });

    document.getElementById('hash-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (copyBtn) copyBtn.disabled = true;
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
