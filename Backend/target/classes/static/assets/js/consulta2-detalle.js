document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idConsulta = urlParams.get("id");
    const modo = urlParams.get("modo");

    if (!idConsulta) {
        alert("No se proporcionó un ID de consulta");
        return;
    }

    let pacienteId = null;
    let dniPaciente = null;

    try {
        const res = await fetch(`${API}/consultas/${idConsulta}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Consulta no encontrada");
        const consulta = await res.json();

        const paciente = consulta.paciente;
        if (paciente) {
            pacienteId = paciente.id;
            dniPaciente = paciente.dni;
            setVal("p-nombre",    paciente.nombreApellidos || "");
            setVal("p-telefono",  paciente.telefono || "");
            setVal("p-direccion", paciente.direccion || "");
            setVal("p-distrito",  paciente.distrito || "");
            setVal("p-provincia", paciente.provincia || "");
            setVal("p-dni",       paciente.dni || "");
            setVal("p-fnac",      paciente.fechaNacimiento || "");
            setVal("p-edad",      paciente.edad || "");
        }

        setVal("fecha-consulta", consulta.fecha || "");
        setVal("pa",          consulta.pa || "");
        setVal("fc",          consulta.fc || "");
        setVal("fr",          consulta.fr || "");
        setVal("temperatura", consulta.temperatura || "");
        setVal("peso",        consulta.peso  ?? "");
        setVal("talla",       consulta.talla ?? "");
        setVal("spo2",        consulta.spo2 || "");
        setVal("proxima-cita", consulta.proximaCita || "");
        var atencionRaw = consulta.atencionPor || "";
        setVal("atencion-por", atencionRaw.split('|')[0]);
        if (typeof actualizarFirma === 'function') actualizarFirma(atencionRaw);
        setVal("firma-sello",  consulta.firmaSello || "");

        fillLines("motivo",      consulta.motivo || "");
        fillLines("examen",      consulta.examenFisico || "");
        fillLines("diagnostico", consulta.diagnostico || "");
        fillLines("tratamiento", consulta.tratamiento || "");
        fillLines("examenes",    consulta.examenesAuxiliares || "");

        if (modo === "editar") activarEdicion();

    } catch (error) {
        console.error(error);
        showToast("Error al cargar la consulta", "error");
    }

    // ── Botón Volver ──────────────────────────────────────────
    document.getElementById("btnVolver").addEventListener("click", () => {
        const destino = dniPaciente
            ? `historial.html?dni=${dniPaciente}`
            : "historial.html";
        fadeNavigate(destino);
    });

    // También actualiza el link X del topbar
    if (dniPaciente) {
        document.getElementById("linkVolver").href = `historial.html?dni=${dniPaciente}`;
    }
    document.getElementById("linkVolver").addEventListener("click", (e) => {
    e.preventDefault();
    const destino = dniPaciente
        ? `historial.html?dni=${dniPaciente}`
        : "historial.html";
    fadeNavigate(destino);
});

    // ── Botón Editar ──────────────────────────────────────────
    document.getElementById("btnEditar").addEventListener("click", activarEdicion);

    // ── Botón Guardar ─────────────────────────────────────────
    document.getElementById("btnGuardar").addEventListener("click", async () => {
        showSpinner("Guardando cambios...");
        try {
            const bodyPaciente = {
                nombreApellidos: getVal("p-nombre"),
                telefono:        getVal("p-telefono"),
                direccion:       getVal("p-direccion"),
                distrito:        getVal("p-distrito"),
                provincia:       getVal("p-provincia"),
                dni:             getVal("p-dni"),
                fechaNacimiento: getVal("p-fnac"),
                edad:            parseInt(getVal("p-edad")) || 0
            };

            const bodyConsulta = {
                fecha:              getVal("fecha-consulta"),
                motivo:             collectLines("motivo"),
                edadConsulta:       parseInt(getVal("p-edad")) || 0,
                pa:                 getVal("pa"),
                fc:                 getVal("fc"),
                fr:                 getVal("fr"),
                temperatura:        getVal("temperatura"),
                peso:               parseFloat(getVal("peso"))  || null,
                talla:              parseFloat(getVal("talla")) || null,
                spo2:               getVal("spo2"),
                examenFisico:       collectLines("examen"),
                diagnostico:        collectLines("diagnostico"),
                tratamiento:        collectLines("tratamiento"),
                examenesAuxiliares: collectLines("examenes"),
                proximaCita:        getVal("proxima-cita"),
                atencionPor:        getVal("atencion-por"),
                firmaSello:         getVal("firma-sello")
            };

            const [resPac, resCon] = await Promise.all([
                fetch(`${API}/pacientes/${pacienteId}`, {
                    method: "PUT",
                    headers: getAuthHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify(bodyPaciente)
                }),
                fetch(`${API}/consultas/${idConsulta}`, {
                    method: "PUT",
                    headers: getAuthHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify(bodyConsulta)
                })
            ]);

            hideSpinner();
            if (resPac.ok && resCon.ok) {
                showToast("Datos actualizados correctamente", "success");
                desactivarEdicion();
            } else {
                showToast("Error al guardar los cambios", "error");
            }
        } catch (error) {
            hideSpinner();
            console.error(error);
            showToast("Error al guardar los cambios", "error");
        }
    });

    // ── Botón Cancelar ────────────────────────────────────────
    document.getElementById("btnCancelar").addEventListener("click", () => {
        window.location.reload();
    });

    // ── Ocultar líneas vacías al imprimir ─────────────────────
    window.addEventListener("beforeprint", () => {
        document.querySelectorAll("tr.linea").forEach(tr => {
            const input = tr.querySelector(".linea-input");
            if (input && input.value.trim() === "") {
                tr.setAttribute("data-hidden-print", "1");
                tr.style.display = "none";
            }
        });
    });

    window.addEventListener("afterprint", () => {
        document.querySelectorAll("tr.linea[data-hidden-print]").forEach(tr => {
            tr.style.display = "";
            tr.removeAttribute("data-hidden-print");
        });
    });
});

// ── Utilidades ────────────────────────────────────────────────

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function fillLines(seccion, texto) {
    const lineas = texto.split("\n");
    document.querySelectorAll(`[data-seccion="${seccion}"]`).forEach((input, idx) => {
        input.value = lineas[idx] || "";
    });
}

function collectLines(seccion) {
    const inputs = document.querySelectorAll(`[data-seccion="${seccion}"]`);
    return Array.from(inputs)
        .map(i => i.value.trimEnd())
        .join("\n")
        .trimEnd();
}

function activarEdicion() {
    document.querySelectorAll(".hoja input, .hoja textarea").forEach(el => {
        el.removeAttribute("readonly");
    });
    document.getElementById("btnEditar").style.display  = "none";
    document.getElementById("btnGuardar").style.display = "inline-flex";
    document.getElementById("btnCancelar").style.display = "inline-flex";
}

function desactivarEdicion() {
    document.querySelectorAll(".hoja input, .hoja textarea").forEach(el => {
        el.setAttribute("readonly", true);
    });
    document.getElementById("btnEditar").style.display  = "inline-flex";
    document.getElementById("btnGuardar").style.display = "none";
    document.getElementById("btnCancelar").style.display = "none";
}
