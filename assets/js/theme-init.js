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

/* Load GA4 early for all pages that include this bootstrap script. */
(function () {
    try {
        var GA_ID = 'G-CWQEQL5KL4';
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID);

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
        document.head.appendChild(script);
    } catch (_) {}
})();
