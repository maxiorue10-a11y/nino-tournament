/* =============================================================================
   SWISS STAGE — logica compartida entre el panel de programacion y la pantalla.

   Datos (se guardan dentro del estado de programacion, en S.swiss):
     { n: 8 | 16,                       cantidad de equipos
       meta: 3,                         victorias para avanzar = derrotas para quedar afuera
       bo: 3, boDec: 5,                 al mejor de N normal / en partidos decisivos
       teams: [{name, logo}],           en orden de siembra (seed 1 primero)
       rounds: [ [ {a, b, sa, sb} ] ] } cada ronda: cruces por indice de equipo
   Nada se calcula a mano: el record de cada equipo sale de los resultados cargados.
   ============================================================================= */
(function(g){
  function nuevo(n){n=n===16?16:8;
    return {n,meta:3,bo:3,boDec:5,
      teams:Array.from({length:n},()=>({name:'',logo:''})),rounds:[]}}

  function ganador(m){const a=parseInt(m.sa),b=parseInt(m.sb);
    if(isNaN(a)||isNaN(b)||a===b)return -1;return a>b?m.a:m.b}

  /* recorre las rondas y devuelve, para cada una, el record de cada equipo ANTES de jugarla,
     y al final el record actual */
  function calcular(SW){
    const n=SW.teams.length,meta=SW.meta||3;
    let rec=SW.teams.map(()=>({w:0,l:0}));
    const antes=[],enfrentados=SW.teams.map(()=>new Set()),fin=SW.teams.map(()=>-1);
    (SW.rounds||[]).forEach(R=>{
      antes.push(rec.map(x=>({w:x.w,l:x.l})));
      R.forEach(m=>{if(m.a==null||m.b==null||m.a<0||m.b<0)return;
        enfrentados[m.a].add(m.b);enfrentados[m.b].add(m.a);
        const w=ganador(m);if(w<0)return;const l=w===m.a?m.b:m.a;
        rec[w].w++;rec[l].l++;
        [w,l].forEach(i=>{if(fin[i]<0&&(rec[i].w>=meta||rec[i].l>=meta))fin[i]=antes.length-1})})});
    const estado=rec.map(x=>x.w>=meta?'ok':x.l>=meta?'out':'');
    return {antes,rec,estado,enfrentados,fin,meta,n}}

  /* "2-0", "1-1"... del cruce, segun el record del primer equipo antes de esa ronda */
  function grupoDe(C,r,m){const A=C.antes[r]||[],x=A[m.a],y=m.b>=0?A[m.b]:null;
    if(!x)return '0-0';const k=x.w+'-'+x.l;
    if(!y||(y.w===x.w&&y.l===x.l))return k;
    const k2=y.w+'-'+y.l;return (y.w-y.l>x.w-x.l)?k2+' / '+k:k+' / '+k2}
  function esDecisivo(C,r,m){const A=C.antes[r]||[];
    return [A[m.a],A[m.b]].some(x=>x&&(x.w===C.meta-1||x.l===C.meta-1))}

  /* arma la ronda siguiente: junta a los equipos con el mismo record (que sigan en carrera)
     y cruza el mejor sembrado contra el peor, evitando repetir rivales si se puede */
  function armarRonda(SW){const C=calcular(SW),grupos={};
    C.rec.forEach((x,i)=>{if(C.estado[i])return;const k=x.w+'-'+x.l;(grupos[k]=grupos[k]||[]).push(i)});
    const ronda=[],sobran=[];
    Object.keys(grupos).sort((a,b)=>{const[aw,al]=a.split('-').map(Number),[bw,bl]=b.split('-').map(Number);return (bw-bl)-(aw-al)||bw-aw})
     .forEach(k=>{let L=grupos[k].slice();
      while(L.length>1){const a=L.shift();
        let j=L.length-1;while(j>0&&C.enfrentados[a].has(L[j]))j--;
        if(C.enfrentados[a].has(L[j]))j=L.length-1;
        const b=L.splice(j,1)[0];ronda.push({a,b,sa:'',sb:''})}
      if(L.length)sobran.push(L[0])});
    /* el que sobra de un grupo juega contra el que sobra del grupo siguiente */
    while(sobran.length>1){const a=sobran.shift(),b=sobran.shift();ronda.push({a,b,sa:'',sb:''})}
    if(sobran.length)ronda.push({a:sobran[0],b:-1,sa:'',sb:''});
    return ronda}

  /* primera ronda: 1 contra el ultimo, 2 contra el penultimo... */
  function primeraRonda(SW){const n=SW.teams.length,r=[];
    for(let i=0;i<n/2;i++)r.push({a:i,b:n-1-i,sa:'',sb:''});return r}

  function terminado(SW){const C=calcular(SW);return C.estado.every(Boolean)}

  g.SWISS={nuevo,calcular,ganador,grupoDe,esDecisivo,armarRonda,primeraRonda,terminado};
})(window);
