/* extracted from main.js */
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

if (document.getElementById('paletteContainer')) generatePalette();
