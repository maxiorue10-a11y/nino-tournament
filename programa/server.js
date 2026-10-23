// Servidor de overlays (no necesita instalar nada extra, solo Node.js)
const http = require('http'), fs = require('fs'), path = require('path');
const actualizador = require('./actualizador');
const PORT = 3000, PUB = path.join(__dirname, 'public');
const VERSION = require('./package.json').version;

/* ---------- configuracion.txt: quien puede entrar ----------
   red=solo-esta-pc  -> nadie de afuera puede abrir los paneles (lo mas seguro)
   red=abierta       -> se puede entrar desde otra compu de la misma red, con una clave.
   Hay tres claves, cada una da permisos distintos:
     clave              ADMIN        puede todo
     clave-colaborador  COLABORADOR  carga draft, marcador y programacion, pero no sube ni borra
                                     archivos y no entra a Personalizar
     clave-invitado     INVITADO     solo mira, no puede cambiar nada
   La clave que se deja vacia simplemente no existe: nadie puede entrar con ese nivel. */
const CFG = { red: 'solo-esta-pc', 'clave': '', 'clave-colaborador': '', 'clave-invitado': '', 'actualizaciones': '', 'abrir-navegador': 'si' };
const ARCH_CFG = path.join(__dirname, 'configuracion.txt');
let cfgMtime = 0, cfgIniciada = false;
/* Lee configuracion.txt. Se vuelve a leer solo cuando el archivo cambia, asi editarlo
   no obliga a cerrar y abrir el programa. (Cambiar "red" si necesita reiniciar: el
   programa ya quedo escuchando de una manera o de la otra.) */
function leerConfig() {
  let txt, st;
  try { st = fs.statSync(ARCH_CFG); } catch (e) { return; }
  if (st.mtimeMs === cfgMtime) return;
  cfgMtime = st.mtimeMs;
  try { txt = fs.readFileSync(ARCH_CFG, 'utf8'); } catch (e) { return; }
  txt.split('\n').forEach(l => {
    const m = /^\s*([a-z-]+)\s*=\s*(.*?)\s*$/.exec(l.split('#')[0] || '');
    if (!m || CFG[m[1]] === undefined) return;
    // Error comun: pegar la linea entera y que quede "clave=clave=loquesea".
    // Si el valor empieza repitiendo el nombre, le sacamos esa parte.
    let v = m[2];
    const repetido = new RegExp('^' + m[1] + '\\s*=\\s*');
    while (repetido.test(v)) v = v.replace(repetido, '');
    CFG[m[1]] = v;
  });
  // si la red esta abierta nunca puede quedar sin clave de admin
  if (cfgIniciada && ABIERTA && !CFG['clave']) CFG['clave'] = claveInventada;
}
leerConfig();
const ABIERTA = CFG.red.toLowerCase().startsWith('abierta');
// Si la abrieron sin poner clave de admin, inventamos una para que nunca quede sin proteccion
const claveInventada = String(Math.floor(1000 + Math.random() * 9000));
if (ABIERTA && !CFG['clave']) CFG['clave'] = claveInventada;
cfgIniciada = true;
const HOST = ABIERTA ? '0.0.0.0' : '127.0.0.1';

/* Revisa que esten las carpetas con las imagenes. El error mas comun es arrancar el
   programa desde la carpeta de la actualizacion (que trae solo el codigo) en vez de
   hacerlo desde tu carpeta de siempre. */
const CARPETAS = { heroes: 'imágenes de los héroes', lanes: 'iconos de las líneas', logos: 'logos de los equipos' };
function revisarArchivos() {
  const faltan = [];
  for (const d in CARPETAS) {
    let n = 0;
    try { n = fs.readdirSync(path.join(PUB, d)).filter(f => /\.(png|jpe?g|webp|gif|webm|mp4)$/i.test(f)).length; }
    catch (e) { n = 0; }
    if (!n) faltan.push({ carpeta: 'public/' + d, que: CARPETAS[d] });
  }
  return faltan;
}

const esDeEstaPC = req => {
  const ip = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  return ip === '127.0.0.1' || ip === '::1';
};
const claveDe = req => {
  let q = '';
  try { q = new URL(req.url, 'http://x').searchParams.get('clave') || ''; } catch (e) {}
  if (q) return q;
  const ck = /(?:^|;\s*)clave=([^;]*)/.exec(req.headers.cookie || '');
  try { return ck ? decodeURIComponent(ck[1]) : ''; } catch (e) { return ''; }
};
/* Devuelve 'admin', 'colaborador', 'invitado', o null si la clave no sirve.
   Desde esta misma computadora siempre sos admin: es tu programa. */
const rolDe = req => {
  if (!ABIERTA || esDeEstaPC(req)) return 'admin';
  const k = claveDe(req);
  if (!k) return null;
  if (CFG['clave'] && k === CFG['clave']) return 'admin';
  if (CFG['clave-colaborador'] && k === CFG['clave-colaborador']) return 'colaborador';
  if (CFG['clave-invitado'] && k === CFG['clave-invitado']) return 'invitado';
  return null;
};
const pedirClave = res => {
  res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Nino Tournament</title>'
    + '<body style="background:#101216;color:#e6e8ec;font:16px Segoe UI,Arial;display:grid;place-items:center;height:100vh;margin:0">'
    + '<form style="text-align:center;max-width:320px" onsubmit="document.cookie=\'clave=\'+encodeURIComponent(c.value)+\';path=/\';location.href=location.pathname;return false">'
    + '<h2 style="color:#d9a93f;font-weight:600">Nino Tournament</h2>'
    + '<p style="color:#7e858f;font-size:14px">Escribe tu clave. Según cuál uses entrarás como administrador, colaborador o invitado.</p>'
    + '<input id="c" autofocus style="width:100%;padding:11px;border-radius:9px;border:1px solid #272b33;background:#0c0e12;color:#e6e8ec;text-align:center;font-size:19px;letter-spacing:3px">'
    + '<button style="margin-top:12px;width:100%;padding:11px;border-radius:9px;border:0;background:#d9a93f;color:#1a1408;font-weight:600;font-size:15px;cursor:pointer">Entrar</button>'
    + '</form></body>');
};

// Un estado por canal: "draft" (el draft) y "schedule" (la programación)
const CANALES = ['draft', 'schedule', 'scoreboard', 'theme'];
const archivo = k => path.join(__dirname, k === 'draft' ? 'state.json' : 'state-' + k + '.json');
const estado = {}, clientes = {};
CANALES.forEach(k => {
  clientes[k] = new Set();
  try { estado[k] = JSON.parse(fs.readFileSync(archivo(k), 'utf8')); } catch (e) { estado[k] = {}; }
});
const canalDe = req => {
  const k = new URL(req.url, 'http://x').searchParams.get('k') || 'draft';
  return CANALES.includes(k) ? k : 'draft';
};

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.webm': 'video/webm', '.mp4': 'video/mp4' };

const servidor = http.createServer((req, res) => {
  // Una direccion mal escrita (por ejemplo con un % suelto) no debe tirar el programa:
  // si no se puede leer, se responde 400 y seguimos transmitiendo.
  let url;
  try { url = decodeURIComponent(req.url.split('?')[0]); }
  catch (e) { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Direccion no valida'); }
  const json = (code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };

  // por si editaron configuracion.txt mientras el programa estaba abierto
  leerConfig();

  // Desde otra compu de la red hay que poner la clave una vez
  const rol = rolDe(req);
  if (!rol) return pedirClave(res);
  const puedeEscribir = rol === 'admin' || rol === 'colaborador';
  const noPuede = (q) => json(403, { error: 'Tu clave no permite ' + q + '.' });

  if (url === '/version') return json(200, { version: VERSION, faltan: revisarArchivos(), carpeta: __dirname });
  // los paneles preguntan con que permisos entraron, para esconder lo que no pueden usar
  if (url === '/api/rol') return json(200, { rol, abierta: ABIERTA });

  // leer un estado desde otra página (para copiar datos entre paneles)
  if (url === '/api/state') return json(200, estado[canalDe(req)] || {});

  // lista de imágenes y videos de héroes
  if (url === '/api/media') {
    const leer = d => { try { return fs.readdirSync(path.join(PUB, d))
      .filter(f => /\.(webm|mp4|png|jpe?g|webp|gif)$/i.test(f)); } catch (e) { return []; } };
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ heroes: leer('heroes'), picks: leer('picks'), bans: leer('bans') }));
  }

  // ---- actualizaciones (solo el administrador) ----
  if (url === '/api/actualizacion') {
    if (rol !== 'admin') return noPuede('actualizar el programa');
    if (req.method === 'GET') {
      return actualizador.buscar(CFG.actualizaciones, VERSION)
        .then(r => json(200, { ok: true, instalada: r.instalada, disponible: r.disponible, hayNueva: r.hayNueva, notas: r.notas }))
        .catch(e => json(200, { ok: false, instalada: VERSION, error: e.message }));
    }
    if (req.method === 'POST') {
      return actualizador.buscar(CFG.actualizaciones, VERSION)
        .then(r => {
          if (!r.hayNueva) return json(200, { ok: false, error: 'Ya tenés la última versión (' + VERSION + ').' });
          const res2 = actualizador.instalar(__dirname, r.paquete);
          console.log('\n  Actualizado a la version ' + r.disponible + '. Cierra esta ventana y vuelve a abrir INICIAR.bat.\n');
          return json(200, { ok: true, version: r.disponible, ...res2 });
        })
        .catch(e => json(200, { ok: false, error: e.message }));
    }
  }

  // reiniciar el programa (INICIAR.bat lo vuelve a levantar solo)
  if (url === '/api/reiniciar' && req.method === 'POST') {
    if (rol !== 'admin') return noPuede('reiniciar el programa');
    json(200, { ok: true });
    console.log('\n  Reiniciando...\n');
    return setTimeout(() => process.exit(0), 300);
  }

  // subir / borrar imágenes (logos y fotos)
  if (url === '/api/logo' && req.method === 'POST') {
    if (rol !== 'admin') return noPuede('subir ni borrar imágenes');
    const q = new URL(req.url, 'http://x').searchParams, dir = path.join(PUB, 'logos');
    const NOMBRE = /^logo_\d+_?\d*\.(png|jpg|webp|gif|ttf|otf|woff|woff2)$/;
    const borrar = f => { if (f && NOMBRE.test(f)) { try { fs.unlinkSync(path.join(dir, f)); } catch (e) {} } };
    if (q.get('del')) { borrar(q.get('del')); return json(200, { ok: true }); }
    const PERMITIDOS = ['png', 'jpg', 'webp', 'gif', 'ttf', 'otf', 'woff', 'woff2'];
    const porTipo = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
      'font/ttf': 'ttf', 'font/otf': 'otf', 'font/woff': 'woff', 'font/woff2': 'woff2' };
    const pedida = (q.get('ext') || '').toLowerCase();
    const ext = PERMITIDOS.includes(pedida) ? pedida : porTipo[(req.headers['content-type'] || '').split(';')[0].toLowerCase()];
    if (!ext) return json(400, { error: 'Formato no permitido (imágenes PNG, JPG, WEBP, GIF o fuentes TTF, OTF, WOFF)' });
    const partes = []; let tam = 0;
    req.on('data', c => { tam += c.length; if (tam <= 5e6) partes.push(c); });
    req.on('end', () => {
      if (tam > 5e6) return json(413, { error: 'El archivo pesa más de 5 MB' });
      try {
        fs.mkdirSync(dir, { recursive: true });
        const nombre = 'logo_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '.' + ext;
        fs.writeFileSync(path.join(dir, nombre), Buffer.concat(partes));
        borrar(q.get('old'));
        json(200, { url: '/logos/' + nombre });
      } catch (e) { json(500, { error: 'No se pudo guardar el archivo' }); }
    });
    return;
  }

  // subir imágenes o videos de héroes ya con el nombre correcto
  if (url === '/api/heroimg' && req.method === 'POST') {
    if (rol !== 'admin') return noPuede('subir imágenes de héroes');
    const q = new URL(req.url, 'http://x').searchParams;
    const carpeta = ['heroes', 'picks', 'bans'].includes(q.get('dir')) ? q.get('dir') : 'heroes';
    const dir = path.join(PUB, carpeta);
    const nombre = (q.get('name') || '').toLowerCase();
    const ext = (q.get('ext') || '').toLowerCase();
    const EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'webm', 'mp4'];
    if (!/^[a-z0-9]{2,40}$/.test(nombre)) return json(400, { error: 'Nombre de héroe no válido' });
    if (!EXT.includes(ext)) return json(400, { error: 'Formato no permitido' });
    const partes = []; let tam = 0;
    req.on('data', c => { tam += c.length; if (tam <= 30e6) partes.push(c); });
    req.on('end', () => {
      if (tam > 30e6) return json(413, { error: 'El archivo pesa más de 30 MB' });
      try {
        fs.mkdirSync(dir, { recursive: true });
        // dejamos un solo archivo por héroe: se borran las otras extensiones
        EXT.forEach(e => { if (e !== ext) { try { fs.unlinkSync(path.join(dir, nombre + '.' + e)); } catch (x) {} } });
        fs.writeFileSync(path.join(dir, nombre + '.' + ext), Buffer.concat(partes));
        json(200, { ok: true, file: carpeta + '/' + nombre + '.' + ext });
      } catch (e) { json(500, { error: 'No se pudo guardar el archivo' }); }
    });
    return;
  }
  // borrar un archivo de héroe
  if (url === '/api/heroimg' && req.method === 'DELETE') {
    if (rol !== 'admin') return noPuede('borrar imágenes de héroes');
    const q = new URL(req.url, 'http://x').searchParams;
    const carpeta = ['heroes', 'picks', 'bans'].includes(q.get('dir')) ? q.get('dir') : 'heroes';
    const f = (q.get('file') || '');
    if (!/^[a-z0-9]{2,40}\.(png|jpe?g|webp|gif|webm|mp4)$/.test(f)) return json(400, { error: 'Nombre no válido' });
    try { fs.unlinkSync(path.join(PUB, carpeta, f)); } catch (e) {}
    return json(200, { ok: true });
  }

  // los overlays escuchan aquí y se actualizan solos
  if (url === '/events') {
    const k = canalDe(req);
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('data: ' + JSON.stringify(estado[k]) + '\n\n');
    clientes[k].add(res); req.on('close', () => clientes[k].delete(res)); return;
  }

  // los paneles de control escriben aquí
  if (url === '/state' && req.method === 'POST') {
    const k = canalDe(req);
    if (!puedeEscribir) return noPuede('cambiar datos: entraste como invitado');
    // "Personalizar" (colores y fuentes del torneo) es solo del administrador
    if (k === 'theme' && rol !== 'admin') return noPuede('cambiar el diseño del torneo');
    let b = '', cortado = false;
    req.on('data', c => { b += c; if (b.length > 8e6) { cortado = true; b = ''; req.destroy(); } });
    req.on('end', () => {
      if (cortado) { res.statusCode = 413; return res.end('demasiado grande'); }
      try {
        estado[k] = JSON.parse(b);
        fs.writeFileSync(archivo(k), b);
        clientes[k].forEach(c => c.write('data: ' + b + '\n\n'));
        res.end('ok');
      } catch (e) { res.statusCode = 400; res.end('error'); }
    });
    return;
  }

  // el navegador pide solo /favicon.ico en los overlays: le damos el icono que si tenemos
  if (url === '/favicon.ico') { res.writeHead(302, { Location: '/favicon.png' }); return res.end(); }

  // el control del marcador se llamaba ocr.html: mandamos al nombre nuevo
  if (url === '/ocr.html') { res.writeHead(302, { Location: '/marcador.html' }); return res.end(); }

  // archivos de la carpeta public (una barra de mas al final no deberia dar error)
  const f = path.normalize(path.join(PUB, /\/$/.test(url) ? url + 'index.html' : url));
  if (!f.startsWith(PUB)) { res.statusCode = 403; return res.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<meta charset="utf-8"><body style="background:#070c16;color:#e6ecf7;font:16px Segoe UI,Arial;padding:40px">'
        + '<h2 style="color:#f0b429">Esta página no existe</h2><p>Buscabas <b>' + url.replace(/[<>&]/g, '') + '</b>.</p>'
        + '<p>Páginas disponibles:</p><ul style="line-height:1.9">'
        + '<li><a style="color:#f0b429" href="/">Control de draft</a></li>'
        + '<li><a style="color:#f0b429" href="/schedule.html">Control de programación</a></li>'
        + '<li><a style="color:#f0b429" href="/marcador.html">Control del marcador</a></li>'
        + '<li><a style="color:#f0b429" href="/custom.html">Personalizar</a></li></ul>'
        + '<p style="color:#7d8db0">Si esto aparece al abrir el control de draft, es que está corriendo una versión vieja del programa: '
        + 'cierra todas las ventanas negras y vuelve a abrir INICIAR.bat desde esta carpeta.</p></body>');
    }
    const type = types[path.extname(f)] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      fs.createReadStream(f, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
      fs.createReadStream(f).pipe(res);
    }
  });
});
// Red de seguridad: pase lo que pase, el programa NO se cierra solo durante una transmision.
process.on('uncaughtException', e => console.log('\n  Aviso: ' + (e && e.message) + ' (el programa sigue andando)\n'));
process.on('unhandledRejection', e => console.log('\n  Aviso: ' + e + ' (el programa sigue andando)\n'));

servidor.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.log('\n  ERROR: el puerto ' + PORT + ' ya está en uso.');
    console.log('  Seguramente quedó abierta otra ventana negra de este programa (o de una versión anterior).');
    console.log('  Cierra TODAS esas ventanas y vuelve a abrir INICIAR.bat desde esta carpeta.\n');
  } else {
    console.log('\n  ERROR al iniciar el servidor: ' + e.message + '\n');
  }
});
const ipDeRed = () => {
  const ns = require('os').networkInterfaces();
  for (const k in ns) for (const d of ns[k] || [])
    if (d.family === 'IPv4' && !d.internal) return d.address;
  return '';
};
servidor.listen(PORT, HOST, () => {
  console.log('\n  Overlays MLBB v' + VERSION + ' listo.');
  console.log('  Abre esto en el navegador: http://localhost:' + PORT + '/');
  console.log('  Control de draft:         http://localhost:' + PORT + '/control.html');
  console.log('  Control de programación:  http://localhost:' + PORT + '/schedule.html');
  console.log('  Control del marcador:     http://localhost:' + PORT + '/marcador.html');
  console.log('  Personalizar:             http://localhost:' + PORT + '/custom.html');
  if (ABIERTA) {
    const ip = ipDeRed();
    console.log('\n  RED ABIERTA: desde otra compu de esta misma red entran con');
    console.log('    http://' + (ip || 'TU-IP') + ':' + PORT + '/');
    console.log('  Claves (cada una da permisos distintos):');
    console.log('    ADMIN . . . . . ' + CFG['clave'] + '   (puede todo)');
    console.log('    COLABORADOR . . ' + (CFG['clave-colaborador']
      || '(sin clave: nadie puede entrar como colaborador)') + '   (carga datos, no toca archivos)');
    console.log('    INVITADO  . . . ' + (CFG['clave-invitado']
      || '(sin clave: nadie puede entrar como invitado)') + '   (solo mira)');
    console.log('  (para cerrarla, pon red=solo-esta-pc en configuracion.txt)');
  } else {
    console.log('\n  Solo esta computadora puede abrir los paneles.');
    console.log('  (para controlar desde otra compu, abre configuracion.txt)');
  }
  const faltan = revisarArchivos();
  if (faltan.length) {
    console.log('\n  ================= OJO =================');
    console.log('  No encuentro estas carpetas (o estan vacias):');
    faltan.forEach(f => console.log('    ' + f.carpeta + '   -> ' + f.que));
    console.log('  Por eso no vas a ver ninguna imagen en los paneles ni en los overlays.');
    console.log('  Lo mas probable: estas abriendo el programa desde la carpeta de la');
    console.log('  actualizacion, que trae SOLO el codigo. Copia esos archivos dentro de tu');
    console.log('  carpeta de siempre (la que tiene public/heroes) y abri INICIAR.bat de ahi.');
    console.log('  Esta corriendo desde: ' + __dirname);
    console.log('  =======================================\n');
  }
  console.log('\n  (deja esta ventana abierta mientras transmites)\n');
  // abrimos la pagina de inicio solo la primera vez (si reinicia solo, no molesta)
  if (CFG['abrir-navegador'] !== 'no' && !process.env.NINO_YA_ABRIO) {
    process.env.NINO_YA_ABRIO = '1';
    const dir = 'http://localhost:' + PORT + '/';
    const cmd = process.platform === 'win32' ? 'start "" "' + dir + '"'
      : process.platform === 'darwin' ? 'open "' + dir + '"' : 'xdg-open "' + dir + '"';
    try { require('child_process').exec(cmd, () => {}); } catch (e) {}
  }
});
