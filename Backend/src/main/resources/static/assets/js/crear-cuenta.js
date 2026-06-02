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
}

document.getElementById('btnCrear').addEventListener('click', async () => {
    document.getElementById('errorReg').style.display = 'none';

    const nombre   = document.getElementById('nombre').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm').value;

    if (!nombre || !username || !password || !confirm) {
        mostrarError('Todos los campos son obligatorios'); return;
    }
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres'); return;
    }
    if (password !== confirm) {
        mostrarError('Las contraseñas no coinciden'); return;
    }

    const token = sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session');
    if (!token) { mostrarError('Debes estar autenticado para crear una cuenta'); return; }

    const btn = document.getElementById('btnCrear');
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display    = 'none';
    btn.querySelector('.btn-spinner').style.display = 'inline';

    try {
        const res = await fetch(`${API}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            body: JSON.stringify({ nombre, username, password, codigoInvitacion: 'Obym@2024' })
        });
        const data = await res.json();

        if (res.ok) {
            window.location.replace('panel.html');
        } else {
            mostrarError(data.error || 'Error al crear la cuenta');
            btn.disabled = false;
            btn.querySelector('.btn-text').style.display    = 'inline';
            btn.querySelector('.btn-spinner').style.display = 'none';
        }
    } catch {
        mostrarError('Error de conexión al servidor');
        btn.disabled = false;
        btn.querySelector('.btn-text').style.display    = 'inline';
        btn.querySelector('.btn-spinner').style.display = 'none';
    }
});
