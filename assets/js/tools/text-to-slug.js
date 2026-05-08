/* extracted from main.js */
(function () {
    const input = document.getElementById('slug-input');
    const out = document.getElementById('slug-output');
    if (!input || !out) return;
    function slugify(text) {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    function refresh() {
        out.textContent = slugify(input.value);
    }
    input.addEventListener('input', refresh);
    refresh();
    document.getElementById('slug-copy-btn')?.addEventListener('click', () => {
        const s = out.textContent;
        if (!s) return;
        const tmp = document.createElement('input');
        tmp.value = s;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        const b = document.getElementById('slug-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('slug-clear-btn')?.addEventListener('click', () => { input.value = ''; refresh(); });
})();

/* -----------------------------------------------
