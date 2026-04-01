// ID de tu Sheet

const SHEET_ID = "1zUZ37cWCS4N72AG5H2c_RRgjGhcQ5pj_D9qNBbRCRcI";
const SHEET_NAME = "SOP_Admin";


// URL de lectura JSON (formato público)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

async function fetchSOP() {
    const container = document.getElementById("sopContainer");
    try {
        const res = await fetch(SHEET_URL);
        let text = await res.text();
        // El JSON de Google viene envuelto, hay que limpiarlo
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        const SOP_INDEX = rows.map(r => ({
            id: r.c[0]?.v || "",
            title: r.c[1]?.v || "",
            department: r.c[2]?.v || "",
            url: r.c[3]?.v || "#",
            keywords: r.c[4]?.v || ""
        }));

        // Renderizar tabla
        let html = `<div class="sop-info">Mostrando <strong>${SOP_INDEX.length}</strong> SOP</div>
        <table class="sop-table">
          <thead><tr><th>Departamento</th><th>Procedimiento SOP</th><th>Acción</th></tr></thead><tbody>`;
        SOP_INDEX.forEach(sop => {
            html += `<tr>
                <td data-label="Departamento">${sop.department}</td>
                <td data-label="Procedimiento">${sop.title}</td>
                <td data-label="Acción"><a class="sop-btn" href="${sop.url}" target="_blank"><i class="fa-solid fa-eye"></i> Ver</a></td>
            </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `<div class="sop-info">Error cargando SOP: ${err}</div>`;
        console.error(err);
    }
}

// Llamar la función al cargar la página
fetchSOP();
