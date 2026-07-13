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



return SOP_SEARCH_INDEX

.map(sop=>{


let text=`

${sop.title}

${sop.department}

${sop.search_text}

${sop.keywords}

`
.toLowerCase();



let score=0;



if(
sop.title
.toLowerCase()
.includes(query)
)
score+=100;



if(
sop.keywords &&
sop.keywords
.toLowerCase()
.includes(query)
)
score+=70;



if(
sop.search_text &&
sop.search_text
.toLowerCase()
.includes(query)
)
score+=50;



return {
sop,
score
};



})


.filter(x=>x.score>0)


.sort(
(a,b)=>b.score-a.score
)



.slice(0,20);



}

