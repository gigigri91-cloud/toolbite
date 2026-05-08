/* extracted from main.js */
(function () {
    const out = document.getElementById('uuid-output');
    const countEl = document.getElementById('uuid-count');
    if (!out || !countEl) return;

    function randomUUID() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generate() {
        let n = parseInt(countEl.value, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > 50) n = 50;
        countEl.value = String(n);
        const lines = [];
        for (let i = 0; i < n; i++) lines.push(randomUUID());
        out.value = lines.join('\n');
    }

    document.getElementById('uuid-generate-btn')?.addEventListener('click', generate);
    document.getElementById('uuid-copy-btn')?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const b = document.getElementById('uuid-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('uuid-clear-btn')?.addEventListener('click', () => {
        out.value = '';
        countEl.value = '1';
    });
})();

/* -----------------------------------------------
