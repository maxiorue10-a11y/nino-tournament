/* =============================================================================
   ITEMS — los iconos de public/items (items, hechizos y talentos de emblema).
   Las imagenes son tuyas: el programa solo las lista y las muestra.
   ITEMS.cargar() las pide al servidor; despues:
     ITEMS.lista(cat)  -> nombres de archivo de una categoria ('item','hechizo','talento','clase')
     ITEMS.url(n)      -> direccion de la imagen
     ITEMS.nombre(n)   -> nombre lindo para mostrar
   ============================================================================= */
(function(g){
  const clave=n=>String(n||'').replace(/\.[a-z0-9]+$/i,'').replace(/_/g,' ').trim().toLowerCase();
  const HECHIZOS=['aegis','arrival','execute','flameshot','flicker','inspire','petrify','purify','revitalize',
    'sprint','vengeance','retribution','ice retribution','flame retribution','bloody retributio'];
  const CLASES=['assasin','fighter','mage','marksman','support','tank','basic common'];
  const TALENTOS=['agility','bargain hunter','brave smite','concussive blast','fatal','festival of blood','firmness',
    'focusing mark','impure rage','inspire mage','killing spree','lethal ignition','master assasin',
    'pull yourself together','quantum charge','rupture','seasoned hunter','swift','temporal reign','tenacity',
    'thrill','vitality','war cry','weakness finder','weapon master','wilderness blessing'];
  const OCULTOS=['idle'];
  let TODOS=[],prom=null;
  const cat=n=>{const k=clave(n);return HECHIZOS.includes(k)?'hechizo':CLASES.includes(k)?'clase':TALENTOS.includes(k)?'talento':OCULTOS.includes(k)?'':'item'};
  const I={
    cargar(){return prom||(prom=fetch('/api/media').then(r=>r.json()).then(d=>{TODOS=(d.items||[]).slice().sort((a,b)=>clave(a).localeCompare(clave(b)));return TODOS}).catch(()=>[]))},
    lista(c){return TODOS.filter(n=>cat(n)===c)},
    todos(){return TODOS},
    cat,
    url(n){return n?'/items/'+String(n).split('/').map(encodeURIComponent).join('/'):''},
    nombre(n){const k=clave(n).replace(/\bretributio\b/,'retribution');return k.replace(/\b\w/g,c=>c.toUpperCase())},
    img(n,cls){return n?`<img class="${cls||''}" src="${I.url(n)}" alt="" onerror="this.style.visibility='hidden'">`:''}
  };
  g.ITEMS=I;
})(window);
