function normalizeTalla(val) {
    return val.trim().replace(/m$/i, "").replace("'", ".");
}

window.addEventListener("load", function () {
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fecha-consulta").value = hoy;

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    document.getElementById("proxima-cita").value = manana.toISOString().split("T")[0];

    const nombre = sessionStorage.getItem('doctorNombre') || localStorage.getItem('doctorNombre');
    if (nombre) {
        const select = document.getElementById("atencion-por");
        for (let opt of select.options) {
            if (opt.value.split('|')[0] === nombre) { select.value = opt.value; break; }
        }
        document.getElementById('firmaImg').src = 'assets/img/doctor' + (select.value.split('|')[1] || '1') + '.png';
    }
});

// Enter en una celda de línea avanza a la siguiente
document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || !e.target.classList.contains("linea-input")) return;
    e.preventDefault();
    const all = Array.from(document.querySelectorAll(".linea-input"));
    const next = all[all.indexOf(e.target) + 1];
    if (next) next.focus();
});

// Click en la fila completa foca el input dentro (cubre el área de color que queda fuera del input)
document.querySelectorAll("td.linea").forEach(function (td) {
    td.addEventListener("click", function () {
        const inp = td.querySelector(".linea-input");
        if (inp) inp.focus();
    });
});

window.addEventListener("beforeprint", function () {
    document.querySelectorAll("tr.linea").forEach(function (tr) {
        const inp = tr.querySelector(".linea-input");
        if (inp && inp.value.trim() === "") tr.style.display = "none";
    });
});

window.addEventListener("afterprint", function () {
    document.querySelectorAll("tr.linea").forEach(function (tr) {
        tr.style.display = "";
    });
});

function collectLines(seccion) {
    const inputs = document.querySelectorAll(`[data-seccion="${seccion}"]`);
    return Array.from(inputs)
        .map(i => i.value.trimEnd())
        .join("\n")
        .trimEnd();
}

document.getElementById("btn-registrar").addEventListener("click", async function () {
    const params = new URLSearchParams(window.location.search);
    const dni = params.get("dni");

    if (!dni) {
        showToast("No se proporcionó un DNI válido", "error");
        return;
    }

    const fechaConsulta = document.getElementById("fecha-consulta").value;
    const proximaCita   = document.getElementById("proxima-cita").value;
    const hoyStr = new Date().toISOString().split("T")[0];

    if (!fechaConsulta) {
        showToast("Debe ingresar la fecha de consulta", "warning");
        return;
    }
    if (proximaCita && proximaCita <= hoyStr) {
        showToast("La próxima cita debe ser a partir de mañana", "warning");
        return;
    }

    const pesoVal = document.getElementById("peso").value.trim();
    const tallaVal = normalizeTalla(document.getElementById("talla").value);
    if (pesoVal && isNaN(parseFloat(pesoVal))) {
        showToast("El peso debe ser un número (ej: 65.5)", "warning");
        return;
    }
    if (tallaVal && isNaN(parseFloat(tallaVal))) {
        showToast("La talla debe ser un número (ej: 1.80 / 1'80 / 1.80m)", "warning");
        return;
    }

    showSpinner("Registrando consulta...");
    try {
        const pacienteRes = await fetch(`${API}/pacientes/dni/${dni}`, { headers: getAuthHeaders() });
        if (!pacienteRes.ok) throw new Error("Paciente no encontrado");
        const paciente = await pacienteRes.json();

        document.getElementById("edad").value = paciente.edad || "";

        const body = {
            paciente: { id: paciente.id, dni: paciente.dni },
            fecha:              fechaConsulta,
            motivo:             collectLines("motivo"),
            edadConsulta:       paciente.edad || 0,
            pa:                 document.getElementById("pa").value,
            fc:                 document.getElementById("fc").value,
            fr:                 document.getElementById("fr").value,
            temperatura:        document.getElementById("temperatura").value,
            peso:               parseFloat(document.getElementById("peso").value) || null,
            talla:              parseFloat(normalizeTalla(document.getElementById("talla").value)) || null,
            spo2:               document.getElementById("spo2").value,
            examenFisico:       collectLines("examen"),
            diagnostico:        collectLines("diagnostico"),
            tratamiento:        collectLines("tratamiento"),
            examenesAuxiliares: collectLines("examenes"),
            proximaCita:        proximaCita,
            atencionPor:        document.getElementById("atencion-por").value,
            firmaSello:         document.getElementById("firma-sello").value
        };

        const res = await fetch(`${API}/consultas`, {
            method: "POST",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(body)
        });

        hideSpinner();
        if (res.ok) {
            showToast("Consulta registrada correctamente", "success");
            setTimeout(() => fadeNavigate(`historial.html?dni=${dni}`), 1200);
        } else {
            const err = await res.text();
            console.error("Error del servidor:", err);
            showToast("Error al registrar la consulta", "error");
        }
    } catch (error) {
        hideSpinner();
        console.error(error);
        showToast("Error al registrar la consulta", "error");
    }
});
