const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let citasMap     = {};
let consultasMap = {};
let selectedCell = null;

async function cargarConsultas() {
    showSpinner("Cargando citas...");
    try {
        const res = await fetch(`${API}/consultas`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error();
        const consultas = await res.json();

        citasMap     = {};
        consultasMap = {};

        // Build patient → consultation dates for fulfillment check
        const pacienteFechas = {};
        consultas.forEach(c => {
            if (c.paciente?.id && c.fecha) {
                if (!pacienteFechas[c.paciente.id]) pacienteFechas[c.paciente.id] = [];
                pacienteFechas[c.paciente.id].push(c.fecha);
            }
        });

        consultas.forEach(c => {
            if (c.proximaCita) {
                const fechas = pacienteFechas[c.paciente?.id] || [];
                c._realizada = fechas.some(f => f >= c.proximaCita && f !== c.fecha);
                if (!citasMap[c.proximaCita]) citasMap[c.proximaCita] = [];
                citasMap[c.proximaCita].push(c);
            }
            if (c.fecha) {
                if (!consultasMap[c.fecha]) consultasMap[c.fecha] = [];
                consultasMap[c.fecha].push(c);
            }
        });

        renderCalendar();
    } catch {
        showToast("Error al cargar las citas", "error");
    } finally {
        hideSpinner();
    }
}

function renderCalendar() {
    document.getElementById("cal-title").textContent =
        `${MESES[currentMonth]} ${currentYear}`;

    const grid = document.getElementById("calGrid");
    const headers = Array.from(grid.querySelectorAll(".cal-dow"));
    grid.innerHTML = "";
    headers.forEach(h => grid.appendChild(h));

    const today = new Date().toISOString().split("T")[0];

    const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
        const el = document.createElement("div");
        el.className = "cal-day empty";
        grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const mm  = String(currentMonth + 1).padStart(2, "0");
        const dd  = String(d).padStart(2, "0");
        const dateStr = `${currentYear}-${mm}-${dd}`;

        const citas     = citasMap[dateStr]     || [];
        const consultas = consultasMap[dateStr] || [];
        const citasPendientes = citas.filter(c => !c._realizada);
        const citasRealizadas = citas.filter(c =>  c._realizada);
        const hasEvents = citas.length > 0 || consultas.length > 0;
        const isToday   = dateStr === today;

        const cell = document.createElement("div");
        let cls = "cal-day";
        if (hasEvents) cls += " has-events";
        if (isToday)   cls += " today";
        cell.className = cls;
        cell.dataset.date = dateStr;

        const num = document.createElement("div");
        num.className = "day-num";
        num.textContent = d;
        cell.appendChild(num);

        if (hasEvents) {
            const badges = document.createElement("div");
            badges.className = "day-badges";

            if (citasPendientes.length) {
                const b = document.createElement("span");
                b.className = "badge-cita";
                b.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${citasPendientes.length}`;
                badges.appendChild(b);
            }
            if (citasRealizadas.length) {
                const b = document.createElement("span");
                b.className = "badge-realizada";
                b.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${citasRealizadas.length}`;
                badges.appendChild(b);
            }
            if (consultas.length) {
                const b = document.createElement("span");
                b.className = "badge-consulta";
                b.innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${consultas.length}`;
                badges.appendChild(b);
            }

            cell.appendChild(badges);
            cell.addEventListener("click", () => {
                if (selectedCell) selectedCell.classList.remove("selected");
                cell.classList.add("selected");
                selectedCell = cell;
                mostrarDetalle(dateStr, citas, consultas);
            });
        }

        grid.appendChild(cell);
    }

    document.getElementById("detalle-panel").style.display = "none";
    selectedCell = null;
}

function mostrarDetalle(dateStr, citas, consultas) {
    const panel  = document.getElementById("detalle-panel");
    const lista  = document.getElementById("detalle-lista");
    const titulo = document.querySelector("#detalle-fecha span");

    const [y, m, d] = dateStr.split("-");
    titulo.textContent = `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`;

    lista.innerHTML = "";

    if (citas.length === 0 && consultas.length === 0) {
        lista.innerHTML = `
            <div class="sin-eventos">
                <i class="fa-regular fa-calendar-xmark"></i>
                <p>Sin eventos para este día</p>
            </div>`;
    }

    citas.forEach(c => {
        const item = c._realizada
            ? crearItem(
                "avatar-realizada",
                "fa-circle-check",
                c.paciente?.nombreApellidos || "Paciente",
                c.paciente?.dni || "—",
                c.paciente?.telefono || "—",
                "tipo-realizada",
                "Cita realizada"
            )
            : crearItem(
                "avatar-cita",
                "fa-calendar-check",
                c.paciente?.nombreApellidos || "Paciente",
                c.paciente?.dni || "—",
                c.paciente?.telefono || "—",
                "tipo-cita",
                "Próxima cita"
            );
        lista.appendChild(item);
    });

    const realizadasIds = new Set(
        citas.filter(c => c._realizada).map(c => c.paciente?.id).filter(Boolean)
    );

    consultas.forEach(c => {
        if (realizadasIds.has(c.paciente?.id)) return;
        const diag = c.diagnostico
            ? c.diagnostico.substring(0, 45) + (c.diagnostico.length > 45 ? "…" : "")
            : "Sin diagnóstico";
        const item = crearItem(
            "avatar-consulta",
            "fa-stethoscope",
            c.paciente?.nombreApellidos || "Paciente",
            c.paciente?.dni || "—",
            diag,
            "tipo-consulta",
            "Consulta"
        );
        lista.appendChild(item);
    });

    panel.style.display = "block";
    setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
}

function crearItem(avatarClass, iconClass, nombre, campo1, campo2, tipoClass, tipoLabel) {
    const item = document.createElement("div");
    item.className = "detalle-item";
    item.innerHTML = `
        <div class="detalle-avatar ${avatarClass}">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="detalle-info">
            <div class="detalle-nombre">${nombre}</div>
            <div class="detalle-meta">
                <i class="fa-solid fa-id-card"></i> ${campo1}
                &nbsp;·&nbsp;
                <i class="fa-solid fa-circle-info"></i> ${campo2}
            </div>
        </div>
        <span class="detalle-tipo ${tipoClass}">${tipoLabel}</span>
    `;
    return item;
}

document.getElementById("btnPrev").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

document.getElementById("btnNext").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

document.getElementById("btnCerrarDetalle").addEventListener("click", () => {
    document.getElementById("detalle-panel").style.display = "none";
    if (selectedCell) { selectedCell.classList.remove("selected"); selectedCell = null; }
});

cargarConsultas();
