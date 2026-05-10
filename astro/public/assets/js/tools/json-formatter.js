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
