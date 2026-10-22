/* Equipos guardados. Para agregar o cambiar uno, copia una línea y edita lo que haga falta.
   n    = nombre del equipo
   c    = color
   logo = un archivo dentro de public/logos/equipos/
   tag  = sigla de hasta 4 letras que sale en la franja del centro del draft
   j    = los cinco titulares, siempre en este orden: EXP, JUNGLA, MID, GOLD, ROAM
   cap  = cuál de ellos es el capitán (0 = EXP, 1 = JUNGLA, 2 = MID, 3 = GOLD, 4 = ROAM; -1 = ninguno)
   s    = suplentes: [nombre, línea a la que entra]. Hay tres espacios. */
const EQUIPOS_BASE=[
 {n:'AP.Bren', tag:'APBR',          c:'#f0b429', logo:'/logos/equipos/apbren.png',
  j:['JMPINKMAN','Jamespangks','LanceCy','Shizou','SpiderMilez'], cap:-1, s:[['',0],['',0],['',0]]},
 {n:'Aurora PH', tag:'AUR',        c:'#2ad4c8', logo:'/logos/equipos/aurora.png',
  j:['Nathzz','Koyl','Yue','Domeng','Light'], cap:-1, s:[['',0],['',0],['',0]]},
 {n:'Omega Esports', tag:'OMG',    c:'#1f9a4f', logo:'/logos/equipos/omega.png',
  j:['Louis','Raizen','Minguin','Cull','Perkziva'], cap:-1, s:[['',0],['',0],['',0]]},
 {n:'ONIC Philippines', tag:'ONIC', c:'#ffd400', logo:'/logos/equipos/onic.png',
  j:['Kirk','K1NGKONG','Super Frince','Savero','Brusko'], cap:-1, s:[['',0],['',0],['',0]]},
 {n:'Team Falcons PH', tag:'FLCN',  c:'#2fd18a', logo:'/logos/equipos/falcons.png',
  j:['Flap','Kyle','Hadji','Super Marco','Owgwen'], cap:4, s:[['',0],['',0],['',0]]},
 {n:'Team Liquid PH', tag:'TL',   c:'#2f5fd0', logo:'/logos/equipos/liquid.png',
  j:['Sanford','KarlTzy','Sanji','Teddy','Jaypee'], cap:0, s:[['',0],['',0],['',0]]},
 {n:'TNC Pro Team', tag:'TNC',     c:'#e8622a', logo:'/logos/equipos/tnc.png',
  j:['Ryota','Zaida','Vin','Jowm','Zehn'], cap:-1, s:[['',0],['',0],['',0]]},
 {n:'Twisted Minds PH', tag:'TM', c:'#ff5a8a', logo:'/logos/equipos/twistedminds.png',
  j:['Lansu','Kayn','Sionnn','Bennyqt','Tracy'], cap:-1, s:[['',0],['',0],['',0]]}
];
const LANE_ICON=['/lanes/exp.png','/lanes/jungla.png','/lanes/mid.png','/lanes/gold.png','/lanes/roam.png'];
