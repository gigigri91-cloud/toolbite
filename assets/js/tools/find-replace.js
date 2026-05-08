/* extracted from main.js */
(function () {
    const replaceBtn = document.getElementById('replace-btn');
    if (!replaceBtn) return;
    const input      = document.getElementById('main-input');
    const findTxt    = document.getElementById('find-query');
    const replaceTxt = document.getElementById('replace-query');
    const caseCheck  = document.getElementById('case-sensitive');
    const copyBtn    = document.getElementById('copy-btn');
    const clearBtn   = document.getElementById('clear-btn');

    replaceBtn.onclick = () => {
        const f = findTxt.value;
        if (!f) return;
        const flags = caseCheck.checked ? 'g' : 'gi';
        const regex = new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        input.value = input.value.replace(regex, replaceTxt.value);
        replaceBtn.textContent = 'Done!';
        setTimeout(() => replaceBtn.textContent = 'Replace All', 1500);
    };
    if (clearBtn) clearBtn.onclick = () => { input.value = ''; };
    if (copyBtn) copyBtn.onclick = () => {
        if (!input.value) return;
        window.tbCopyText(input.value, copyBtn);
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.replace('bg-gray-100', 'bg-green-100');
        setTimeout(() => {
            copyBtn.textContent = orig;
            copyBtn.classList.replace('bg-green-100', 'bg-gray-100');
        }, 2000);
    };
})();

/* -----------------------------------------------
