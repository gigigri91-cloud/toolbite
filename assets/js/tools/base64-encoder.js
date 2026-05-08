/* extracted from main.js */
(function () {
    const inp = document.getElementById('b64-input');
    const out = document.getElementById('b64-output');
    if (!inp || !out) return;
    const err = document.getElementById('b64-error');
    const tabEnc = document.getElementById('b64-tab-encode');
    const tabDec = document.getElementById('b64-tab-decode');
    const hint = document.getElementById('b64-mode-hint');
    const runBtn = document.getElementById('b64-run-btn');
    let encodeMode = true;

    function utf8ToB64(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }
    function b64ToUtf8(b64) {
        const clean = b64.trim().replace(/\s/g, '');
        const bin = atob(clean);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    function setMode(enc) {
        encodeMode = enc;
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        if (tabEnc && tabDec) {
            if (enc) {
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-amber-500 text-white text-sm';
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            } else {
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-amber-500 text-white text-sm';
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            }
        }
        if (hint) hint.textContent = enc ? 'Plain text → Base64' : 'Base64 → plain text (UTF-8)';
        if (runBtn) runBtn.textContent = enc ? 'Encode to Base64' : 'Decode from Base64';
    }

    tabEnc?.addEventListener('click', () => setMode(true));
    tabDec?.addEventListener('click', () => setMode(false));
    setMode(true);

    document.getElementById('b64-run-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        try {
            if (encodeMode) {
                out.value = utf8ToB64(inp.value);
            } else {
                out.value = b64ToUtf8(inp.value);
            }
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not decode — check your Base64 string.';
                err.classList.remove('hidden');
            }
            out.value = '';
        }
    });

    document.getElementById('b64-copy-btn')?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const b = document.getElementById('b64-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });

    document.getElementById('b64-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
