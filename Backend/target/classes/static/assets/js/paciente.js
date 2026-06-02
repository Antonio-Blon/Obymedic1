const MESES = ["ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sep.","oct.","nov.","dic."];

function formatFecha(d) {
    return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

document.getElementById("fecha-hoy").textContent = formatFecha(new Date());

async function cargarEstadisticas() {
    const hoy = new Date().toISOString().split("T")[0];

    try {
        const resConsultas = await fetch(`${API}/consultas`, { headers: getAuthHeaders() });
        if (resConsultas.ok) {
            const consultas = await resConsultas.json();

            const pacientesConConsulta = new Set(consultas.map(c => c.paciente?.id).filter(Boolean));
            document.getElementById("cnt-pacientes").textContent = pacientesConConsulta.size;

            const hoy_count = consultas.filter(c => c.fecha === hoy).length;
            document.getElementById("cnt-hoy").textContent = hoy_count;

            const pacienteFechas = {};
            consultas.forEach(c => {
                const pid = c.paciente?.id;
                if (pid && c.fecha) {
                    if (!pacienteFechas[pid]) pacienteFechas[pid] = [];
                    pacienteFechas[pid].push(c.fecha);
                }
            });
            const proximas = consultas.filter(c => {
                if (!c.proximaCita || c.proximaCita < hoy) return false;
                const fechas = pacienteFechas[c.paciente?.id] || [];
                return !fechas.some(f => f >= c.proximaCita && f !== c.fecha);
            }).length;
            document.getElementById("cnt-citas").textContent = proximas;
        }
    } catch (_) {}
}

cargarEstadisticas();
