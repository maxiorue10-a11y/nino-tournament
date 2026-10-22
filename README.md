# Nino Tournament

Overlays para transmitir torneos de **Mobile Legends: Bang Bang** en OBS.

Corre en tu propia computadora con Node.js. No necesita instalar nada mas.

## Que trae

**Paneles de control** (se abren en el navegador)

- Control de draft: baneos y picks turno por turno, equipos, jugadores, lineas, capitan y tiempo de reserva
- Control de programacion: la pantalla de espera, cuenta regresiva, partidas del dia, narradores
- Control del marcador: kills, oro, torres, lords, reloj y jugadores con su KDA
- Personalizar: colores del torneo, de los lados azul y rojo, y tu propia fuente

**Overlays para OBS** (fuente de navegador, 1920 x 1080)

| Overlay | Direccion |
| --- | --- |
| Draft pick | `/overlay.html?view=draft` |
| Post-Draft Line-up | `/overlay.html?view=lineup` |
| Draft anterior | `/overlay.html?view=previous` |
| Estadisticas de la serie | `/overlay.html?view=stats` |
| Programacion | `/schedule-overlay.html` |
| Marcador en vivo | `/scoreboard.html` |

## Como se usa

1. Instalar [Node.js](https://nodejs.org) (version LTS). Solo la primera vez.
2. Doble clic en `INICIAR.bat`. Se abre una ventana negra: dejala abierta mientras transmitis.
3. El navegador abre solo en `http://localhost:3000`.

Todo lo demas esta explicado en `LEEME.txt`.

## Actualizaciones

En la pagina de inicio hay una tarjeta **Actualizaciones**: busca la version nueva,
la instala y reinicia el programa. No toca tus imagenes, tus equipos ni tu configuracion,
y antes guarda una copia de la version anterior.

El archivo `actualizacion.json` de este repositorio es de donde el programa baja la version nueva.
La carpeta `programa/` tiene los mismos archivos sueltos, para mirar el codigo.

## Que NO esta aca

Las imagenes de los heroes, los retratos de baneo y los logos **no** estan en este repositorio:
son de Moonton y de cada equipo. Cada quien pone las suyas en `public/heroes`, `public/picks`
y `public/bans`.

---

Hecho para torneos casuales y nacionales de MLBB.
