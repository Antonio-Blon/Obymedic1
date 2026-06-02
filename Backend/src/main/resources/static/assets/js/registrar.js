function normalizeTalla(val) {
    return val.trim().replace(/m$/i, "").replace("'", ".");
}

// Enter en un textarea bloqueado al límite de filas → salta al siguiente textarea
document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.target.tagName !== "TEXTAREA") return;
    const ta = e.target;
    const maxRows = parseInt(ta.getAttribute("rows")) || 99;
    if (ta.value.split("\n").length >= maxRows) {
        e.preventDefault();
        const all = Array.from(document.querySelectorAll("textarea.area-field"));
        const next = all[all.indexOf(ta) + 1];
        if (next) next.focus();
    }
});

window.addEventListener("load", function () {
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;

    document.getElementById("fecha_consulta").value = hoyStr;
    document.getElementById("fecha_consulta").min = hoyStr;
    document.getElementById("proxima_cita").min = hoyStr;

    const nombre = sessionStorage.getItem('doctorNombre') || localStorage.getItem('doctorNombre');
    const elAten = document.getElementById("atencion_por");
    if (nombre && elAten) elAten.value = nombre;

    const urlParams = new URLSearchParams(window.location.search);
    const dniParam = urlParams.get("dni");
    if (dniParam) {
        cargarPacientePorDni(dniParam);
    }
});

async function cargarPacientePorDni(dni) {
    try {
        const res = await fetch(`${API}/pacientes/dni/${dni}`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const paciente = await res.json();

        document.getElementById("dni").value = paciente.dni || "";
        document.getElementById("nombre_completo").value = paciente.nombreApellidos || "";
        document.getElementById("telefono").value = paciente.telefono || "";
        document.getElementById("direccion").value = paciente.direccion || "";
        document.getElementById("distrito").value = paciente.distrito || "";
        document.getElementById("provincia").value = paciente.provincia || "";
        document.getElementById("fecha_nacimiento").value = paciente.fechaNacimiento || "";
        document.getElementById("edad").value = paciente.edad || "";

        ["dni", "nombre_completo", "telefono", "direccion", "distrito", "provincia", "fecha_nacimiento", "edad"]
            .forEach(id => document.getElementById(id).setAttribute("readonly", true));

        window._pacienteId = paciente.id;

    } catch (e) {
        console.error("Error cargando paciente:", e);
    }
}

document.getElementById("fecha_nacimiento").addEventListener("change", function () {
    const fechaNac = new Date(this.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    document.getElementById("edad").value = edad;
});

document.getElementById("telefono").addEventListener("input", function () {
    const telefonoLimpio = this.value.replace(/\s/g, "");
    if (!telefonoLimpio.startsWith("9")) {
        mostrarError("error-telefono", "El teléfono debe iniciar con 9");
    } else if (telefonoLimpio.length !== 9) {
        mostrarError("error-telefono", "El teléfono debe tener exactamente 9 dígitos");
    } else {
        limpiarError("error-telefono");
    }
});

document.getElementById("dni").addEventListener("input", async function () {
    const dniLimpio = this.value.replace(/\s/g, "");
    ocultarWarn("warn-dni");

    if (dniLimpio.length !== 8) {
        if (dniLimpio.length > 0) mostrarError("error-dni", "El DNI debe tener exactamente 8 dígitos");
        else limpiarError("error-dni");
        return;
    }

    limpiarError("error-dni");

    try {
        const res = await fetch(`${API}/pacientes/dni/${dniLimpio}`, { headers: getAuthHeaders() });
        if (res.ok) {
            const paciente = await res.json();
            mostrarWarn("warn-dni", `Este paciente ya tiene un registro previo — datos cargados: ${paciente.nombreApellidos}`);
            document.getElementById("nombre_completo").value = paciente.nombreApellidos || "";
            document.getElementById("telefono").value        = paciente.telefono || "";
            document.getElementById("direccion").value       = paciente.direccion || "";
            document.getElementById("distrito").value        = paciente.distrito || "";
            document.getElementById("provincia").value       = paciente.provincia || "";
            document.getElementById("fecha_nacimiento").value = paciente.fechaNacimiento || "";
            document.getElementById("edad").value            = paciente.edad || "";
            ["nombre_completo","telefono","direccion","distrito","provincia","fecha_nacimiento","edad"]
                .forEach(id => document.getElementById(id).setAttribute("readonly", true));
            window._pacienteId = paciente.id;
        } else {
            try {
                const reniec = await fetch(`${API}/pacientes/reniec/${dniLimpio}`, { headers: getAuthHeaders() });
                if (reniec.ok) {
                    const data = await reniec.json();
                    if (data.nombreCompleto) {
                        document.getElementById("nombre_completo").value = data.nombreCompleto;
                        document.getElementById("nombre_completo").focus();
                    }
                }
            } catch { }
        }
    } catch { /* no acción si falla la consulta */ }
});

function mostrarError(id, mensaje) {
    document.getElementById(id).style.display = "block";
    document.getElementById(id + "-texto").textContent = mensaje;
}

function limpiarError(id) {
    document.getElementById(id).style.display = "none";
    document.getElementById(id + "-texto").textContent = "";
}

function mostrarWarn(id, mensaje) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = "flex";
    document.getElementById(id + "-texto").textContent = mensaje;
}

function ocultarWarn(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function limpiarTodosLosErrores() {
    limpiarError("error-telefono");
    limpiarError("error-dni");
    limpiarError("error-fecha-consulta");
    limpiarError("error-proxima-cita");
}

document.getElementById("btn-registrar").addEventListener("click", async function () {

    limpiarTodosLosErrores();

    const nombreApellidos = document.getElementById("nombre_completo").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    const distrito = document.getElementById("distrito").value;
    const provincia = document.getElementById("provincia").value;
    const dni = document.getElementById("dni").value;
    const fechaNacimiento = document.getElementById("fecha_nacimiento").value;
    const edad = document.getElementById("edad").value;
    const motivo = document.getElementById("motivo_consulta").value;
    const fechaConsulta = document.getElementById("fecha_consulta").value;
    const pa = document.getElementById("pa").value;
    const fc = document.getElementById("fc").value;
    const fr = document.getElementById("fr").value;
    const temperatura = document.getElementById("temperatura").value;
    const peso = document.getElementById("peso").value;
    const talla = document.getElementById("talla").value;
    const spo2 = document.getElementById("spo2").value;
    const examenFisico = document.getElementById("examen_fisico").value;
    const diagnostico = document.getElementById("diagnostico").value;
    const tratamiento = document.getElementById("tratamiento").value;
    const examenesAuxiliares = document.getElementById("examenes_auxiliares").value;
    const proximaCita = document.getElementById("proxima_cita").value;
    const atencionPorRaw = document.getElementById("atencion_por").value;
    const atencionPor = atencionPorRaw.split('|')[0];
    const firmaSello = atencionPorRaw.split('|')[1] || '1';

    let hayErrores = false;

    const telefonoLimpio = telefono.replace(/\s/g, "");
    if (!telefonoLimpio.startsWith("9")) {
        mostrarError("error-telefono", "El teléfono debe iniciar con 9");
        hayErrores = true;
    } else if (telefonoLimpio.length !== 9) {
        mostrarError("error-telefono", "El teléfono debe tener exactamente 9 dígitos");
        hayErrores = true;
    }

    const dniLimpio = dni.replace(/\s/g, "");
    if (dniLimpio.length !== 8) {
        mostrarError("error-dni", "El DNI debe tener exactamente 8 dígitos");
        hayErrores = true;
    }

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;

    if (!fechaConsulta) {
        mostrarError("error-fecha-consulta", "Debe ingresar la fecha de consulta");
        hayErrores = true;
    } else if (fechaConsulta < hoyStr) {
        mostrarError("error-fecha-consulta", "La fecha de consulta no puede ser anterior a hoy");
        hayErrores = true;
    }

    if (proximaCita && proximaCita <= hoyStr) {
        mostrarError("error-proxima-cita", "La próxima cita debe ser a partir de mañana");
        hayErrores = true;
    }

    const pesoVal = document.getElementById("peso").value.trim();
    const tallaVal = normalizeTalla(document.getElementById("talla").value);
    if (pesoVal && isNaN(parseFloat(pesoVal))) {
        mostrarError("error-fecha-consulta", "El peso debe ser un número (ej: 65.5)");
        hayErrores = true;
    }
    if (tallaVal && isNaN(parseFloat(tallaVal))) {
        mostrarError("error-fecha-consulta", "La talla debe ser un número (ej: 1.80 / 1'80 / 1.80m)");
        hayErrores = true;
    }

    if (hayErrores) return;

    const pacienteBody = window._pacienteId
        ? { id: window._pacienteId }
        : {
            nombreApellidos,
            dni,
            telefono,
            direccion,
            distrito,
            provincia,
            fechaNacimiento,
            edad: parseInt(edad)
        };

    showSpinner("Registrando consulta...");
    try {
        const response = await fetch(`${API}/consultas`, {
            method: "POST",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({
                paciente: pacienteBody,
                fecha: fechaConsulta,
                motivo,
                edadConsulta: parseInt(edad),
                pa, fc, fr,
                temperatura,
                peso: parseFloat(peso),
                talla: parseFloat(normalizeTalla(talla)),
                spo2,
                examenFisico,
                diagnostico,
                tratamiento,
                examenesAuxiliares,
                proximaCita,
                atencionPor,
                firmaSello
            }),
        });
        hideSpinner();
        if (response.ok) {
            const consulta = await response.json();
            showToast("Consulta registrada correctamente", "success");
            setTimeout(() => fadeNavigate(`ficha-consulta.html?id=${consulta.id}`), 1200);
        } else {
            showToast("Error: no se pudo guardar la consulta", "error");
        }
    } catch (e) {
        hideSpinner();
        showToast("Error de conexión al servidor", "error");
    }
});