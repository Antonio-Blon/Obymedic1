// ── Toast container ──────────────────────────────────────────
(function () {
    const container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
    window._toastContainer = container;
})();

function showToast(msg, type = "info", duration = 3500) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.setProperty("--duration", `${duration / 1000}s`);

    const icons = { success: "fa-circle-check", error: "fa-circle-xmark", warning: "fa-triangle-exclamation", info: "fa-circle-info" };
    const icon = icons[type] || icons.info;

    toast.innerHTML = `
        <i class="fa-solid ${icon} toast-icon"></i>
        <span class="toast-msg">${msg}</span>
        <button class="toast-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        <div class="toast-bar"></div>
    `;

    window._toastContainer.appendChild(toast);

    const close = toast.querySelector(".toast-close");
    const timer = setTimeout(() => dismiss(toast), duration);

    close.addEventListener("click", () => { clearTimeout(timer); dismiss(toast); });

    function dismiss(t) {
        t.classList.add("hide");
        t.addEventListener("animationend", () => t.remove(), { once: true });
    }
}

// ── Spinner ───────────────────────────────────────────────────
function showSpinner(label = "Cargando...") {
    if (document.getElementById("_spinner")) return;
    const overlay = document.createElement("div");
    overlay.className = "spinner-overlay";
    overlay.id = "_spinner";
    overlay.innerHTML = `
        <div class="spinner-box">
            <div class="spinner-ring"></div>
            <div class="spinner-label">${label}</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideSpinner() {
    const el = document.getElementById("_spinner");
    if (el) el.remove();
}

// ── Confirm modal ─────────────────────────────────────────────
function showConfirm(msg, title = "¿Confirmar acción?") {
    return new Promise(resolve => {
        const backdrop = document.createElement("div");
        backdrop.className = "confirm-backdrop";
        backdrop.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon"><i class="fa-solid fa-circle-question"></i></div>
                <div class="confirm-title">${title}</div>
                <div class="confirm-msg">${msg}</div>
                <div class="confirm-btns">
                    <button class="btn-confirm-cancel">Cancelar</button>
                    <button class="btn-confirm-ok">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        backdrop.querySelector(".btn-confirm-ok").addEventListener("click", () => { backdrop.remove(); resolve(true); });
        backdrop.querySelector(".btn-confirm-cancel").addEventListener("click", () => { backdrop.remove(); resolve(false); });
    });
}
