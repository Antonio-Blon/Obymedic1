(function () {
    const veil = document.createElement('div');
    veil.id = 'page-veil';
    veil.style.cssText = 'position:fixed;inset:0;background:#eef2fb;z-index:99999;opacity:1;transition:opacity .35s ease;pointer-events:none;';
    document.body.appendChild(veil);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        veil.style.opacity = '0';
    }));

    window.fadeNavigate = function (url, delay) {
        veil.style.opacity = '1';
        veil.style.pointerEvents = 'all';
        setTimeout(() => { window.location.href = url; }, delay || 380);
    };
})();
