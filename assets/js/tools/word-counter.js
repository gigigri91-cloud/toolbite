(function () {
  const wordInput = document.getElementById('wordCounterInput');
  if (!wordInput) return;

  function updateStats() {
    const text = wordInput.value;
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sentenceCount = document.getElementById('sentenceCount');
    const paragraphCount = document.getElementById('paragraphCount');

    if (charCount) charCount.innerText = text.length;
    if (wordCount) wordCount.innerText = text.trim() === '' ? '0' : String(text.trim().split(/\s+/).length);
    if (sentenceCount) sentenceCount.innerText = text.trim() === '' ? '0' : String(text.split(/[.!?]+/).filter(Boolean).length);
    if (paragraphCount) paragraphCount.innerText = text.trim() === '' ? '0' : String(text.split(/\n+/).filter(Boolean).length);
  }

  wordInput.addEventListener('input', updateStats);

  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      wordInput.value = '';
      updateStats();
    });
  }

  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (!wordInput.value) return;
      wordInput.select();
      document.execCommand('copy');
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      window.setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    });
  }

  updateStats();
})();
