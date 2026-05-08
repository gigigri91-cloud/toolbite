/* extracted from main.js */
(function () {
    const genBtn = document.getElementById('gen-btn');
    if (!genBtn) return;
    const out    = document.getElementById('out');
    const copyBtn = document.getElementById('copy-btn');
    const BLOCK = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    genBtn.onclick = () => {
        let n = parseInt(document.getElementById('para-count').value, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > 50) n = 50;
        out.value = Array(n).fill(BLOCK).join('\n\n');
    };
    if (copyBtn) copyBtn.onclick = () => {
        if (!out.value) return;
        out.select(); document.execCommand('copy');
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
    };
    genBtn.click();
})();

/* -----------------------------------------------
