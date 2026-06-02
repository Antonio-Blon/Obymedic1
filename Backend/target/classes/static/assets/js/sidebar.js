document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }

    if (hamburger) {
        hamburger.addEventListener("click", openSidebar);
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    // SOLO para marcar el enlace activo (sin bloquear la navegación)
    const navLinks = document.querySelectorAll(".sidebar ul li a, .sidebar-menu a");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Solo marcar como activo, NO usar preventDefault()
            navLinks.forEach(l => l.classList.remove("activo"));
            link.classList.add("activo");

            // Cerrar sidebar solo en móvil
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });

    // Marcar el enlace activo según la URL actual al cargar la página
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage || (currentPage === "" && href === "ver.html")) {
            link.classList.add("activo");
        }
    });
});