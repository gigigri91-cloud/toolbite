/* extracted from main.js */
(function () {
    const ta = document.getElementById('dup-input');
    if (!ta) return;
    const trimChk = document.getElementById('dup-trim-compare');
    const stats = document.getElementById('dup-stats');

    function runDedupe() {
        const lines = ta.value.split(/\r?\n/);
        const useTrim = trimChk && trimChk.checked;
        const seen = new Set();
        const out = [];
        for (const line of lines) {
            const key = useTrim ? line.trim() : line;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(line);
        }
        const removed = lines.length - out.length;
        ta.value = out.join('\n');
        if (stats) {
            stats.textContent = removed > 0
                ? `${lines.length} lines → ${out.length} lines (${removed} duplicate${removed === 1 ? '' : 's'} removed).`
                : 'No duplicate lines found (or empty input).';
        }
    }

    document.getElementById('dup-run-btn')?.addEventListener('click', runDedupe);
    document.getElementById('dup-copy-btn')?.addEventListener('click', () => {
        if (!ta.value) return;
        ta.select();
        window.tbCopyText(ta.value, document.getElementById('dup-copy-btn'));
        const b = document.getElementById('dup-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('dup-clear-btn')?.addEventListener('click', () => {
        ta.value = '';
        if (stats) stats.textContent = '';
    });
})();

/* -----------------------------------------------
