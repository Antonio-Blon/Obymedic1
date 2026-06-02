const API = (() => {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') {
        return 'http://localhost:8080/api';
    }
    return '/api'; // mismo servidor en producción
})();

function getAuthHeaders(extra) {
    const token = sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session');
    return Object.assign({ 'X-Auth-Token': token }, extra);
}
