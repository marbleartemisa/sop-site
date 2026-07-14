let SOP_SEARCH_INDEX=[];


fetch('../SOP_INDEX.json?v='+Date.now())

.then(r=>r.json())

.then(data=>{

SOP_SEARCH_INDEX=data;


console.log(
"SOP cargados:",
SOP_SEARCH_INDEX.length
);


});




function searchSOP(query){


query=query
.toLowerCase()
.trim();



if(!query)
return [];



const words=query
.split(" ")
.filter(w=>w.length>1);



return SOP_SEARCH_INDEX

.map(sop=>{


const title=
(sop.title||"").toLowerCase();


const dept=
(sop.department||"").toLowerCase();


const keywords=
(sop.keywords||"").toLowerCase();


const text=
(sop.search_text||"").toLowerCase();



let score=0;



// =====================
// TITULO
// =====================

if(title.includes(query))
score+=120;



// =====================
// KEYWORDS
// =====================

if(keywords.includes(query))
score+=90;



// =====================
// CONTENIDO
// =====================

if(text.includes(query))
score+=50;



// =====================
// DEPARTAMENTO
// =====================

if(dept.includes(query))
score+=10;



// =====================
// BUSQUEDA POR PALABRAS
// =====================

words.forEach(w=>{

if(title.includes(w))
score+=25;


if(keywords.includes(w))
score+=15;


if(text.includes(w))
score+=8;


});



return {
sop,
score
};


})


.filter(x=>x.score>0)


.sort(
(a,b)=>b.score-a.score
);



}
