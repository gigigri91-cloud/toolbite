/* extracted from main.js */
(function () {
    const inp = document.getElementById('jwt-input');
    if (!inp) return;
    const err = document.getElementById('jwt-error');
    const headOut = document.getElementById('jwt-header-out');
    const payOut = document.getElementById('jwt-payload-out');
    const sigInfo = document.getElementById('jwt-sig-info');

    function base64UrlToBytes(b64url) {
        let s = b64url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad) s += '='.repeat(4 - pad);
        const bin = atob(s);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    function decodeSegment(seg) {
        const json = new TextDecoder().decode(base64UrlToBytes(seg));
        const obj = JSON.parse(json);
        return JSON.stringify(obj, null, 2);
    }

    function clearOut() {
        if (headOut) headOut.textContent = '';
        if (payOut) payOut.textContent = '';
        if (sigInfo) sigInfo.textContent = '—';
    }

    document.getElementById('jwt-decode-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        clearOut();
        const raw = inp.value.trim();
        if (!raw) {
            if (err) { err.textContent = 'Paste a JWT first.'; err.classList.remove('hidden'); }
            return;
        }
        const parts = raw.split('.');
        if (parts.length < 2) {
            if (err) { err.textContent = 'Expected at least two segments (header.payload…).'; err.classList.remove('hidden'); }
            return;
        }
        try {
            if (headOut) headOut.textContent = decodeSegment(parts[0]);
            if (payOut) payOut.textContent = decodeSegment(parts[1]);
            if (sigInfo) {
                if (parts.length > 2) {
                    sigInfo.textContent = `${parts[2].length} chars (not verified)`;
                } else {
                    sigInfo.textContent = 'none (unsecured JWT)';
                }
            }
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not decode — invalid Base64url or JSON.';
                err.classList.remove('hidden');
            }
            clearOut();
        }
    });

    document.getElementById('jwt-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        clearOut();
    });
})();

/* -----------------------------------------------
