function executeSearch(){


const q=document
.getElementById("aiSearch")
.value;



const results=
searchSOP(q);



renderResults(results);


}





function renderResults(results){


const box=
document.getElementById("results");



if(results.length===0){


box.innerHTML=
`
<div class="result-card">
No encontramos SOP relacionados
</div>
`;

return;

}



box.innerHTML="";



results.forEach(item=>{


const sop=item.sop;



box.innerHTML+=`

<div class="result-card">


<div class="result-title">

${sop.title}

</div>


<div class="result-dept">

${sop.department}

</div>



<div class="context">

${createContext(
sop,
document.getElementById("aiSearch").value
)}

</div>


<br>


<a href="/sop-site/viewer.html?doc=${sop.url}"
target="_blank">

Abrir SOP

</a>



</div>


`;

});


}





function createContext(sop,q){


let text=
sop.search_text || "";



let index=
text.toLowerCase()
.indexOf(q.toLowerCase());



if(index<0)

return text.substring(0,250)+"...";



let start=Math.max(
0,
index-120
);



return "..."
+
text.substring(
start,
index+200
)
+
"...";


}

