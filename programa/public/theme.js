/* Aplica el tema del panel "Personalizar" a cualquier overlay.
   Cárgalo con <script src="theme.js"></script> antes del resto. */
(function(){
  const BASE={accent:'#e9b949',accent2:'#f6d98a',blue:'#2f80ff',red:'#ff3d55',
    bg1:'#0b1736',bg2:'#060d20',fontH:''};
  window.TEMA=Object.assign({},BASE);
  window.colorLado=(i,porDefecto)=>(i?window.TEMA.red:window.TEMA.blue)||porDefecto;
  function fuente(nombre,url){if(!url)return;
    try{const f=new FontFace(nombre,'url('+url+')');f.load().then(x=>document.fonts.add(x)).catch(()=>{})}catch(e){}}
  function aplicar(t){
    window.TEMA=Object.assign({},BASE,t||{});
    const T=window.TEMA,r=document.documentElement.style;
    r.setProperty('--gold',T.accent);r.setProperty('--gold2',T.accent2);
    r.setProperty('--blue',T.blue);r.setProperty('--red',T.red);
    r.setProperty('--thbg1',T.bg1);r.setProperty('--thbg2',T.bg2);
    if(T.fontH){fuente('TemaTitulos',T.fontH);r.setProperty('--fh',"'TemaTitulos'")}else r.removeProperty('--fh');
    document.dispatchEvent(new CustomEvent('tema'));
  }
  window.aplicarTema=aplicar;
  try{new EventSource('/events?k=theme').onmessage=e=>{try{aplicar(JSON.parse(e.data))}catch(x){}}}catch(e){}
})();
