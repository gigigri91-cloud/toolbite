/* Apply saved or system theme before first paint. Keep in sync with main.js (STORAGE_KEY). */
(function () {
    try {
        var KEY = 'toolbite-theme';
        var root = document.documentElement;
        var stored = localStorage.getItem(KEY);
        if (stored === 'dark') {
            root.classList.add('dark');
        } else if (stored === 'light') {
            root.classList.remove('dark');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
        }
    } catch (_) {}
})();
