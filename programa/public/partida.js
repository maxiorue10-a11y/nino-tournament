/* =============================================================================
   PARTIDA — datos compartidos por In game (ingame.html) y Resultado (resultado.html).
   Junta tres fuentes y vuelve a dibujar cuando cualquiera cambia:
     - el marcador (kills, oro, torres, lords, tortugas, reloj, jugadores, ganador)
     - el draft (heroes de cada jugador, lineas, logos, BO y partidas ganadas)
     - la programacion (auspiciantes)
   ============================================================================= */
(function(g){
  const P={sb:null,dr:null,sch:null,alCambiar:null};
  function avisar(){if(P.sb&&P.alCambiar)P.alCambiar(P)}
  function escuchar(url,k){const es=new EventSource(url);
    es.onmessage=e=>{try{P[k]=JSON.parse(e.data)}catch(_){return}
      if(k==='dr'&&typeof loadMedia==='function')loadMedia().then(avisar);else avisar()}}
  P.empezar=function(cb){P.alCambiar=cb;
    escuchar('/events?k=scoreboard','sb');escuchar('/events','dr');escuchar('/events?k=schedule','sch')};

  P.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* el oro se escribe "12400" o "12.4k"; se muestra como 12.4K */
  P.oroNum=v=>{const t=String(v==null?'':v).trim().replace(/\s/g,'').replace(',','.');
    if(!t)return null;const m=/^(\d+(?:\.\d+)?)(k)?$/i.exec(t);if(!m)return null;
    return Math.round(parseFloat(m[1])*(m[2]?1000:1))};
  P.oroTxt=n=>n==null?'—':(n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'K':String(n));
  P.num=v=>{const n=parseInt(v,10);return isNaN(n)?0:n};

  /* todo lo de un equipo, ya mezclado */
  P.equipo=function(i){const sb=P.sb||{},dr=P.dr||{},T=(sb.teams||[])[i]||{},D=(dr.teams||[])[i]||{};
    const M=dr.match||{};
    const color=typeof colorLado==='function'?colorLado(i,i?(sb.red||'#ff3d55'):(sb.blue||'#2f80ff')):(i?'#ff3d55':'#2f80ff');
    const jug=[0,1,2,3,4].map(k=>{const p=((sb.players||[])[i]||[])[k]||{};
      return {name:p.name||(D.players||[])[k]||'',kda:p.kda||'',lvl:p.lvl||'',gold:p.gold||'',
        items:(Array.isArray(p.items)?p.items:[]).filter(Boolean).slice(0,6),spell:p.spell||'',talent:p.talent||'',
        hero:((dr.picks||[])[i]||[])[k]||'',lane:(D.lanes||[0,1,2,3,4])[k]}});
    /* el oro del equipo: el que escribiste, o la suma de los jugadores */
    let oro=P.oroNum(T.gold);if(oro==null){const s=jug.map(j=>P.oroNum(j.gold)).filter(x=>x!=null);if(s.length)oro=s.reduce((a,b)=>a+b,0)}
    return {name:T.name||D.name||'',tag:D.tag||'',logo:T.logo||D.logo||'',flag:T.flag||'',color,
      kills:T.kills,gold:oro,turrets:T.turrets,lords:T.lords,turtles:T.turtles,
      wins:(M.wins||[])[i]||0,jug}};
  P.serie=function(){const M=(P.dr&&P.dr.match)||{},C=(P.sb&&P.sb.corner)||{};
    return {bo:+M.bestOf||3,game:M.game||1,stage:C.stage||M.stage||'',tournament:C.tournament||M.tournament||'',
      logo:(P.sb&&P.sb.logo)||M.logo||'',gameTxt:C.game||''}};
  P.sponsors=()=>(((P.sch&&P.sch.sponsors)||[]).concat(((P.sb&&P.sb.sponsor&&P.sb.sponsor.logos)||[]))).filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i);
  P.pips=(n,bo,c)=>Array.from({length:Math.max(1,Math.ceil(bo/2))},(_,k)=>`<i class="${k<n?'on':''}" style="--c:${c}"></i>`).join('');
  g.PARTIDA=P;
})(window);
