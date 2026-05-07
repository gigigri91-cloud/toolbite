(function () {
  if (document.querySelector('.bmc-btn')) return;
  var bmc = document.createElement('a');
  bmc.href = 'https://buymeacoffee.com/supportourdev';
  bmc.target = '_blank';
  bmc.rel = 'noopener noreferrer';
  bmc.className = 'bmc-btn';
  bmc.setAttribute('aria-label', 'Support ToolBite on Buy Me a Coffee');
  bmc.innerHTML = '<img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="" width="20" height="20" style="display:block" loading="lazy"> Support us';
  document.body.appendChild(bmc);
}());
