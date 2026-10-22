// Lista de heroes (133) - fuente: mlbbhub.com, parche 2.2.16a, oct 2026
// Para agregar uno nuevo: copia una linea y cambia el nombre y los roles.
const HEROES=[{"n":"Aamon","r":["Assassin"]},
{"n":"Akai","r":["Tank"]},
{"n":"Aldous","r":["Fighter"]},
{"n":"Alice","r":["Tank","Mage"]},
{"n":"Alpha","r":["Fighter"]},
{"n":"Alucard","r":["Fighter","Assassin"]},
{"n":"Angela","r":["Support"]},
{"n":"Argus","r":["Fighter"]},
{"n":"Arlott","r":["Fighter","Assassin"]},
{"n":"Atlas","r":["Tank"]},
{"n":"Aulus","r":["Fighter"]},
{"n":"Aurora","r":["Mage"]},
{"n":"Badang","r":["Fighter"]},
{"n":"Balmond","r":["Fighter"]},
{"n":"Bane","r":["Fighter","Mage"]},
{"n":"Barats","r":["Tank","Fighter"]},
{"n":"Baxia","r":["Tank"]},
{"n":"Beatrix","r":["Marksman"]},
{"n":"Belerick","r":["Tank"]},
{"n":"Benedetta","r":["Assassin","Fighter"]},
{"n":"Brody","r":["Marksman"]},
{"n":"Bruno","r":["Marksman"]},
{"n":"Carmilla","r":["Support","Tank"]},
{"n":"Cecilion","r":["Mage"]},
{"n":"Chang'e","r":["Mage"]},
{"n":"Chip","r":["Support","Tank"]},
{"n":"Chou","r":["Fighter"]},
{"n":"Cici","r":["Fighter"]},
{"n":"Claude","r":["Marksman"]},
{"n":"Clint","r":["Marksman"]},
{"n":"Cyclops","r":["Mage"]},
{"n":"Diggie","r":["Support"]},
{"n":"Dyrroth","r":["Fighter"]},
{"n":"Edith","r":["Tank","Marksman"]},
{"n":"Esmeralda","r":["Tank","Mage"]},
{"n":"Estes","r":["Support"]},
{"n":"Eudora","r":["Mage"]},
{"n":"Fanny","r":["Assassin"]},
{"n":"Faramis","r":["Support","Mage"]},
{"n":"Floryn","r":["Support"]},
{"n":"Franco","r":["Tank"]},
{"n":"Fredrinn","r":["Fighter","Tank"]},
{"n":"Freya","r":["Fighter"]},
{"n":"Gatotkaca","r":["Tank","Fighter"]},
{"n":"Gloo","r":["Tank"]},
{"n":"Gord","r":["Mage"]},
{"n":"Granger","r":["Marksman"]},
{"n":"Grock","r":["Tank","Fighter"]},
{"n":"Guinevere","r":["Fighter"]},
{"n":"Gusion","r":["Assassin"]},
{"n":"Hanabi","r":["Marksman"]},
{"n":"Hanzo","r":["Assassin"]},
{"n":"Harith","r":["Mage"]},
{"n":"Harley","r":["Assassin","Mage"]},
{"n":"Hayabusa","r":["Assassin"]},
{"n":"Helcurt","r":["Assassin"]},
{"n":"Hilda","r":["Fighter","Tank"]},
{"n":"Hirara","r":["Assassin"]},
{"n":"Hylos","r":["Tank"]},
{"n":"Irithel","r":["Marksman"]},
{"n":"Ixia","r":["Marksman"]},
{"n":"Jawhead","r":["Fighter"]},
{"n":"Johnson","r":["Tank","Support"]},
{"n":"Joy","r":["Assassin"]},
{"n":"Julian","r":["Assassin","Fighter"]},
{"n":"Kadita","r":["Mage","Assassin"]},
{"n":"Kagura","r":["Mage"]},
{"n":"Kaja","r":["Support"]},
{"n":"Kalea","r":["Support","Fighter"]},
{"n":"Karina","r":["Assassin"]},
{"n":"Karrie","r":["Marksman"]},
{"n":"Khaleed","r":["Fighter"]},
{"n":"Khufra","r":["Tank"]},
{"n":"Kimmy","r":["Marksman","Mage"]},
{"n":"Lancelot","r":["Assassin"]},
{"n":"Lapu-Lapu","r":["Fighter"]},
{"n":"Layla","r":["Marksman"]},
{"n":"Leomord","r":["Fighter"]},
{"n":"Lesley","r":["Marksman","Assassin"]},
{"n":"Ling","r":["Assassin"]},
{"n":"Lolita","r":["Support","Tank"]},
{"n":"Lukas","r":["Fighter"]},
{"n":"Lunox","r":["Mage"]},
{"n":"Luo Yi","r":["Mage"]},
{"n":"Lylia","r":["Mage"]},
{"n":"Marcel","r":["Support"]},
{"n":"Martis","r":["Fighter"]},
{"n":"Masha","r":["Fighter","Tank"]},
{"n":"Mathilda","r":["Support","Assassin"]},
{"n":"Melissa","r":["Marksman"]},
{"n":"Minotaur","r":["Tank","Support"]},
{"n":"Minsitthar","r":["Fighter"]},
{"n":"Miya","r":["Marksman"]},
{"n":"Moskov","r":["Marksman"]},
{"n":"Nana","r":["Mage"]},
{"n":"Natalia","r":["Assassin"]},
{"n":"Natan","r":["Marksman"]},
{"n":"Nolan","r":["Assassin"]},
{"n":"Novaria","r":["Mage"]},
{"n":"Obsidia","r":["Marksman"]},
{"n":"Odette","r":["Mage"]},
{"n":"Paquito","r":["Fighter","Assassin"]},
{"n":"Pharsa","r":["Mage"]},
{"n":"Phoveus","r":["Fighter"]},
{"n":"Popol and Kupa","r":["Marksman"]},
{"n":"Rafaela","r":["Support"]},
{"n":"Roger","r":["Fighter","Marksman"]},
{"n":"Ruby","r":["Fighter"]},
{"n":"Saber","r":["Assassin"]},
{"n":"Selena","r":["Assassin","Mage"]},
{"n":"Silvanna","r":["Fighter"]},
{"n":"Sora","r":["Fighter","Assassin"]},
{"n":"Sun","r":["Fighter"]},
{"n":"Suyou","r":["Assassin","Fighter"]},
{"n":"Terizla","r":["Fighter","Tank"]},
{"n":"Thamuz","r":["Fighter"]},
{"n":"Tigreal","r":["Tank"]},
{"n":"Uranus","r":["Tank"]},
{"n":"Vale","r":["Mage"]},
{"n":"Valentina","r":["Mage"]},
{"n":"Valir","r":["Mage"]},
{"n":"Vexana","r":["Mage"]},
{"n":"Wanwan","r":["Marksman"]},
{"n":"X.Borg","r":["Fighter"]},
{"n":"Xavier","r":["Mage"]},
{"n":"Yi Sun-shin","r":["Assassin","Marksman"]},
{"n":"Yin","r":["Fighter","Assassin"]},
{"n":"Yu Zhong","r":["Fighter"]},
{"n":"Yve","r":["Mage"]},
{"n":"Zetian","r":["Mage"]},
{"n":"Zhask","r":["Mage"]},
{"n":"Zhuxin","r":["Mage"]},
{"n":"Zilong","r":["Fighter","Assassin"]}];
const ROLES_ES={Fighter:'Exp',Mage:'Mago',Marksman:'Tirador',Assassin:'Asesino',Tank:'Tanque',Support:'Soporte'};
const _key=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const _map=Object.fromEntries(HEROES.map(h=>[_key(h.n),h]));
function roleOf(name){const h=_map[_key(name)];return h?h.r.map(x=>ROLES_ES[x]).join(' / '):''}

// --- Archivos de heroes (tolera .webm .mp4 .png .jpg .webp y errores pequenos de escritura) ---
function osa(a,b){const m=a.length,n=b.length,d=[];for(let i=0;i<=m;i++)d[i]=[i];for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
 if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[m][n]}
function suggestHero(v,max=2){const k=_key(v);let best='',bd=max+1;HEROES.forEach(x=>{const d=osa(k,_key(x.n));if(d<bd){bd=d;best=x.n}});return best}
let MEDIA={heroes:{},picks:{},bans:{}};
/* Tres carpetas: picks/ para el arte de los picks, bans/ para los retratos de baneo
   y heroes/ como respaldo de las dos. */
function _indexar(lista){const pr=f=>/\.webm$/i.test(f)?0:/\.mp4$/i.test(f)?1:2;
  const l=(lista||[]).slice().sort((a,b)=>pr(a)-pr(b)),m={};
  l.forEach(f=>{const k=_key(f.replace(/\.[^.]+$/,''));if(!m[k])m[k]=f});return m}
function loadMedia(){return fetch('/api/media',{cache:'no-store'}).then(r=>r.json()).then(d=>{
  if(Array.isArray(d))d={heroes:d,picks:[],bans:[]};
  MEDIA={heroes:_indexar(d.heroes),picks:_indexar(d.picks),bans:_indexar(d.bans)}}).catch(()=>{})}
function _buscar(carpeta,k){const m=MEDIA[carpeta]||{};let f=m[k];
  if(!f&&k.length>=5){const c=Object.keys(m).filter(x=>osa(x,k)<=1);if(c.length===1)f=m[c[0]]}
  return f?'/'+carpeta+'/'+encodeURIComponent(f):''}
/* tipo: 'pick', 'ban' o nada (solo la carpeta general) */
function mediaFor(name,tipo){const k=_key(name);if(!k)return '';
  if(tipo==='pick'){return _buscar('picks',k)||_buscar('heroes',k)}
  if(tipo==='ban'){return _buscar('bans',k)||_buscar('heroes',k)}
  return _buscar('heroes',k)||_buscar('picks',k)||_buscar('bans',k)}

// --- Flujo del draft 5/5. Cada paso: [tipo, equipo]   0 = equipo azul (1), 1 = equipo rojo (2)
// Fase 1: baneos A-R-A-R-A-R, picks A | R R | A A | R        (3/5)
// Fase 2: baneos R-A-R-A,     picks R | A A | R               (5/5)
const DRAFT_FLOW=[['ban',0],['ban',1],['ban',0],['ban',1],['ban',0],['ban',1],
                  ['pick',0],['pick',1],['pick',1],['pick',0],['pick',0],['pick',1],
                  ['ban',1],['ban',0],['ban',1],['ban',0],
                  ['pick',1],['pick',0],['pick',0],['pick',1]];
function flowInfo(step){const f=DRAFT_FLOW[step];if(!f)return null;let slot=0;
 for(let i=0;i<step;i++)if(DRAFT_FLOW[i][0]===f[0]&&DRAFT_FLOW[i][1]===f[1])slot++;return{type:f[0],team:f[1],slot}}
function flowCount(type,team){return DRAFT_FLOW.filter(x=>x[0]===type&&x[1]===team).length}
