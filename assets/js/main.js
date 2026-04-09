/* --- TOOLBITE MASTER JS --- */

/* -----------------------------------------------
   1. GLOBAL ACCESSIBILITY HELPERS
----------------------------------------------- */
(function () {
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';

    if (!document.querySelector('.skip-link')) {
        const skip = document.createElement('a');
        skip.href = `#${main.id}`;
        skip.className = 'skip-link';
        skip.textContent = 'Skip to main content';
        document.body.insertBefore(skip, document.body.firstChild);
    }
})();

/* -----------------------------------------------
   2. MOBILE MENU TOGGLE
----------------------------------------------- */
(function () {
    const btn  = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    function setMenuOpen(isOpen) {
        menu.classList.toggle('hidden', !isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', () => {
        const isOpen = menu.classList.contains('hidden');
        setMenuOpen(isOpen);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(false);
    });

    document.addEventListener('click', (event) => {
        if (menu.classList.contains('hidden')) return;
        if (menu.contains(event.target) || btn.contains(event.target)) return;
        setMenuOpen(false);
    });

    setMenuOpen(false);
})(); 

/* -----------------------------------------------
   3. HEADER SHRINK ON SCROLL (hysteresis + rAF)
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
   4. FOOTER YEAR
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

    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
        pwdResult.value = 'Secure password generation requires a modern HTTPS browser.';
        return;
    }

    function randomIndex(max) {
        const limit = Math.floor(0x100000000 / max) * max;
        const buffer = new Uint32Array(1);
        let value = 0;
        do {
            window.crypto.getRandomValues(buffer);
            value = buffer[0];
        } while (value >= limit);
        return value % max;
    }

    let pwd = '';
    for (let i = 0; i < length; i++)
        pwd += chars[randomIndex(chars.length)];
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
   13. CASE CONVERTER
----------------------------------------------- */
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
        document.execCommand('copy');
        const b = document.getElementById('copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });
    document.getElementById('clear-btn')?.addEventListener('click', () => { ta.value = ''; });
})();

/* -----------------------------------------------
   14. TEXT TO SLUG
----------------------------------------------- */
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
   15. READ TIME CALCULATOR
----------------------------------------------- */
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
   16. BASE64 ENCODER / DECODER
----------------------------------------------- */
(function () {
    const inp = document.getElementById('b64-input');
    const out = document.getElementById('b64-output');
    if (!inp || !out) return;
    const err = document.getElementById('b64-error');
    const tabEnc = document.getElementById('b64-tab-encode');
    const tabDec = document.getElementById('b64-tab-decode');
    const hint = document.getElementById('b64-mode-hint');
    const runBtn = document.getElementById('b64-run-btn');
    let encodeMode = true;

    function utf8ToB64(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }
    function b64ToUtf8(b64) {
        const clean = b64.trim().replace(/\s/g, '');
        const bin = atob(clean);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    function setMode(enc) {
        encodeMode = enc;
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        if (tabEnc && tabDec) {
            if (enc) {
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-amber-500 text-white text-sm';
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            } else {
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-amber-500 text-white text-sm';
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            }
        }
        if (hint) hint.textContent = enc ? 'Plain text → Base64' : 'Base64 → plain text (UTF-8)';
        if (runBtn) runBtn.textContent = enc ? 'Encode to Base64' : 'Decode from Base64';
    }

    tabEnc?.addEventListener('click', () => setMode(true));
    tabDec?.addEventListener('click', () => setMode(false));
    setMode(true);

    document.getElementById('b64-run-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        try {
            if (encodeMode) {
                out.value = utf8ToB64(inp.value);
            } else {
                out.value = b64ToUtf8(inp.value);
            }
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not decode — check your Base64 string.';
                err.classList.remove('hidden');
            }
            out.value = '';
        }
    });

    document.getElementById('b64-copy-btn')?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const b = document.getElementById('b64-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });

    document.getElementById('b64-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
   17. UUID GENERATOR (v4)
----------------------------------------------- */
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
   18. URL ENCODER / DECODER
----------------------------------------------- */
(function () {
    const inp = document.getElementById('url-input');
    const out = document.getElementById('url-output');
    if (!inp || !out) return;
    const err = document.getElementById('url-error');
    const fullChk = document.getElementById('url-full-url');
    const hint = document.getElementById('url-mode-hint');
    const tabEnc = document.getElementById('url-tab-encode');
    const tabDec = document.getElementById('url-tab-decode');
    let encodeMode = true;

    function syncHint() {
        if (!hint || !fullChk) return;
        const full = fullChk.checked;
        if (encodeMode) {
            hint.textContent = full
                ? 'Encode: full URL — encodeURI (keeps :, /, ?, # in structure).'
                : 'Encode: component — encodeURIComponent (for query values & path segments).';
        } else {
            hint.textContent = full
                ? 'Decode: full URL — decodeURI.'
                : 'Decode: component — decodeURIComponent.';
        }
    }

    function setTabs(enc) {
        encodeMode = enc;
        if (tabEnc && tabDec) {
            if (enc) {
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-emerald-600 text-white text-sm';
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            } else {
                tabDec.className = 'px-4 py-2 rounded-xl font-bold bg-emerald-600 text-white text-sm';
                tabEnc.className = 'px-4 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm';
            }
        }
        const run = document.getElementById('url-run-btn');
        if (run) run.textContent = enc ? 'Encode' : 'Decode';
        syncHint();
    }

    tabEnc?.addEventListener('click', () => setTabs(true));
    tabDec?.addEventListener('click', () => setTabs(false));
    fullChk?.addEventListener('change', syncHint);
    setTabs(true);

    document.getElementById('url-run-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        const full = fullChk && fullChk.checked;
        const s = inp.value;
        try {
            if (encodeMode) {
                out.value = full ? encodeURI(s) : encodeURIComponent(s);
            } else {
                out.value = full ? decodeURI(s) : decodeURIComponent(s);
            }
        } catch (e) {
            out.value = '';
            if (err) {
                err.textContent = e.message || 'Invalid input for this decode mode — try toggling “Full URL mode”.';
                err.classList.remove('hidden');
            }
        }
    });

    document.getElementById('url-copy-btn')?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const b = document.getElementById('url-copy-btn');
        const o = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(() => { b.textContent = o; }, 1500);
    });

    document.getElementById('url-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
   19. SHA-256 / SHA-1 HASH
----------------------------------------------- */
(function () {
    const inp = document.getElementById('hash-input');
    const out = document.getElementById('hash-output');
    const algoSel = document.getElementById('hash-algo');
    const err = document.getElementById('hash-error');
    const copyBtn = document.getElementById('hash-copy-btn');
    if (!inp || !out || !algoSel) return;

    function bufToHex(buffer) {
        return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    document.getElementById('hash-compute-btn')?.addEventListener('click', async () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        out.value = '';
        if (copyBtn) copyBtn.disabled = true;

        if (!window.crypto || !crypto.subtle) {
            if (err) {
                err.textContent = 'Web Crypto API unavailable. Use HTTPS or a modern browser.';
                err.classList.remove('hidden');
            }
            return;
        }

        const algo = algoSel.value;
        try {
            const data = new TextEncoder().encode(inp.value);
            const hashBuf = await crypto.subtle.digest(algo, data);
            out.value = bufToHex(hashBuf);
            if (copyBtn) copyBtn.disabled = false;
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not compute hash.';
                err.classList.remove('hidden');
            }
        }
    });

    copyBtn?.addEventListener('click', () => {
        if (!out.value) return;
        out.select();
        document.execCommand('copy');
        const o = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = o; }, 1500);
    });

    document.getElementById('hash-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        out.value = '';
        if (copyBtn) copyBtn.disabled = true;
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    });
})();

/* -----------------------------------------------
   20. REMOVE DUPLICATE LINES
----------------------------------------------- */
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
        document.execCommand('copy');
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
   21. SORT TEXT LINES
----------------------------------------------- */
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
   22. JWT DECODER
----------------------------------------------- */
(function () {
    const inp = document.getElementById('jwt-input');
    if (!inp) return;
    const err = document.getElementById('jwt-error');
    const headOut = document.getElementById('jwt-header-out');
    const payOut = document.getElementById('jwt-payload-out');
    const sigInfo = document.getElementById('jwt-sig-info');

    function base64UrlToBytes(b64url) {
        let s = b64url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad) s += '='.repeat(4 - pad);
        const bin = atob(s);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    function decodeSegment(seg) {
        const json = new TextDecoder().decode(base64UrlToBytes(seg));
        const obj = JSON.parse(json);
        return JSON.stringify(obj, null, 2);
    }

    function clearOut() {
        if (headOut) headOut.textContent = '';
        if (payOut) payOut.textContent = '';
        if (sigInfo) sigInfo.textContent = '—';
    }

    document.getElementById('jwt-decode-btn')?.addEventListener('click', () => {
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        clearOut();
        const raw = inp.value.trim();
        if (!raw) {
            if (err) { err.textContent = 'Paste a JWT first.'; err.classList.remove('hidden'); }
            return;
        }
        const parts = raw.split('.');
        if (parts.length < 2) {
            if (err) { err.textContent = 'Expected at least two segments (header.payload…).'; err.classList.remove('hidden'); }
            return;
        }
        try {
            if (headOut) headOut.textContent = decodeSegment(parts[0]);
            if (payOut) payOut.textContent = decodeSegment(parts[1]);
            if (sigInfo) {
                if (parts.length > 2) {
                    sigInfo.textContent = `${parts[2].length} chars (not verified)`;
                } else {
                    sigInfo.textContent = 'none (unsecured JWT)';
                }
            }
        } catch (e) {
            if (err) {
                err.textContent = e.message || 'Could not decode — invalid Base64url or JSON.';
                err.classList.remove('hidden');
            }
            clearOut();
        }
    });

    document.getElementById('jwt-clear-btn')?.addEventListener('click', () => {
        inp.value = '';
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
        clearOut();
    });
})();

/* -----------------------------------------------
   23. CATEGORY FILTER + SHARE HELPERS
----------------------------------------------- */
(function () {
    const copyButtons = document.querySelectorAll('.copy-tool-link');
    copyButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const orig = btn.textContent;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                } else {
                    const tmp = document.createElement('input');
                    tmp.value = window.location.href;
                    document.body.appendChild(tmp);
                    tmp.select();
                    document.execCommand('copy');
                    document.body.removeChild(tmp);
                }
                btn.textContent = 'Link copied!';
            } catch (_) {
                btn.textContent = 'Could not copy';
            }
            setTimeout(() => { btn.textContent = orig; }, 1500);
        });
    });

    const searchInput = document.getElementById('category-search');
    const grid = document.getElementById('category-tools-grid');
    if (searchInput && grid) {
        const cards = Array.from(grid.querySelectorAll('a[href*="/tools/"], a[href^="../tools/"], a[href^="tools/"]'));
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim().toLowerCase();
            cards.forEach((card) => {
                const hay = card.textContent.toLowerCase();
                card.classList.toggle('hidden', !!q && !hay.includes(q));
            });
        });
    }

    if (window.location.pathname.includes('/tools/') && window.matchMedia('(min-width: 1024px)').matches) {
        const holder = document.createElement('div');
        holder.className = 'fixed left-4 bottom-4 z-40';
        holder.innerHTML = '<button type="button" id="quick-copy-tool-link" aria-label="Copy this tool URL" class="px-4 py-3 rounded-xl shadow-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition">Copy tool URL</button>';
        document.body.appendChild(holder);
        const quickBtn = document.getElementById('quick-copy-tool-link');
        quickBtn?.addEventListener('click', async () => {
            const original = quickBtn.textContent;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                } else {
                    const tmp = document.createElement('input');
                    tmp.value = window.location.href;
                    document.body.appendChild(tmp);
                    tmp.select();
                    document.execCommand('copy');
                    document.body.removeChild(tmp);
                }
                quickBtn.textContent = 'Copied!';
            } catch (_) {
                quickBtn.textContent = 'Copy failed';
            }
            setTimeout(() => { quickBtn.textContent = original; }, 1500);
        });
    }
})();

/* -----------------------------------------------
   24. DEFERRED ADSENSE + LAZY BMC WIDGET
----------------------------------------------- */
(function () {
    let adsInitialized = false;
    let bmcScheduled = false;
    let bmcInjected = false;
    let bmcTimer = null;

    function labelAdSlots() {
        const adNodes = document.querySelectorAll('ins.adsbygoogle');
        adNodes.forEach((node) => {
            const prev = node.previousElementSibling;
            if (prev && prev.classList.contains('ad-slot-label')) return;
            const label = document.createElement('div');
            label.className = 'ad-slot-label';
            label.textContent = 'Advertisement';
            node.parentNode?.insertBefore(label, node);
        });
    }

    function initAdSlots() {
        if (adsInitialized) return;
        adsInitialized = true;
        const adNodes = document.querySelectorAll('ins.adsbygoogle');
        if (!adNodes.length) return;
        const adQueue = window.adsbygoogle = window.adsbygoogle || [];
        adNodes.forEach(() => {
            try { adQueue.push({}); } catch (_) {}
        });
    }

    function scheduleAdBootstrap() {
        const run = () => window.setTimeout(initAdSlots, 250);
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(run, { timeout: 2200 });
        } else {
            window.setTimeout(run, 1200);
        }
    }

    function injectBuyMeACoffee() {
        if (bmcInjected) return;
        bmcInjected = true;
        const cfg = document.getElementById('bmc-widget-config');
        if (!cfg || document.querySelector('script[data-name="BMC-Widget"]')) return;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
        script.async = true;
        script.setAttribute('data-name', 'BMC-Widget');
        script.setAttribute('data-cfasync', 'false');

        ['id', 'description', 'message', 'color', 'position', 'x_margin', 'y_margin'].forEach((name) => {
            const value = cfg.getAttribute(`data-${name}`);
            if (value) script.setAttribute(`data-${name}`, value);
        });

        document.body.appendChild(script);
    }

    function scheduleBmcLoad() {
        if (bmcScheduled) return;
        bmcScheduled = true;
        if (bmcTimer) window.clearTimeout(bmcTimer);
        bmcTimer = window.setTimeout(injectBuyMeACoffee, 300);
        detachBmcTriggers();
    }

    const bmcTriggerEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    function attachBmcTriggers() {
        bmcTriggerEvents.forEach((eventName) => {
            window.addEventListener(eventName, scheduleBmcLoad, { once: true, passive: true });
        });
    }
    function detachBmcTriggers() {
        bmcTriggerEvents.forEach((eventName) => {
            window.removeEventListener(eventName, scheduleBmcLoad, { passive: true });
        });
    }

    function bootstrapThirdParty() {
        labelAdSlots();
        scheduleAdBootstrap();
        attachBmcTriggers();

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(scheduleBmcLoad, { timeout: 9000 });
        }
        window.setTimeout(scheduleBmcLoad, 7000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapThirdParty, { once: true });
    } else {
        bootstrapThirdParty();
    }
})();

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('passwordResult')) generatePassword();
    if (document.getElementById('paletteContainer')) generatePalette();
});
