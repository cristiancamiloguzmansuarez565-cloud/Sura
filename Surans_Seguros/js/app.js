const DEFAULT_PRODUCTS=[
{id:"protection",name:"Protección financiera",description:"Una alternativa referencial para proteger compromisos y objetivos financieros.",rate:7.5,term:12,benefit:"Orientación personalizada",color:"mint",symbol:"◈"},
{id:"respaldo",name:"Respaldo familiar",description:"Una opción demostrativa enfocada en el respaldo económico de tu familia.",rate:6.2,term:12,benefit:"Acompañamiento cercano",color:"blue",symbol:"⌂"},
{id:"patrimonio",name:"Protección patrimonial",description:"Simula una cobertura para respaldar el valor de tus bienes y proyectos.",rate:8.1,term:12,benefit:"Alternativas flexibles",color:"sand",symbol:"◇"}
];
const STORE="surans_demo_products_v1";
const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(n)||0);
function getProducts(){try{const p=JSON.parse(localStorage.getItem(STORE));return Array.isArray(p)&&p.length?p:DEFAULT_PRODUCTS.map(x=>({...x}));}catch(e){return DEFAULT_PRODUCTS.map(x=>({...x}));}}
function saveProducts(p){localStorage.setItem(STORE,JSON.stringify(p));}
function calculate(value,rate,term){const annual=Number(value)*Number(rate)/100;return term===1?annual/12:annual;}
function initPublic(){
 const grid=document.getElementById("products");if(!grid)return;
 const select=document.getElementById("coverageSelect"),value=document.getElementById("insuredValue"),term=document.getElementById("termSelect");
 function render(){const products=getProducts();grid.innerHTML=products.map(p=>`<article class="product-card"><div class="product-art ${p.color}"><span class="product-symbol">${p.symbol||"◈"}</span></div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="product-benefit">✓ ${escapeHTML(p.benefit)}</div><button data-select="${p.id}">Simular esta opción →</button></div></article>`).join("");
 const old=select.value;select.innerHTML=products.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("");if(products.some(p=>p.id===old))select.value=old;update();}
 function update(){const p=getProducts().find(x=>x.id===select.value)||getProducts()[0];if(!p)return;const t=Number(term.value);document.getElementById("premium").textContent=money(calculate(value.value,p.rate,t));document.getElementById("quoteCaption").textContent=`Valor ilustrativo · pago ${t===1?"mensual":"anual"}`;}
 grid.addEventListener("click",e=>{const b=e.target.closest("[data-select]");if(b){select.value=b.dataset.select;update();document.getElementById("simulador").scrollIntoView({behavior:"smooth"});}});
 select.addEventListener("change",update);value.addEventListener("input",update);term.addEventListener("change",update);
 document.getElementById("requestQuote").addEventListener("click",()=>alert("Esta es una simulación ficticia. No se ha generado una solicitud real ni una póliza."));render();
 const menu=document.querySelector(".menu-toggle");if(menu)menu.addEventListener("click",()=>document.querySelector(".topbar nav").classList.toggle("open"));
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function initAdmin(){
 const form=document.getElementById("productForm");if(!form)return;
 const $=id=>document.getElementById(id),list=$("adminProducts");
 function reset(){form.reset();$("productId").value="";$("productRate").value="7.5";$("productTerm").value="12";$("saveProduct").textContent="Guardar producto";}
 function render(){const p=getProducts();list.innerHTML=p.length?p.map(x=>`<article class="admin-product"><div><h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.description)}</p><div class="rate">${Number(x.rate).toLocaleString("es-CO",{maximumFractionDigits:2})}% · ${x.term===1?"Mensual":"Anual"}</div></div><div class="admin-product-actions"><button class="small-action" data-edit="${x.id}">Editar</button><button class="small-action delete" data-delete="${x.id}">Eliminar</button></div></article>`).join(""):'<div class="empty-state">No hay productos. Crea uno para comenzar.</div>';
 $("productCount").textContent=p.length;$("statProducts").textContent=p.length;
 const first=p[0];const example=first?calculate(4000000,first.rate,first.term):0;$("statPremium").textContent=money(example);$("statRate").textContent=first?`${first.rate}%`:"—";}
 form.addEventListener("submit",e=>{e.preventDefault();const p=getProducts(),id=$("productId").value||"p"+Date.now(),item={id,name:$("productName").value.trim(),description:$("productDescription").value.trim(),rate:Number($("productRate").value),term:Number($("productTerm").value),benefit:$("productBenefit").value.trim()||"Opciones flexibles",color:$("productColor").value,symbol:"◈"};if(!item.name||!item.description||!Number.isFinite(item.rate)||item.rate<=0||item.rate>100){alert("Revisa los campos. La tasa debe ser mayor que 0 y no superar el 100%.");return;}const i=p.findIndex(x=>x.id===id);if(i>=0)p[i]=item;else p.push(item);saveProducts(p);render();reset();alert("Producto guardado. El simulador de la página principal ya utiliza esta configuración.");});
 $("resetForm").addEventListener("click",reset);
 list.addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");let p=getProducts();if(edit){const x=p.find(y=>y.id===edit.dataset.edit);if(!x)return;$("productId").value=x.id;$("productName").value=x.name;$("productDescription").value=x.description;$("productRate").value=x.rate;$("productTerm").value=x.term;$("productBenefit").value=x.benefit;$("productColor").value=x.color;$("saveProduct").textContent="Actualizar producto";form.scrollIntoView({behavior:"smooth",block:"start"});}if(del){if(!confirm("¿Eliminar este producto del catálogo?"))return;p=p.filter(x=>x.id!==del.dataset.delete);saveProducts(p);render();}});
 $("restoreDefaults").addEventListener("click",()=>{if(confirm("¿Restaurar los tres productos y tasas iniciales? Se perderán los cambios guardados en este navegador.")){localStorage.removeItem(STORE);render();reset();}});
 render();
}
document.addEventListener("DOMContentLoaded",()=>{initPublic();initAdmin();});