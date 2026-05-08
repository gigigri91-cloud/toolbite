/* extracted from main.js */
(function () {
    const ta = document.getElementById('case-input');
    if (!ta) return;
    const toTitle = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const toSentence = (s) => {
        if (!s) return '';
        const t = s.toLowerCase();
        return t.charAt(0).toUpperCase() + t.slice(1).replace(/([.!?]\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase());
    };
    const toCamel = (text) => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return '';
        return words[0].toLowerCase() + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    };
    document.getElementById('btn-upper')?.addEventListener('click', () => { ta.value = ta.value.toUpperCase(); });
    document.getElementById('btn-lower')?.addEventListener('click', () => { ta.value = ta.value.toLowerCase(); });
    document.getElementById('btn-title')?.addEventListener('click', () => { ta.value = toTitle(ta.value); });
    document.getElementById('btn-sentence')?.addEventListener('click', () => { ta.value = toSentence(ta.value); });
    document.getElementById('btn-camel')?.addEventListener('click', () => { ta.value = toCamel(ta.value); });
    document.getElementById('copy-btn')?.addEventListener('click', () => {
        if (!ta.value) return;
        ta.select();
        window.tbCopyText(ta.value, document.getElementById('copy-btn'));
        const b = document.getElementById('copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('clear-btn')?.addEventListener('click', () => { ta.value = ''; });
})();

/* -----------------------------------------------
