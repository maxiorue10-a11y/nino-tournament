/* ============================================================
   ACTUALIZADOR
   Baja la version nueva del programa desde GitHub y la instala sola.

   Como funciona, en simple:
   - En el repositorio hay un archivo "actualizacion.json" que adentro trae
     el numero de version, las novedades y el contenido de TODOS los archivos
     de codigo. Es una sola descarga, no una por archivo.
   - Antes de tocar nada hace una copia de seguridad en la carpeta "respaldos".
   - Solo reemplaza archivos de codigo. NUNCA toca tus imagenes, tus logos,
     tu configuracion ni los datos del torneo.
   ============================================================ */
const fs = require('fs'), path = require('path'), https = require('https'), http = require('http');

// Lo unico que el actualizador puede escribir. Todo lo demas es tuyo y no se toca.
const PERMITIDOS = [
  'server.js', 'actualizador.js', 'package.json', 'INICIAR.bat', 'LEEME.txt', 'CHANGELOG.txt',
  'public/index.html', 'public/control.html', 'public/schedule.html', 'public/marcador.html',
  'public/custom.html', 'public/overlay.html', 'public/scoreboard.html', 'public/schedule-overlay.html',
  'public/cierre.html', 'public/cierre-overlay.html',
  'public/panel.css', 'public/disenos.css', 'public/nav.js', 'public/theme.js', 'public/heroes.js', 'public/equipos.js'
];
/* Ademas de la lista de arriba, se aceptan paginas y hojas de estilo NUEVAS que vengan
   sueltas dentro de public/ (por ejemplo public/cierre.html). Sin esto, cada vez que el
   programa suma una pantalla nueva el actualizador viejo rechazaba la actualizacion entera.
   Ojo: solo archivos sueltos de public/, nunca carpetas adentro (public/heroes/... no entra)
   y solo .html, .css y .js, asi que tu configuracion y tus estados siguen a salvo. */
const NUEVOS_OK = /^public\/[A-Za-z0-9][A-Za-z0-9._-]*\.(html|css|js)$/;
const permitido = p => PERMITIDOS.includes(p) || (NUEVOS_OK.test(p) && !p.includes('..'));

// Carpetas y archivos tuyos: el actualizador los ignora siempre.
const INTOCABLES = ['public/heroes', 'public/picks', 'public/bans', 'public/logos', 'public/lanes',
  'public/voces',
  'configuracion.txt', 'state.json', 'state-schedule.json', 'state-scoreboard.json',
  'state-theme.json', 'state-cierre.json'];

const bajar = (url, redirecciones = 0) => new Promise((ok, mal) => {
  if (redirecciones > 4) return mal(new Error('demasiadas redirecciones'));
  const lib = url.startsWith('http://') ? http : https;
  const req = lib.get(url, { headers: { 'User-Agent': 'nino-tournament', 'Accept': 'application/vnd.github.raw' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume(); return ok(bajar(res.headers.location, redirecciones + 1));
    }
    if (res.statusCode === 404) { res.resume(); return mal(new Error('no encontré el archivo de actualización. Revisá que el repositorio esté bien escrito y que sea público')); }
    if (res.statusCode !== 200) { res.resume(); return mal(new Error('el servidor respondió ' + res.statusCode)); }
    let d = ''; res.setEncoding('utf8');
    res.on('data', c => { d += c; if (d.length > 40e6) { req.destroy(); mal(new Error('la descarga es demasiado grande')); } });
    res.on('end', () => ok(d));
  });
  req.setTimeout(20000, () => { req.destroy(); mal(new Error('el servidor no contestó a tiempo')); });
  req.on('error', e => mal(new Error('no se pudo conectar: ' + e.message)));
});

/* Compara "0.17.0" con "0.18.1" y dice si la segunda es mas nueva */
function esMasNueva(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { const x = pa[i] || 0, y = pb[i] || 0; if (y > x) return true; if (y < x) return false; }
  return false;
}

/* Busca la version que hay publicada. repo = "usuario/repositorio" */
async function buscar(repo, versionActual) {
  if (!repo) throw new Error('Todavía no configuraste el repositorio en configuracion.txt');
  // se puede poner "usuario/repositorio" (GitHub) o directamente la direccion del archivo
  const fuentes = /^https?:\/\//.test(repo) ? [repo]
    : (/^[\w.-]+\/[\w.-]+$/.test(repo)
        ? ['https://raw.githubusercontent.com/' + repo + '/main/actualizacion.json',
           'https://api.github.com/repos/' + repo + '/contents/actualizacion.json?ref=main']
        : null);
  if (!fuentes) throw new Error('El repositorio debe escribirse asi: usuario/repositorio');
  let ultimo = null;
  for (const u of fuentes) {
    try {
      const txt = await bajar(u);
      const d = JSON.parse(txt);
      // GitHub por API devuelve el contenido en base64; por raw lo devuelve tal cual
      const paquete = d.archivos ? d : JSON.parse(Buffer.from(d.content || '', 'base64').toString('utf8'));
      if (!paquete || !paquete.version || !paquete.archivos) throw new Error('el archivo de actualización está incompleto');
      return {
        instalada: versionActual, disponible: paquete.version,
        hayNueva: esMasNueva(versionActual, paquete.version),
        notas: String(paquete.notas || ''), paquete
      };
    } catch (e) { ultimo = e; }
  }
  throw ultimo || new Error('no se pudo consultar');
}

/* Instala el paquete ya descargado. Devuelve el resumen de lo que hizo. */
function instalar(raiz, paquete) {
  const archivos = paquete.archivos || {};
  const nombres = Object.keys(archivos);
  if (!nombres.length) throw new Error('la actualización no trae ningún archivo');

  // 1) revisamos TODO antes de escribir una sola linea
  for (const n of nombres) {
    const limpio = n.replace(/\\/g, '/');
    if (!permitido(limpio))
      throw new Error('la actualización quiere tocar un archivo que no corresponde: ' + n);
    if (INTOCABLES.some(x => limpio === x || limpio.startsWith(x + '/')))
      throw new Error('la actualización quiere tocar tus archivos: ' + n);
    if (typeof archivos[n] !== 'string' || !archivos[n].length)
      throw new Error('el archivo ' + n + ' vino vacío');
  }

  // 2) copia de seguridad de lo que esta instalado ahora
  const sello = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  const dirResp = path.join(raiz, 'respaldos', 'v' + require('./package.json').version + '-' + sello);
  let guardados = 0;
  for (const n of nombres) {
    const origen = path.join(raiz, n);
    if (!fs.existsSync(origen)) continue;
    const destino = path.join(dirResp, n);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origen, destino);
    guardados++;
  }

  // 3) recien ahora escribimos
  for (const n of nombres) {
    const destino = path.join(raiz, n);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, archivos[n], 'utf8');
  }
  return { escritos: nombres.length, respaldados: guardados, respaldo: path.relative(raiz, dirResp) };
}

module.exports = { buscar, instalar, esMasNueva, PERMITIDOS, permitido };
