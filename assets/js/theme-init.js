/* Apply saved or system theme before first paint. Keep in sync with main.js (STORAGE_KEY). */
(function () {
    try {
        var KEY = 'toolbite-theme';
        var root = document.documentElement;
        var storedTheme = localStorage.getItem(KEY);
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var initialTheme = (storedTheme === 'dark' || storedTheme === 'light')
            ? storedTheme
            : (prefersDark ? 'dark' : 'light');
        root.setAttribute('data-theme', initialTheme);
    } catch (_) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();
