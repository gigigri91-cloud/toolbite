/* --- TOOLBITE MASTER JS --- */

// 1. GLOBAL SEARCH (Homepage)
const searchInput = document.getElementById('toolSearch');
const toolsGrid = document.getElementById('toolsGrid');

if (searchInput && toolsGrid) {
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        Array.from(toolsGrid.getElementsByClassName('tool-card')).forEach(card => {
            const text = card.textContent || card.innerText;
            card.style.display = text.toLowerCase().includes(filter) ? "" : "none";
        });
    });
}

// 2. WORD COUNTER LOGIC
const wordInput = document.getElementById('wordCounterInput');
if (wordInput) {
    wordInput.addEventListener('input', () => {
        const text = wordInput.value;
        document.getElementById('charCount').innerText = text.length;
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        document.getElementById('wordCount').innerText = words;
        const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
        const sentenceEl = document.getElementById('sentenceCount');
        if(sentenceEl) sentenceEl.innerText = sentences;
    });
}

// 3. JSON FORMATTER LOGIC
function formatJSON() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonMessage = document.getElementById('jsonMessage');
    if(!jsonInput || jsonInput.value.trim() === '') return;
    
    try {
        const parsed = JSON.parse(jsonInput.value);
        jsonInput.value = JSON.stringify(parsed, null, 2);
        jsonMessage.className = 'status-message status-success';
        jsonMessage.innerText = '✓ Valid JSON. Formatted successfully.';
    } catch (e) {
        jsonMessage.className = 'status-message status-error';
        jsonMessage.innerText = '✗ Invalid JSON: ' + e.message;
    }
}

// 4. PASSWORD GENERATOR LOGIC
function generatePassword() {
    const pwdResult = document.getElementById('passwordResult');
    if(!pwdResult) return;
    
    const length = document.getElementById('pwdLength').value;
    let chars = "";
    if (document.getElementById('incUppercase').checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (document.getElementById('incLowercase').checked) chars += "abcdefghijklmnopqrstuvwxyz";
    if (document.getElementById('incNumbers').checked) chars += "0123456789";
    if (document.getElementById('incSymbols').checked) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    if (chars === "") {
        pwdResult.value = "Select at least one option!";
        return;
    }
    
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    pwdResult.value = password;
}

// 5. GLOBAL UTILS (Copy Function)
function copyValue(inputId, btnId) {
    const input = document.getElementById(inputId);
    if(!input || input.value === "") return;
    
    input.select();
    navigator.clipboard.writeText(input.value);
    
    const btn = document.getElementById(btnId);
    if(btn) {
        const originalText = btn.innerText;
        btn.innerText = "✓ Copied!";
        setTimeout(() => btn.innerText = originalText, 2000);
    }
}

// Initialize tools on page load if elements exist
window.onload = () => {
    if (document.getElementById('passwordResult')) generatePassword();
};