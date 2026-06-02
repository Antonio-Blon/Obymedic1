if (localStorage.getItem('obs_session') || sessionStorage.getItem('obs_session')) {
    window.location.replace('panel.html');
}
if (sessionStorage.getItem('admin_token')) {
    window.location.replace('admin.html');
}

const AV_COLORS = ['av-0','av-1','av-2','av-3'];

function iniciales(nombre) {
    const p = nombre.trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase();
}

// ── Elementos comunes ──
const chkRecordar = document.getElementById('chkRecordar');
const loginForm   = document.getElementById('loginForm');
const errorBox    = document.getElementById('loginError');
const btnSubmit   = document.getElementById('btnLogin');

// ── Toggle contraseña (formulario clásico) ──
document.getElementById('btnTogglePass').addEventListener('click', () => {
    const inp = document.getElementById('inputPass');
    const vis = inp.type === 'text';
    inp.type = vis ? 'password' : 'text';
    document.getElementById('btnTogglePass').querySelector('i').className =
        vis ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
});

// ── Toggle contraseña (panel perfil) ──
document.getElementById('btnTogglePerfilPass').addEventListener('click', () => {
    const inp = document.getElementById('perfilPass');
    const vis = inp.type === 'text';
    inp.type = vis ? 'password' : 'text';
    document.getElementById('btnTogglePerfilPass').querySelector('i').className =
        vis ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
});

// ── Función de login compartida ──
async function doLogin(username, password, btn, onError) {
    btn.classList.add('loading');
    btn.querySelector('.btn-text').style.display    = 'none';
    btn.querySelector('.btn-spinner').style.display = 'inline';
    btn.disabled = true;

    try {
        const res  = await fetch(`${API}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.role === 'admin') {
                sessionStorage.setItem('admin_token', data.token);
                setTimeout(() => window.location.replace('admin.html'), 700);
            } else {
                // Limpiar valores viejos de ambos storages
                ['obs_session','doctorId','doctorNombre','doctorUsername'].forEach(k => {
                    sessionStorage.removeItem(k); localStorage.removeItem(k);
                });
                const store = chkRecordar && chkRecordar.checked ? localStorage : sessionStorage;
                store.setItem('obs_session', data.token);
                if (data.doctorId) store.setItem('doctorId', data.doctorId);
                if (data.nombre)   store.setItem('doctorNombre', data.nombre);
                setTimeout(() => window.location.replace('panel.html'), 700);
            }
            return;
        }
        throw new Error();
    } catch {
        btn.classList.remove('loading');
        btn.querySelector('.btn-text').style.display    = 'inline';
        btn.querySelector('.btn-spinner').style.display = 'none';
        btn.disabled = false;
        onError();
    }
}

// ── Formulario clásico ──
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    const user = document.getElementById('inputUser').value.trim();
    const pass = document.getElementById('inputPass').value;
    doLogin(user, pass, btnSubmit, () => {
        errorBox.style.display = 'flex';
        document.getElementById('inputPass').value = '';
        document.getElementById('inputPass').focus();
        loginForm.classList.add('shake');
        loginForm.addEventListener('animationend', () => loginForm.classList.remove('shake'), { once: true });
    });
});

// ── Perfiles ──
let selectedUsername = null;

function renderPerfiles(doctores) {
    const grid = document.getElementById('perfilesGrid');
    grid.innerHTML = '';
    doctores.forEach((d, i) => {
        const card = document.createElement('div');
        card.className = 'perfil-card';
        card.innerHTML = `
            <div class="perfil-avatar ${AV_COLORS[i % 4]}">${iniciales(d.nombre)}</div>
            <div class="perfil-nombre">${d.nombre}</div>`;
        card.addEventListener('click', () => seleccionar(d, i));
        card.addEventListener('dblclick', () => deseleccionar());
        grid.appendChild(card);
    });
}

function deseleccionar() {
    document.querySelectorAll('.perfil-card').forEach(c => c.classList.remove('selected'));
    selectedUsername = null;
    document.getElementById('perfilPassPanel').style.display = 'none';
    document.getElementById('perfilesError').style.display  = 'none';
}

function seleccionar(doctor, idx) {
    document.querySelectorAll('.perfil-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.perfil-card')[idx].classList.add('selected');
    selectedUsername = doctor.username;

    const color = AV_COLORS[idx % 4];
    const mini  = document.getElementById('perfilMiniAvatar');
    mini.className   = `perfil-mini-avatar ${color}`;
    mini.textContent = iniciales(doctor.nombre);
    document.getElementById('perfilNombreLabel').textContent = doctor.nombre;

    const panel = document.getElementById('perfilPassPanel');
    panel.style.display = 'block';
    document.getElementById('perfilPass').value = '';
    document.getElementById('perfilPass').focus();
    document.getElementById('perfilesError').style.display = 'none';
}

document.getElementById('btnPerfilIngresar').addEventListener('click', () => {
    if (!selectedUsername) return;
    const pass  = document.getElementById('perfilPass').value;
    const btn   = document.getElementById('btnPerfilIngresar');
    const errEl = document.getElementById('perfilesError');
    errEl.style.display = 'none';
    doLogin(selectedUsername, pass, btn, () => {
        errEl.style.display = 'flex';
        document.getElementById('perfilPass').value = '';
        document.getElementById('perfilPass').focus();
    });
});

document.getElementById('perfilPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnPerfilIngresar').click();
});

// Botón admin → vuelve al formulario clásico
document.getElementById('btnModoAdmin').addEventListener('click', () => {
    document.getElementById('perfilesSection').style.display = 'none';
    loginForm.style.display = 'block';
    document.getElementById('inputUser').focus();
});

// ── Inicialización ──
async function init() {
    try {
        const res     = await fetch(`${API}/auth/doctores-lista`);
        const doctores = await res.json();
        if (doctores.length > 0) {
            loginForm.style.display = 'none';
            document.getElementById('perfilesSection').style.display = 'block';
            renderPerfiles(doctores);
        }
    } catch { /* si falla la API se muestra el formulario clásico */ }
}

init();
