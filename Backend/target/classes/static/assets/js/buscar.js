document.addEventListener("DOMContentLoaded", () => {
    const btnBuscar = document.getElementById("btnBuscar");
    const dniInput  = document.getElementById("dni");
    const loader    = document.getElementById("dniLoader");

    function buscar() {
        const dni = dniInput.value.trim();
        if (!dni) {
            showToast("Ingrese un DNI válido", "warning");
            return;
        }
        loader.style.display = "flex";
        setTimeout(() => {
            window.location.href = `historial.html?dni=${dni}`;
        }, 2000);
    }

    if (btnBuscar && dniInput) {
        btnBuscar.addEventListener("click", buscar);
        dniInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") buscar();
        });
    }
});