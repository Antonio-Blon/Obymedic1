// Protege cada página — redirige al login si no hay sesión activa
(function () {
    const activa = sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session');
    if (!activa) {
        window.location.replace('login.html');
    }

    const nombre = sessionStorage.getItem('doctorNombre') || localStorage.getItem('doctorNombre');
    if (nombre) {
        const el = document.getElementById('nombreDoctor');
        if (el) {
            const partes = nombre.trim().split(/\s+/);
            const prefijos = ['dr.', 'dra.', 'dr', 'dra'];
            const primerNombre = prefijos.includes(partes[0].toLowerCase()) ? partes[1] : partes[0];
            el.textContent = primerNombre || nombre;
        }
    }
})();

function logout() {
    sessionStorage.removeItem('obs_session');
    localStorage.removeItem('obs_session');
    window.location.replace('login.html');
}
