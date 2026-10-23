/* Barra de navegación y cambio de tema (claro / oscuro). */
(function(){let t='oscuro';try{t=localStorage.getItem('tema')||'oscuro'}catch(e){}
  document.documentElement.dataset.tema=t})();

function aplicarTemaUI(t){document.documentElement.dataset.tema=t;
  try{localStorage.setItem('tema',t)}catch(e){}
  const b=document.getElementById('tbtn');
  if(b){b.textContent=t==='claro'?'☾':'☀';
    b.title=t==='claro'?'Cambiar a modo oscuro':'Cambiar a modo claro'}}
function alternarTema(){aplicarTemaUI(document.documentElement.dataset.tema==='claro'?'oscuro':'claro')}

/* ---------- nivel de acceso ----------
   Desde esta computadora siempre sos administrador. Desde otra compu depende de la clave
   que haya usado: admin, colaborador o invitado. El servidor es el que manda, esto solo
   esconde los botones que esa persona no va a poder usar. */
let ROL='admin';
const puedeEditar=()=>ROL!=='invitado';
const esAdmin=()=>ROL==='admin';
function aplicarRol(){
  document.documentElement.dataset.rol=ROL;
  const b=document.getElementById('rolchip');
  if(b){const n={admin:'',colaborador:'Colaborador',invitado:'Solo lectura'}[ROL]||'';
    b.textContent=n;b.style.display=n?'':'none';b.className='rolchip '+ROL}
  if(ROL==='invitado'){
    document.querySelectorAll('main input,main select,main textarea,main button,#top .acts button')
      .forEach(el=>{el.disabled=true});
    document.querySelectorAll('.atajos').forEach(el=>{el.style.display='none'});
  }
}
function cargarRol(despues){
  fetch('/api/rol').then(r=>r.json()).then(d=>{ROL=d.rol||'admin';aplicarRol();if(despues)despues()})
   .catch(()=>{if(despues)despues()})}

function navHTML(actual){
  const items=[['/','Inicio'],['/control.html','Draft'],['/schedule.html','Programación'],
               ['/marcador.html','Marcador'],['/cierre.html','Cierre'],['/custom.html','Personalizar']];
  setTimeout(()=>{aplicarTemaUI(document.documentElement.dataset.tema||'oscuro');aplicarRol()},0);
  return '<span class="rolchip" id="rolchip" style="display:none"></span>'
    +'<nav class="nav">'+items.map(([u,n])=>
    `<a href="${u}"${actual===u?' class="on"':''}>${n}</a>`).join('')+
    '<button class="tbtn" id="tbtn" onclick="alternarTema()"></button></nav>';
}
