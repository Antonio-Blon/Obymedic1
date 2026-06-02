document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dni = urlParams.get("dni");

    if (!dni) {
        showToast("No se proporcionó un DNI", "error");
        return;
    }

    const sinConsultasDiv = document.getElementById("sin-consultas-mensaje");
    const resultadoForm = document.getElementById("resultadoForm");
    const nombreInput = document.getElementById("nombre");
    const telefonoInput = document.getElementById("telefono");
    const fechaInput = document.getElementById("fecha");
    const btnNuevaConsulta = document.getElementById("btnNuevaConsulta");
    const btnNuevaConsultaMensaje = document.getElementById("btnNuevaConsultaMensaje");
    const btnEliminarSinConsultas = document.getElementById("btnEliminarSinConsultas");
    const btnMostrarConsulta = document.getElementById("btnMostrarConsulta");
    const btnEliminarPaciente = document.getElementById("btnEliminarPaciente");
    const consultasContainer = document.getElementById("consultas-container");
    const listaConsultas = document.getElementById("lista-consultas");

    let idPaciente = null;

    async function cargarPacienteYConsultas() {
        const pacienteRes = await fetch(`${API}/pacientes/dni/${dni}`, { headers: getAuthHeaders() });

        if (!pacienteRes.ok) {
            if (idPaciente !== null) {
                // Patient was auto-deleted after their last consultation was removed
                showToast("Paciente eliminado correctamente", "success");
                setTimeout(() => fadeNavigate("panel.html"), 1200);
                return;
            }
            // Patient never existed — offer to create
            btnNuevaConsultaMensaje.onclick = () => {
                window.location.href = `buscar-paciente.html?dni=${dni}`;
            };
            sinConsultasDiv.querySelector("h4").textContent = "Paciente no registrado";
            sinConsultasDiv.querySelector("p").textContent = "No existe un registro para este DNI. Puede crear una nueva consulta con sus datos.";
            sinConsultasDiv.style.display = "block";
            resultadoForm.style.display = "none";
            return;
        }

        try {
            const paciente = await pacienteRes.json();
            idPaciente = paciente.id;
            nombreInput.value = paciente.nombreApellidos || "";
            telefonoInput.value = paciente.telefono || "";

            const consultasRes = await fetch(`${API}/consultas/paciente/${idPaciente}`, { headers: getAuthHeaders() });
            const consultas = await consultasRes.json();

            if (consultas.length === 0) {
                sinConsultasDiv.style.display = "block";
                resultadoForm.style.display = "none";
            } else {
                sinConsultasDiv.style.display = "none";
                resultadoForm.style.display = "block";
                const sorted = [...consultas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                fechaInput.value = sorted[0].fecha || "";
                window._consultas = sorted;
                consultasContainer.style.display = "none";
            }
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los datos del paciente", "error");
            sinConsultasDiv.style.display = "block";
            resultadoForm.style.display = "none";
        }
    }

    const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

    function formatFecha(f) {
        if (!f) return "—";
        const partes = String(f).split('-');
        if (partes.length < 2) return f;
        const dia = parseInt(partes[2] || 0);
        const mes = MESES[parseInt(partes[1]) - 1] || '';
        return `${dia} ${mes}`;
    }

    function mostrarListaConsultas(consultas) {
        listaConsultas.innerHTML = "";

        const citasFijadas = new Set(consultas.filter(c => c.proximaCita).map(c => c.proximaCita));

    consultas.forEach(consulta => {
            const consultaId = consulta.id;
            const esRealizada = citasFijadas.has(consulta.fecha);
            const fechaDisplay = formatFecha(consulta.fecha);
            const primeraLinea = consulta.diagnostico
                ? (consulta.diagnostico.split("\n").find(l => l.trim()) || "").trim()
                : "";

            const card = document.createElement("div");
            card.className = "consulta-card";

            card.innerHTML = `
                <div class="consulta-card-left">
                    <div class="consulta-fecha-badge ${esRealizada ? 'badge-cita' : 'badge-consulta'}">
                        <i class="fa-solid ${esRealizada ? 'fa-calendar-check' : 'fa-file-medical'}"></i>
                        ${fechaDisplay}
                    </div>
                    <div class="consulta-info">
                        <div class="consulta-tipo">${esRealizada ? 'Cita realizada' : 'Consulta'}</div>
                        <div class="consulta-diag">
                            <i class="fa-solid fa-stethoscope"></i>
                            ${primeraLinea ? (primeraLinea.length > 70 ? primeraLinea.substring(0,70)+'...' : primeraLinea) : 'Sin diagnóstico'}
                        </div>
                    </div>
                </div>
                <div class="consulta-card-btns">
                    <button class="cc-btn cc-ver" title="Ver"><i class="fa-solid fa-eye"></i></button>
                    <button class="cc-btn cc-edit" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="cc-btn cc-del" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </div>`;

            card.querySelector('.cc-ver').addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    fadeNavigate('ficha-consulta.html?id=' + consultaId);
});
card.querySelector('.cc-edit').addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    fadeNavigate('ficha-consulta.html?id=' + consultaId + '&modo=editar');
});
card.querySelector('.cc-del').addEventListener('click', async function(e) {
    e.stopPropagation();
    const ok = await showConfirm('¿Eliminar la consulta del ' + fechaDisplay + '?', 'Eliminar consulta');
    if (ok) await eliminarConsulta(consultaId);
});

            listaConsultas.appendChild(card);
        });
    }

    async function eliminarConsulta(idConsulta) {
        showSpinner("Eliminando consulta...");
        try {
            const res = await fetch(`${API}/consultas/${idConsulta}`, { method: "DELETE", headers: getAuthHeaders() });
            hideSpinner();
            if (!res.ok) throw new Error("Error al eliminar");
            showToast("Consulta eliminada correctamente", "success");
            await cargarPacienteYConsultas();
            consultasContainer.style.display = "none";
        } catch (error) {
            hideSpinner();
            console.error(error);
            showToast("No se pudo eliminar la consulta", "error");
        }
    }

    if (btnEliminarSinConsultas) {
        btnEliminarSinConsultas.addEventListener("click", async () => {
            if (!idPaciente) return;
            const ok = await showConfirm(
                `¿Eliminar el registro de <strong>${nombreInput.value || "este paciente"}</strong>?`,
                "Eliminar paciente"
            );
            if (!ok) return;
            showSpinner("Eliminando paciente...");
            const res = await fetch(`${API}/pacientes/${idPaciente}`, { method: "DELETE", headers: getAuthHeaders() });
            hideSpinner();
            if (res.ok) {
                showToast("Paciente eliminado correctamente", "success");
                setTimeout(() => fadeNavigate("panel.html"), 1200);
            } else {
                showToast("Error al eliminar el paciente", "error");
            }
        });
    }

    if (btnNuevaConsulta) {
    btnNuevaConsulta.addEventListener("click", () => {
        window.location.href = `nueva-consulta.html?dni=${dni}`;
    });
}

if (btnNuevaConsultaMensaje) {
    btnNuevaConsultaMensaje.addEventListener("click", () => {
        window.location.href = `nueva-consulta.html?dni=${dni}`;
    });
}

    if (btnMostrarConsulta) {
        btnMostrarConsulta.addEventListener("click", () => {
            if (consultasContainer.style.display === "none" || consultasContainer.style.display === "") {
                mostrarListaConsultas(window._consultas);
                consultasContainer.style.display = "block";
            } else {
                consultasContainer.style.display = "none";
            }
        });
    }

    if (btnEliminarPaciente) {
        btnEliminarPaciente.addEventListener("click", async () => {
            const ok = await showConfirm(
                `¿Estás seguro de eliminar a <strong>${nombreInput.value}</strong> y todas sus consultas?`,
                "Eliminar paciente"
            );
            if (!ok) return;

            showSpinner("Eliminando paciente...");
            const res = await fetch(`${API}/pacientes/${idPaciente}`, { method: "DELETE", headers: getAuthHeaders() });
            hideSpinner();
            if (res.ok) {
                showToast("Paciente eliminado correctamente", "success");
                setTimeout(() => { window.location.href = "panel.html"; }, 1200);
            } else {
                showToast("Error al eliminar el paciente", "error");
            }
        });
    }

    cargarPacienteYConsultas();

    // ── Exámenes de Laboratorio ──
    function abrirModalExamenes() {
        const modal = document.getElementById('modalExamenes');
        modal.style.display = 'flex';
        const ahora = new Date();
        document.getElementById('examenFecha').value =
            ahora.toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }) + ' ' +
            ahora.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });
        document.getElementById('examenTitulo').value = '';
        document.getElementById('examenArchivo').value = '';
        document.getElementById('examenMensaje').style.display = 'none';
        switchTab('subir');
    }

    document.getElementById('btnCerrarModal').addEventListener('click', () => {
        document.getElementById('modalExamenes').style.display = 'none';
    });

    document.getElementById('modalExamenes').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalExamenes'))
            document.getElementById('modalExamenes').style.display = 'none';
    });

    window.switchTab = function(tab) {
        document.getElementById('panelSubir').style.display = tab === 'subir' ? 'block' : 'none';
        document.getElementById('panelVer').style.display   = tab === 'ver'   ? 'block' : 'none';
        document.getElementById('tabSubir').classList.toggle('active', tab === 'subir');
        document.getElementById('tabVer').classList.toggle('active', tab === 'ver');
        if (tab === 'ver') cargarExamenes();
    };

    async function cargarExamenes() {
        const lista = document.getElementById('listaExamenes');
        lista.innerHTML = '<p class="examen-empty"><i class="fa-solid fa-spinner fa-spin"></i>Cargando...</p>';
        try {
            const res = await fetch(`${API}/examenes/${idPaciente}`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (!data.length) {
                lista.innerHTML = '<div class="examen-empty"><i class="fa-solid fa-folder-open"></i>No hay exámenes subidos</div>';
                return;
            }
            lista.innerHTML = '';
            data.forEach(ex => {
                const fecha = ex.fechaSubida ? ex.fechaSubida.replace('T', ' ').substring(0, 16) : '';
                const item = document.createElement('div');
                item.className = 'examen-item';
                item.innerHTML = `
                    <div class="examen-item-info">
                        <div class="examen-item-titulo"><i class="fa-solid fa-file-pdf" style="color:#ef4444"></i> ${ex.titulo}</div>
                        <div class="examen-item-fecha"><i class="fa-regular fa-clock"></i> ${fecha}</div>
                    </div>
                    <div class="examen-item-btns">
                        <button class="examen-ver-btn" onclick="verExamen(${ex.id})"><i class="fa-solid fa-eye"></i> Ver</button>
                        <button class="examen-del-btn" onclick="eliminarExamen(${ex.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
                lista.appendChild(item);
            });
        } catch {
            lista.innerHTML = '<div class="examen-empty">Error al cargar los exámenes</div>';
        }
    }

    window.verExamen = function(id) {
        const token = sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session');
        fetch(`${API}/examenes/${id}/archivo`, { headers: getAuthHeaders() })
            .then(r => r.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            });
    };

    window.eliminarExamen = async function(id) {
        const ok = await showConfirm('¿Eliminar este examen?', 'Eliminar examen');
        if (!ok) return;
        await fetch(`${API}/examenes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        cargarExamenes();
    };

    document.getElementById('btnSubirExamen').addEventListener('click', async () => {
        const titulo  = document.getElementById('examenTitulo').value.trim();
        const archivo = document.getElementById('examenArchivo').files[0];
        const msg     = document.getElementById('examenMensaje');

        if (!titulo) { msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = 'Ingresa un título'; return; }
        if (!archivo) { msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = 'Selecciona un archivo PDF'; return; }

        const btn = document.getElementById('btnSubirExamen');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo...';

        const form = new FormData();
        form.append('titulo', titulo);
        form.append('archivo', archivo);

        try {
            const res = await fetch(`${API}/examenes/${idPaciente}`, {
                method: 'POST',
                headers: { 'X-Auth-Token': sessionStorage.getItem('obs_session') || localStorage.getItem('obs_session') },
                body: form
            });
            if (res.ok) {
                msg.style.display = 'block'; msg.style.color = '#16a34a'; msg.textContent = '✓ Examen subido correctamente';
                document.getElementById('examenTitulo').value = '';
                document.getElementById('examenArchivo').value = '';
            } else {
                msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = 'Error al subir el archivo';
            }
        } catch {
            msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = 'Error de conexión';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Subir Examen';
        }
    });

    const btnExamenes = document.getElementById('btnExamenes');
    if (btnExamenes) btnExamenes.addEventListener('click', abrirModalExamenes);
});