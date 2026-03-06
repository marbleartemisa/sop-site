/* ===== BASE DE DATOS DE SOP ===== */

const SOP_INDEX=[

{
title:"Cotización de Ventas",
department:"Comercial",
keywords:"ventas cotizacion sales consultor presupuesto",
url:"/sop-site/comercial/SOP-PARA-COTIZACIÓN-VENTAS"
},

{
title:"Sales Consultant",
department:"Comercial",
keywords:"ventas consultor clientes proceso ventas",
url:"/sop-site/comercial/SOP-SALES-CONSULTANT"
},

{
title:"Compra por Stock Mínimo",
department:"Producción",
keywords:"compra stock inventario carpinteria materiales",
url:"/sop-site/produccion/SOP-CARPINTERIA-COMPRA-STOCK/"
},

{
title:"Compra de Edgebanding",
department:"Producción",
keywords:"edgebanding compras canteado materiales",
url:"/sop-site/produccion/SOP-COMPRA-EDGEBANDING/"
},

{
title:"Cuidado Herramientas Carpintería",
department:"Producción",
keywords:"herramientas carpinteria mantenimiento",
url:"/sop-site/produccion/SOP-CUIDADO-HERRAMIENTAS-CARPINTERIA/"
},

{
title:"Mantenimiento Preventivo Trimming",
department:"Maquinarias",
keywords:"trimming mantenimiento maquinaria",
url:"/sop-site/maquinarias/SOP-MANTENIMIENTO-PREVENTIVO-TRIMMING"
},

{
title:"Calibración Edgebander",
department:"Maquinarias",
keywords:"edgebander calibracion contadores canteadora",
url:"/sop-site/maquinarias/SOP-CALIBRAR-EDGEBANDING"
},

{
title:"Conducción de Vehículos",
department:"Vehículos",
keywords:"vehiculos manejo transporte seguridad",
url:"/sop-site/vehiculos/SOP-CONDUCCION-VEHICULOS"
}

]

/* ===== BUSQUEDA GLOBAL ===== */

function searchSOP(){

let input=document.getElementById("searchInput").value.toLowerCase()

let results=document.getElementById("searchResults")

results.innerHTML=""

if(input.length<2) return

let matches=SOP_INDEX.filter(sop=>

sop.title.toLowerCase().includes(input) ||
sop.keywords.toLowerCase().includes(input) ||
sop.department.toLowerCase().includes(input)

)

matches.forEach(sop=>{

results.innerHTML+=`

<a href="${sop.url}" class="result-card">

<strong>${sop.title}</strong>

<span>${sop.department}</span>

</a>

`

})

}