/* extracted from main.js */
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
    window.tbCopyText(input.value, copyBtn);
    const orig = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    setTimeout(() => { copyBtn.innerText = orig; }, 2000);
}
function showJSONMessage(text, type) {
    const msg = document.getElementById('jsonMessage');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'tool-status ' + (type === 'success' ? 'tool-status--ok' : 'tool-status--error');
}
