/* --- TOOLBITE MASTER JS --- */

/* -----------------------------------------------
   1. MOBILE MENU TOGGLE
----------------------------------------------- */
(function () {
    const btn  = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
})();

/* -----------------------------------------------
   2. HEADER SHRINK ON SCROLL (hysteresis + rAF)
----------------------------------------------- */
(function () {
    const header = document.getElementById('site-header');
    if (!header) return;
    const shrinkAfter = 56, growBelow = 24;
    let ticking = false, isSmall = false;
    function sync() {
        ticking = false;
        const y = window.scrollY || document.documentElement.scrollTop;
        if (!isSmall && y > shrinkAfter)  { isSmall = true;  header.classList.add('header-small'); }
        else if (isSmall && y < growBelow) { isSmall = false; header.classList.remove('header-small'); }
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
})();

/* -----------------------------------------------
   3. FOOTER YEAR
----------------------------------------------- */
(function () {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* -----------------------------------------------
   4. WORD COUNTER
----------------------------------------------- */
(function () {
    const wordInput = document.getElementById('wordCounterInput');
    if (!wordInput) return;
    wordInput.addEventListener('input', () => {
        const text = wordInput.value;
        document.getElementById('charCount').innerText = text.length;
        document.getElementById('wordCount').innerText =
            text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const sentEl = document.getElementById('sentenceCount');
        if (sentEl) sentEl.innerText =
            text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
        const paraEl = document.getElementById('paragraphCount');
        if (paraEl) paraEl.innerText =
            text.trim() === '' ? 0 : text.split(/\n+/).filter(Boolean).length;
    });

    const copyBtn  = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) clearBtn.onclick = () => {
        wordInput.value = '';
        wordInput.dispatchEvent(new Event('input'));
    };
    if (copyBtn) copyBtn.onclick = () => {
        if (!wordInput.value) return;
        wordInput.select();
        document.execCommand('copy');
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
   5. JSON FORMATTER
----------------------------------------------- */
function formatJSON() {
    const input = document.getElementById('jsonInput');
    const msg   = document.getElementById('jsonMessage');
    if (!input || !input.value.trim()) return;
    try {
        input.value = JSON.stringify(JSON.parse(input.value), null, 2);
        showJSONMessage('✓ Valid JSON — formatted successfully.', 'success');
    } catch (e) { showJSONMessage('✗ Invalid JSON: ' + e.message, 'error'); }
}
function minifyJSON() {
    const input = document.getElementById('jsonInput');
    if (!input || !input.value.trim()) return;
    try {
        input.value = JSON.stringify(JSON.parse(input.value));
        showJSONMessage('✓ Valid JSON — minified successfully.', 'success');
    } catch (e) { showJSONMessage('✗ Invalid JSON: ' + e.message, 'error'); }
}
function clearJSON() {
    const input = document.getElementById('jsonInput');
    const msg   = document.getElementById('jsonMessage');
    if (input) input.value = '';
    if (msg)   msg.className = 'hidden';
}
function copyJSON() {
    const input  = document.getElementById('jsonInput');
    const copyBtn = document.getElementById('copyBtn');
    if (!input || !input.value) return;
    input.select(); document.execCommand('copy');
    const orig = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    copyBtn.classList.replace('bg-gray-800', 'bg-green-600');
    copyBtn.classList.replace('hover:bg-gray-900', 'hover:bg-green-700');
    setTimeout(() => {
        copyBtn.innerText = orig;
        copyBtn.classList.replace('bg-green-600', 'bg-gray-800');
        copyBtn.classList.replace('hover:bg-green-700', 'hover:bg-gray-900');
    }, 2000);
}
function showJSONMessage(text, type) {
    const msg = document.getElementById('jsonMessage');
    if (!msg) return;
    msg.textContent = text;
    msg.className = `mt-4 p-4 rounded-xl font-medium border ${type === 'success'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-700 border-red-200'} block`;
}

/* -----------------------------------------------
   6. PASSWORD GENERATOR
----------------------------------------------- */
function generatePassword() {
    const pwdResult = document.getElementById('passwordResult');
    if (!pwdResult) return;
    const length = document.getElementById('pwdLength').value;
    let chars = '';
    if (document.getElementById('incUppercase').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('incLowercase').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('incNumbers').checked)   chars += '0123456789';
    if (document.getElementById('incSymbols').checked)   chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    if (!chars) { pwdResult.value = 'Select at least one option!'; return; }
    let pwd = '';
    for (let i = 0; i < length; i++)
        pwd += chars[Math.floor(Math.random() * chars.length)];
    pwdResult.value = pwd;
}
function copyPassword() {
    const pwdResult = document.getElementById('passwordResult');
    const copyBtn   = document.getElementById('copyBtn');
    if (!pwdResult || !pwdResult.value || pwdResult.value === 'Select at least one option!') return;
    pwdResult.select(); document.execCommand('copy');
    copyBtn.innerText = 'Copied!';
    copyBtn.classList.replace('bg-blue-600', 'bg-green-500');
    setTimeout(() => {
        copyBtn.innerText = 'Copy';
        copyBtn.classList.replace('bg-green-500', 'bg-blue-600');
    }, 2000);
}

/* -----------------------------------------------
   7. FIND & REPLACE
----------------------------------------------- */
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
        input.select(); document.execCommand('copy');
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
   8. REMOVE EXTRA SPACES
----------------------------------------------- */
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
   9. LOREM IPSUM GENERATOR
----------------------------------------------- */
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
   10. COLOR PALETTE GENERATOR
----------------------------------------------- */
function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}
function copyColor(color, element) {
    const tmp = document.createElement('input');
    tmp.value = color;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    const span = element.querySelector('span');
    const orig = span.innerText;
    span.innerText = 'Copied!';
    span.classList.add('text-green-600');
    setTimeout(() => { span.innerText = orig; span.classList.remove('text-green-600'); }, 1500);
}
function generatePalette() {
    const container = document.getElementById('paletteContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const color = generateRandomColor();
        const div   = document.createElement('div');
        div.className = 'flex flex-col items-center justify-end h-32 md:h-48 rounded-2xl cursor-pointer transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group border border-gray-100';
        div.style.backgroundColor = color;
        div.onclick = () => copyColor(color, div);
        const span  = document.createElement('span');
        span.className = 'mb-4 bg-white/95 backdrop-blur shadow-sm text-gray-800 font-bold py-2 px-4 rounded-xl text-sm transition-colors duration-200 group-hover:bg-white';
        span.innerText = color;
        div.appendChild(span);
        container.appendChild(div);
    }
}

/* -----------------------------------------------
   11. IMAGE COMPRESSOR
----------------------------------------------- */
(function () {
    const fileIn = document.getElementById('file-in');
    if (!fileIn) return;
    const btn     = document.getElementById('compress-btn');
    const cv      = document.getElementById('cv');
    const ctx     = cv ? cv.getContext('2d') : null;
    const img     = new Image();
    const dl      = document.getElementById('dl');
    const stats   = document.getElementById('stats');
    const qInput  = document.getElementById('quality');
    const mimeSel = document.getElementById('mime-out');
    const hint    = document.getElementById('hint');
    let lastBlobUrl = null;

    if (qInput) qInput.addEventListener('input', () => {
        document.getElementById('q-val').textContent = qInput.value;
    });

    fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        dl.classList.add('hidden');
        stats.textContent = '';
        if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null; }
        if (!f) { btn.disabled = true; return; }
        const url = URL.createObjectURL(f);
        img.onload = () => {
            URL.revokeObjectURL(url);
            cv.width = img.naturalWidth; cv.height = img.naturalHeight;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, 0, 0);
            btn.disabled = false;
            hint.classList.toggle('hidden', f.type !== 'image/png');
        };
        img.onerror = () => { URL.revokeObjectURL(url); btn.disabled = true; };
        img.src = url;
    });

    if (btn) btn.addEventListener('click', () => {
        const mime = mimeSel.value;
        const q    = parseFloat(qInput.value);
        cv.toBlob(blob => {
            if (!blob) { stats.textContent = 'Could not compress. Try another format.'; return; }
            if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
            lastBlobUrl = URL.createObjectURL(blob);
            dl.href = lastBlobUrl;
            dl.download = mime === 'image/webp' ? 'compressed.webp' : 'compressed.jpg';
            dl.classList.remove('hidden');
            const orig = fileIn.files[0];
            stats.textContent = `Original ~ ${(orig.size / 1024).toFixed(1)} KB → compressed ~ ${(blob.size / 1024).toFixed(1)} KB`;
        }, mime, q);
    });
})();

/* -----------------------------------------------
   12. ON LOAD — auto-init tools that need it
----------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('passwordResult')) generatePassword();
    if (document.getElementById('paletteContainer')) generatePalette();
});
