const TOKEN_KEY = 'admin_token';
let allPacientes = [];

const btnLogout          = document.getElementById('btnLogout');
const logsBody           = document.getElementById('logsBody');
const statTotal          = document.getElementById('statTotal');
const statTotalConsultas = document.getElementById('statTotalConsultas');
const statHoy            = document.getElementById('statHoy');
const statSemana         = document.getElementById('statSemana');
const statMes            = document.getElementById('statMes');

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }

function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(iso) {
    if (!iso) return '—';
    const utc = iso.includes('Z') || iso.includes('+') ? iso : iso + 'Z';
    const d = new Date(utc);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}


async function loadStats() {
    const token = getToken();
    try {
        const res = await fetch(`${API}/admin/stats`, {
            headers: { 'X-Admin-Token': token }
        });
        if (!res.ok) return;
        const s = await res.json();
        statTotalConsultas.textContent = s.totalConsultas ?? '—';
        statHoy.textContent            = s.consultasHoy ?? '—';
        statSemana.textContent         = s.consultasSemana ?? '—';
        statMes.textContent            = s.consultasMes ?? '—';
    } catch {}
}

async function loadLogs() {
    const token = getToken();
    try {
        const res = await fetch(`${API}/admin/logs`, {
            headers: { 'X-Admin-Token': token }
        });
        if (!res.ok) return;
        const logs = await res.json();
        if (logs.length === 0) {
            logsBody.innerHTML = `<tr><td colspan="6"><div class="no-data"><i class="fa-solid fa-shield-halved"></i> Sin registros aún</div></td></tr>`;
            return;
        }
        logsBody.innerHTML = logs.map(l => `
            <tr>
                <td style="color:#aaa;font-size:.78rem">${fmtDateTime(l.fechaHora)}</td>
                <td style="color:#fff;font-weight:500">${l.usuario}</td>
                <td style="color:#aaa;font-size:.82rem">${l.ip}</td>
                <td><span class="badge-tipo ${l.tipo}">${l.tipo}</span></td>
                <td class="text-center">
                    ${l.exitoso
                        ? '<span class="badge-ok"><i class="fa-solid fa-check"></i> Exitoso</span>'
                        : '<span class="badge-fail"><i class="fa-solid fa-xmark"></i> Fallido</span>'}
                </td>
                <td class="text-center">
                    <button class="btn-del-log" data-id="${l.id}" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        logsBody.querySelectorAll('.btn-del-log').forEach(btn => {
            btn.addEventListener('click', () => deleteLog(btn.dataset.id));
        });
    } catch {}
}

async function deleteLog(id) {
    const token = getToken();
    await fetch(`${API}/admin/logs/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
    }).catch(() => {});
    loadLogs();
}


document.getElementById('btnClearLogs').addEventListener('click', async () => {
    if (!confirm('¿Eliminar todos los registros de acceso?')) return;
    const token = getToken();
    await fetch(`${API}/admin/logs`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
    }).catch(() => {});
    loadLogs();
});

const AV_COLORS = ['dav-0','dav-1','dav-2','dav-3'];

function iniciales(nombre) {
    const p = nombre.trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase();
}

function mostrarVista(vista) {
    document.getElementById('vistaMain').style.display   = vista === 'main'   ? '' : 'none';
    document.getElementById('vistaDoctor').style.display = vista === 'doctor' ? '' : 'none';
}

async function abrirDoctor(doctor, colorIdx) {
    mostrarVista('doctor');

    // Header
    const av = document.getElementById('detAvatar');
    av.className   = `doctor-avatar ${AV_COLORS[colorIdx % 4]}`;
    av.textContent = iniciales(doctor.nombre);
    document.getElementById('detNombre').textContent   = doctor.nombre;
    document.getElementById('detUsername').textContent = '@' + doctor.username;

    const token = getToken();
    try {
        const res = await fetch(`${API}/admin/doctores/${doctor.id}/consultas`, {
            headers: { 'X-Admin-Token': token }
        });
        if (!res.ok) return;
        const consultas = await res.json();

        const now    = new Date();
        const hoy    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const semana = (() => { const d = new Date(now); d.setDate(d.getDate()-6); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
        const mes    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;

        const toStr = f => Array.isArray(f)
            ? `${f[0]}-${String(f[1]).padStart(2,'0')}-${String(f[2]).padStart(2,'0')}`
            : String(f ?? '');

        document.getElementById('detTotal').textContent    = consultas.length;
        document.getElementById('detHoy').textContent     = consultas.filter(c => toStr(c.fecha) === hoy).length;
        document.getElementById('detSemana').textContent  = consultas.filter(c => toStr(c.fecha) >= semana).length;
        document.getElementById('detMes').textContent     = consultas.filter(c => toStr(c.fecha) >= mes).length;
        const pacientesUnicos = new Set(consultas.map(c => c.paciente?.id).filter(Boolean));
        document.getElementById('detPacientes').textContent = pacientesUnicos.size;

        const tbody = document.getElementById('detConsultasBody');
        if (consultas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4"><div class="no-data">Sin consultas registradas</div></td></tr>`;
            return;
        }
        tbody.innerHTML = [...consultas].reverse().map((c, i) => `
            <tr>
                <td style="color:#666">${i+1}</td>
                <td style="color:#fff;font-weight:500">${c.paciente?.nombreApellidos || '—'}</td>
                <td style="color:#aaa">${c.paciente?.dni || '—'}</td>
                <td style="color:#aaa">${toStr(c.fecha) || '—'}</td>
            </tr>
        `).join('');
    } catch {}
}

async function loadDoctores() {
    const token = getToken();
    const grid  = document.getElementById('doctoresGrid');
    try {
        const res = await fetch(`${API}/admin/doctores`, {
            headers: { 'X-Admin-Token': token }
        });
        if (!res.ok) return;
        const doctores = await res.json();
        if (doctores.length === 0) {
            grid.innerHTML = `<div class="doctores-empty"><i class="fa-solid fa-user-doctor"></i><br>No hay doctores registrados aún</div>`;
            return;
        }
        grid.innerHTML = doctores.map((d, i) => `
            <div class="doctor-card" style="cursor:pointer" data-idx="${i}" data-id="${d.id}">
                <div class="doctor-avatar ${AV_COLORS[i % 4]}">${iniciales(d.nombre)}</div>
                <div class="doctor-nombre">${d.nombre}</div>
                <div class="doctor-username">@${d.username}</div>
                <div class="doctor-stats">
                    <div class="doctor-stat">
                        <div class="doctor-stat-val">${d.consultas}</div>
                        <div class="doctor-stat-lbl">Consultas</div>
                    </div>
                </div>
                <div class="doctor-fecha">Desde ${fmtDate(d.fechaCreacion)}</div>
                <div style="margin-top:8px;font-size:.72rem;color:rgba(147,197,253,.6)">Ver detalle →</div>
            </div>
        `).join('');

        grid.querySelectorAll('.doctor-card').forEach((card, i) => {
            card.addEventListener('click', () => abrirDoctor(doctores[i], i));
        });
    } catch {}
}

document.getElementById('btnVolver').addEventListener('click', () => mostrarVista('main'));

async function loadTodo() {
    const [,screen] = await Promise.all([
        Promise.all([loadStats(), loadLogs(), loadDoctores()]),
        new Promise(r => setTimeout(r, 5000))
    ]);
    const el = document.getElementById('loadingScreen');
    if (el) el.classList.add('hidden');
}


btnLogout.addEventListener('click', async () => {
    const token = getToken();
    if (token) {
        await fetch(`${API}/auth/logout`, {
            method:  'POST',
            headers: { 'X-Auth-Token': token }
        }).catch(() => {});
    }
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.replace('login.html');
});


if (!getToken()) {
    window.location.replace('login.html');
} else {
    loadTodo();
}
