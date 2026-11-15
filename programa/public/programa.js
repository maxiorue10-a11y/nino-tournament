/* =============================================================================
   PROGRAMA — ayudas compartidas por las pantallas que usan los datos del Control
   de programacion (agenda, espera Fase suiza, comentaristas, knockout).
   Uso: PROG.empezar(S => { ...dibujar... })
   ============================================================================= */
(function(g){
  const P={S:null,spi:0,cb:null};
  P.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  P.empezar=function(cb){P.cb=cb;
    new EventSource('/events?k=schedule').onmessage=e=>{const d=JSON.parse(e.data);if(!d||!d.matches)return;
      d.ev=d.ev||{};d.cd=d.cd||{};d.sw=d.sw||{};d.show=d.show||{};P.S=d;cb(d);P.pintarSpon()};
    setInterval(()=>{P.spi++;P.pintarSpon()},7000);
    setInterval(()=>{if(P.S)P.pintarReloj()},500)};

  /* ---------- partidos ---------- */
  P.partidos=()=>(P.S.matches||[]).map((m,i)=>Object.assign({i},m)).filter(m=>m.on);
  P.actual=()=>{const L=P.partidos();return L.find(m=>m.i===P.S.actual)||L[0]||null};
  P.corto=t=>{const n=String((t&&t.name)||'').trim();if(!n)return 'Por definir';
    const p=n.split(/\s+/);return n.length<=8?n:(p[0].length>=2?p[0]:n.slice(0,8))};

  /* ---------- comentaristas (los grupos prendidos, hasta 4) ---------- */
  P.gente=(max)=>{const g=[],S=P.S;[['hosts',0],['casters',1],['analysts',2]].forEach(([k,i])=>{
    if(S.show[k]&&S.talent&&S.talent[i])S.talent[i].people.forEach(p=>{if(p.name)g.push(p)})});return g.slice(0,max||4)};

  /* ---------- auspiciantes: cada logo con su texto (separados por comas) ---------- */
  P.sponsor=()=>{const L=(P.S.sponsors||[]).filter(Boolean);if(!L.length||P.S.sw.sponsor===false)return null;
    const et=String(P.S.sponsorLabels||'').split(',').map(x=>x.trim());const i=P.spi%L.length;
    return {logo:L[i],etq:et.length>1?(et[i]||''):(et[0]||'')}};
  P.pintarSpon=()=>{if(!P.S)return;const s=P.sponsor();
    document.querySelectorAll('[data-spon]').forEach(el=>{
      el.innerHTML=s?`${el.dataset.spon==='etq'&&s.etq?`<small>${P.esc(s.etq)}</small>`:''}<img src="${s.logo}">`:''})};

  /* ---------- cuenta regresiva ---------- */
  P.faltan=()=>{const C=P.S.cd||{};if(C.hasta)return Math.round((C.hasta-Date.now())/1000);
    if(!C.at)return null;const[h,m]=C.at.split(':').map(Number);if(isNaN(h))return null;
    const o=new Date();o.setHours(h,m||0,0,0);let s=Math.round((o-Date.now())/1000);if(s<-3600)s+=86400;return s};
  P.reloj=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;
    return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0')};
  P.pintarReloj=()=>{document.querySelectorAll('[data-reloj]').forEach(el=>{const C=P.S.cd||{};
    if(P.S.sw.countdown===false){el.innerHTML='';return}
    const s=P.faltan();if(s===null){el.innerHTML='';return}
    el.innerHTML=s>0?`<small>${P.esc(C.label||'Empezamos en:')}</small><b>${P.reloj(s)}</b>`:`<em>${P.esc(C.end||'¡Empezamos!')}</em>`})};

  /* ---------- ticker de abajo ---------- */
  P.ticker=()=>{const S=P.S,t=String(S.ticker||'').trim();if(!t||S.sw.ticker===false)return '';
    const partes=t.split('|').map(x=>x.trim()).filter(Boolean),uno=partes.map(x=>`<span>${P.esc(x)}</span><i>➤</i>`).join('');
    return `<div class="tick"><div class="tk">${uno.repeat(8)}</div></div>`};
  /* Fondo con ventanas huecas, armado con rectangulos alrededor de los huecos.
     (Antes se recortaba con clip-path: path(), que el navegador de OBS no dibuja bien:
     con eso dejaban de verse todas las imagenes de la pagina.) */
  P.huecos=(el,H)=>{const ys=[0,1080];H.forEach(r=>ys.push(r.y,r.y+r.h));
    const Y=[...new Set(ys)].filter(y=>y>=0&&y<=1080).sort((a,b)=>a-b);let html='';
    const pieza=(x,y,w,h)=>{if(w>0&&h>0)html+=`<div style="position:absolute;overflow:hidden;left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="fbg" style="left:${-x}px;top:${-y}px"></div></div>`};
    for(let i=0;i<Y.length-1;i++){const y0=Y[i],y1=Y[i+1];
      const fuera=H.filter(r=>r.y<y1&&r.y+r.h>y0).map(r=>[r.x,r.x+r.w]).sort((a,b)=>a[0]-b[0]);
      let x=0;fuera.forEach(([a,b])=>{pieza(x,y0,a-x,y1-y0);x=Math.max(x,b)});pieza(x,y0,1920-x,y1-y0)}
    el.innerHTML=html};
  /* achica el texto hasta que entre en su caja */
  P.encajar=(sel,max,min)=>document.querySelectorAll(sel).forEach(el=>{let f=max;el.style.fontSize=f+'px';
    while(el.scrollWidth>el.clientWidth+1&&f>min){f--;el.style.fontSize=f+'px'}});
  /* solo se rehace si cambio el texto, asi no salta cada vez que se guarda algo */
  P.ponerTicker=el=>{const h=P.ticker();if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}};
  P.tickerCSS=`.tick{position:absolute;left:0;right:0;bottom:0;height:56px;overflow:hidden;background:rgba(7,10,18,.92);
     border-top:2px solid rgba(233,185,73,.5)}
   .tick .tk{display:flex;align-items:center;height:100%;white-space:nowrap;animation:tk 60s linear infinite}
   .tick span{font-size:26px;font-weight:700;letter-spacing:3px;padding:0 26px}
   .tick i{font-style:normal;color:#e9b949;font-size:22px}
   @keyframes tk{to{transform:translateX(-50%)}}`;
  g.PROG=P;
})(window);
