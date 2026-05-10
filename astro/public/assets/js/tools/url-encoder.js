/* extracted from main.js */
(function () {
    const inp = document.getElementById('url-input');
    const out = document.getElementById('url-output');
    if (!inp || !out) return;
    const err = document.getElementById('url-error');
    const fullChk = document.getElementById('url-full-url');
    const hint = document.getElementById('url-mode-hint');
    const tabEnc = document.getElementById('url-tab-encode');
    const tabDec = document.getElementById('url-tab-decode');
    let encodeMode = true;

    function syncHint() {
        if (!hint || !fullChk) return;
        const full = fullChk.checked;
        if (encodeMode) {
            hint.textContent = full
                ? 'Encode: full URL — encodeURI (keeps :, /, ?, # in structure).'
                : 'Encode: component — encodeURIComponent (for query values & path segments).';
        } else {
            hint.textContent = full
                ? 'Decode: full URL — decodeURI.'
                : 'Decode: component — decodeURIComponent.';
        }
    }

    function setTabs(enc) {
        encodeMode = enc;
        if (tabEnc && tabDec) {
            if (enc) {
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-emerald-600 text-white text-sm';
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            } else {
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-emerald-600 text-white text-sm';
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            }
        }
        const run = document.getElementById('url-run-btn');
        if (run) run.textContent = enc ? 'Encode' : 'Decode';
        syncHint();
    }

    tabEnc?.addEventListener('click', () => setTabs(true));
    tabDec?.addEventListener('click', () => setTabs(false));
    fullChk?.addEventListener('change', syncHint);
    setTabs(true);

    document.getElementById('url-run-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        const full = fullChk && fullChk.checked;
        const s = inp.value;
        try {
            if (encodeMode) {
                out.value = full ? encodeURI(s) : encodeURIComponent(s);
            } else {
                out.value = full ? decodeURI(s) : decodeURIComponent(s);
            }
        } catch (e) {
            out.value = '';
            if (err) {
                err.textContent = e.message || 'Invalid input for this decode mode — try toggling “Full URL mode”.';
                err.classList.remove('hidden');
            }
        }
    });

    document.getElementById('url-copy-btn')?.addEventListener('click', () => {
        if (!out.value) return;
        window.tbCopyText(out.value, copyBtn);
        const b = document.getElementById('url-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });

    document.getElementById('url-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
