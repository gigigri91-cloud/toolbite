/* extracted from main.js */
(function () {
    const ta = document.getElementById('sort-input');
    if (!ta) return;
    const ignCase = document.getElementById('sort-ignore-case');

    function sortLines(desc) {
        const raw = ta.value;
        const lines = raw.split(/\r?\n/);
        const ic = ignCase && ignCase.checked;
        const sens = ic ? 'base' : 'variant';
        lines.sort((a, b) => {
            const cmp = a.localeCompare(b, undefined, { sensitivity: sens, numeric: true });
            return desc ? -cmp : cmp;
        });
        ta.value = lines.join('\n');
    }

    document.getElementById('sort-asc-btn')?.addEventListener('click', () => sortLines(false));
    document.getElementById('sort-desc-btn')?.addEventListener('click', () => sortLines(true));
    document.getElementById('sort-copy-btn')?.addEventListener('click', () => {
        if (!ta.value) return;
        ta.select();
        document.execCommand('copy');
        const b = document.getElementById('sort-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('sort-clear-btn')?.addEventListener('click', () => { ta.value = ''; });
})();

/* -----------------------------------------------
