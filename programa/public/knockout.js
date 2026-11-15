/* =============================================================================
   KNOCKOUT STAGE — doble eliminacion de 8 equipos (logica compartida).
   Datos (en el estado de programacion, S.ko):
     { teams:[{name,logo}] x8,  orden de los cruces de la primera ronda
       res:{ '1':{a:'',b:''}, ... },   resultado de cada partido
       bo:{ '1':3, ... } }             al mejor de N de cada partido (opcional)
   Los ganadores y perdedores pasan solos al partido que les toca.
   ============================================================================= */
(function(g){
  /* a / b: {t:i} equipo sembrado, {w:n} ganador del partido n, {l:n} perdedor del partido n */
  const PARTIDOS=[
    {id:1,a:{t:0},b:{t:1},bo:3,zona:'up'},{id:2,a:{t:2},b:{t:3},bo:3,zona:'up'},
    {id:3,a:{t:4},b:{t:5},bo:3,zona:'up'},{id:4,a:{t:6},b:{t:7},bo:3,zona:'up'},
    {id:5,a:{w:1},b:{w:2},bo:5,zona:'up'},{id:6,a:{w:3},b:{w:4},bo:5,zona:'up'},
    {id:7,a:{l:1},b:{l:2},bo:5,zona:'low'},{id:8,a:{l:3},b:{l:4},bo:5,zona:'low'},
    {id:9,a:{l:6},b:{w:7},bo:5,zona:'low'},{id:10,a:{l:5},b:{w:8},bo:5,zona:'low'},
    {id:11,a:{w:5},b:{w:6},bo:5,zona:'up'},{id:12,a:{w:9},b:{w:10},bo:5,zona:'low'},
    {id:13,a:{l:11},b:{w:12},bo:5,zona:'low'},{id:14,a:{w:11},b:{w:13},bo:7,zona:'gf'}];
  function nuevo(){return {teams:Array.from({length:8},()=>({name:'',logo:''})),res:{},bo:{}}}
  function calcular(K){const out={};
    const quien=(s)=>{if(s.t!=null)return s.t;const o=out[s.w||s.l];if(!o)return null;return s.w?o.gan:o.per};
    PARTIDOS.forEach(p=>{const a=quien(p.a),b=quien(p.b),r=(K.res||{})[p.id]||{};
      const x=parseInt(r.a),y=parseInt(r.b),need=Math.ceil(((K.bo||{})[p.id]||p.bo)/2);
      let gan=null,per=null;
      /* hay ganador cuando alguno llega a las partidas que necesita (o si el resultado es distinto y se marca terminado) */
      if(a!=null&&b!=null&&!isNaN(x)&&!isNaN(y)&&x!==y&&(Math.max(x,y)>=need||r.fin)){gan=x>y?a:b;per=x>y?b:a}
      out[p.id]={id:p.id,a,b,sa:r.a==null?'':r.a,sb:r.b==null?'':r.b,gan,per,bo:(K.bo||{})[p.id]||p.bo,zona:p.zona,src:p}});
    return out}
  const texto=s=>s.t!=null?'Equipo '+(s.t+1):(s.w?'Ganador ':'Perdedor ')+(s.w===14||s.l===14?'Gran final':'Match '+(s.w||s.l));
  const nombre=id=>id===14?'Gran final':'Match '+id;
  g.KNOCKOUT={PARTIDOS,nuevo,calcular,texto,nombre};
})(window);
