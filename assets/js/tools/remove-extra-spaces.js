/* extracted from main.js */
(function () {
    const ta = document.getElementById('text-in');
    if (!ta) return;
    const collapseBtn  = document.getElementById('btn-collapse');
    const linesBtn     = document.getElementById('btn-lines');
    const noblanksBtn  = document.getElementById('btn-noblanks');
    const copyBtn      = document.getElementById('copy-btn');
    const clearBtn     = document.getElementById('clear-btn');

    if (collapseBtn) collapseBtn.onclick = () => { ta.value = ta.value.replace(/\s+/g, ' ').trim(); };
    if (linesBtn)    linesBtn.onclick    = () => { ta.value = ta.value.split(/\r?\n/).map(l => l.trim()).join('\n'); };
    if (noblanksBtn) noblanksBtn.onclick = () => { ta.value = ta.value.split(/\r?\n/).filter(l => l.trim()).join('\n'); };
    if (clearBtn)    clearBtn.onclick    = () => { ta.value = ''; };
    if (copyBtn) copyBtn.onclick = () => {
        if (!ta.value) return;
        ta.select(); document.execCommand('copy');
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
    };
})();

/* -----------------------------------------------
