/* extracted from main.js */
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
document.addEventListener('DOMContentLoaded', function() { generatePassword(); });

function copyPassword() {
    const pwdResult = document.getElementById('passwordResult');
    const copyBtn   = document.getElementById('copyBtn');
    if (!pwdResult || !pwdResult.value || pwdResult.value === 'Select at least one option!') return;
    window.tbCopyText(pwdResult.value, copyBtn);
    const orig = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    setTimeout(() => { copyBtn.innerText = orig; }, 2000);
}

