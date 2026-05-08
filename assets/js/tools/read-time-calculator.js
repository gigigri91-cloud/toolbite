/* extracted from main.js */
(function () {
    const ta = document.getElementById('read-input');
    const wpmEl = document.getElementById('read-wpm');
    if (!ta || !wpmEl) return;
    const wEl = document.getElementById('read-words');
    const mEl = document.getElementById('read-min');
    const sEl = document.getElementById('read-sec');
    const sumEl = document.getElementById('read-summary');
    function refresh() {
        const wpm = Math.min(400, Math.max(1, parseInt(wpmEl.value, 10) || 200));
        wpmEl.value = wpm;
        const text = ta.value;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const secondsTotal = words / wpm * 60;
        const min = Math.floor(secondsTotal / 60);
        const sec = Math.round(secondsTotal % 60);
        if (wEl) wEl.textContent = words;
        if (mEl) mEl.textContent = words ? String(min) : '0';
        if (sEl) sEl.textContent = words ? String(sec) : '0';
        if (sumEl) {
            sumEl.textContent = words
                ? `About ${min} min ${sec} s at ${wpm} WPM — ${words} words.`
                : 'Paste text to estimate reading time.';
        }
    }
    ta.addEventListener('input', refresh);
    wpmEl.addEventListener('input', refresh);
    document.getElementById('read-clear-btn')?.addEventListener('click', () => { ta.value = ''; refresh(); });
    refresh();
})();

/* -----------------------------------------------
