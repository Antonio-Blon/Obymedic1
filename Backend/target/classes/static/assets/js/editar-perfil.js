const nombreGuardado   = sessionStorage.getItem('doctorNombre') || localStorage.getItem('doctorNombre') || '';
const usernameGuardado = sessionStorage.getItem('doctorUsername') || localStorage.getItem('doctorUsername') || '';
document.getElementById('nombre').value   = nombreGuardado;
document.getElementById('username').value = usernameGuardado;

function togglePass(inputId, btnId) {
    document.getElementById(btnId).addEventListener('click', () => {
        const inp = document.getElementById(inputId);
        const vis = inp.type === 'text';
        inp.type = vis ? 'password' : 'text';
        document.getElementById(btnId).querySelector('i').className =
            vis ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });
}
togglePass('password', 'btnToggle1');
togglePass('confirm',  'btnToggle2');

function mostrarError(msg) {
    document.getElementById('errorRegTexto').textContent = msg;
    document.getElementById('errorReg').style.display = 'flex';
    document.getElementById('successMsg').style.display = 'none';
}

document.getElementById('btnActualizar').addEventListener('click', async () => {
    document.getElementById('errorReg').style.display    = 'none';
    document.getElementById('successMsg').style.display  = 'none';

    const nombre   = document.getElementById('nombre').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm').value;

    if (!nombre || !username) {
        mostrarError('El nombre y el usuario son obligatorios'); return;
    }
    if (password && password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres'); return;
    }
    if (password !== confirm) {
        mostrarError('Las contraseñas no coinciden'); return;
    }

    const token = sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session');
    if (!token) { mostrarError('Debes estar autenticado'); return; }

    const btn = document.getElementById('btnActualizar');
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display    = 'none';
    btn.querySelector('.btn-spinner').style.display = 'inline';

    const body = { nombre, username };
    if (password) body.password = password;

    try {
        const res = await fetch(`${API}/auth/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.ok) {
            const store = localStorage.getItem('obs_session') ? localStorage : sessionStorage;
            store.setItem('doctorNombre', nombre);
            store.setItem('doctorUsername', username);
            document.getElementById('successMsg').style.display = 'flex';
            setTimeout(() => window.location.replace('panel.html'), 1500);
        } else {
            mostrarError(data.error || 'Error al actualizar');
        }
    } catch {
        mostrarError('Error de conexión al servidor');
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').style.display    = 'inline';
        btn.querySelector('.btn-spinner').style.display = 'none';
    }
});
