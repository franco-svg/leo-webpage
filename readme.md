# Lionel Messi · De Rosario al mundo

Sitio educativo para Introducción a la Programación Web. Desarrollado con **HTML, CSS y JavaScript nativo**, sin frameworks, backend, APIs de ejecución, gestor de paquetes ni proceso de compilación.

## Abrir la página

Abrí `index.html` con doble clic. Para entregar o compartir el trabajo, copiá la carpeta completa conservando las rutas. Las imágenes, la fuente, el archivo de goles y las interacciones funcionan sin conexión. Los enlaces a videos, fichas, fuentes y licencias requieren Internet.

Los navegadores administran `localStorage` por origen. Las fechas guardadas al abrir el archivo directamente pueden ser distintas de las guardadas usando un servidor local. Si el navegador bloquea el almacenamiento, se informa el problema y la consulta sigue funcionando.

## Las nueve secciones

Inicio, Biografía, Trayectoria, Palmarés, Estadísticas, Cumpleaños, Momentos, Vida personal y Galería. El buscador de cumpleaños tiene una sección independiente y conserva el formulario, el archivo de goles y las fechas guardadas. Vida personal reúne familia, raíces, vida cotidiana y fundación, con fuentes enlazadas. El menú se adapta a celulares y tablets, el palmarés muestra tres líneas de tiempo de clubes, selección y premios individuales, con detalles y totales hasta el 17 de noviembre de 2026 y la galería permite ampliar las imágenes y cerrarlas con Escape.

Momentos históricos reúne 18 hitos entre 2000 y 2024 en tres etapas, con fechas, contexto y enlaces a sus fuentes. El índice permite saltar entre etapas y todo el contenido se puede leer sin JavaScript. Cada hito se edita directamente en su bloque HTML de `index.html`.

El palmarés colectivo se actualizó al 17 de noviembre de 2026: Barcelona 35, PSG 3, Inter Miami 4 y Argentina 6. La tercera línea reúne 47 premios individuales de las categorías seleccionadas, sin nominaciones ni equipos ideales; su total cuenta exclusivamente esos puntos. Las estadísticas de Barcelona y PSG corresponden a sus etapas completas. El archivo de goles tiene su propia fecha de corte.

## Messi el día de tu cumpleaños

1. Ingresá día y mes, sin año de nacimiento.
2. Se suman los goles de esa fecha en todos los años del archivo y se agrupan por partido, del más reciente al más antiguo.
3. Cada partido muestra equipos, resultado, competencia, fecha, minutos, ficha de la fuente y una búsqueda específica de video en YouTube. No se garantiza la disponibilidad de videos de terceros.
4. Podés guardar voluntariamente la fecha con nombre y nota opcionales. Se conservan las cinco fechas más recientes, sin duplicar un mismo día y mes.
5. Las fechas se recuperan después de recargar y se pueden consultar o borrar individualmente. La consulta sola no guarda datos.

Se contempla el 29 de febrero, fechas inexistentes, días sin goles, datos guardados corruptos y almacenamiento bloqueado. Los nombres y notas se muestran como texto, sin interpretar HTML.

## Datos y atribución

Archivo local de **937 goles**, desde 2005 hasta el **1 de noviembre de 2026**, obtenido de [MessiStats](https://www.messistats.com/en/locationsscored) el 17 de noviembre de 2026. Incluye clubes y selección mayor, incluidos amistosos internacionales; excluye tandas de penales y fútbol juvenil. Las fechas conservan el criterio de la fuente y pueden diferir de la fecha local del estadio por el huso horario. El archivo es una copia estática: no se actualiza automáticamente.

MessiStats permite usar sus estadísticas indicando como fuente `www.messistats.com`; la atribución aparece en la página y el archivo de datos. Se corrigió el minuto del segundo gol de la final de Qatar de 109 a 108 según la [ficha oficial de FIFA](https://www.fifa.com/es/articles/argentina-le-gano-por-penales-a-francia-y-se-consagro-campeon-del-mundo). La corrección queda registrada en los metadatos del archivo.

La galería tiene 46 fotografías, incluidas diez de Messi joven entre 2007 y 2010. Los 42 archivos incorporados para ella conservan el sufijo `-galeria.jpg`; las imágenes compartidas mantienen sus nombres. Los 55 archivos fotográficos principales son JPEG reales, incluso los que anteriormente contenían AVIF o WebP con extensión incorrecta. No se cambió la selección de fotos del autor.

El carrusel y las cabeceras de Momentos cargan miniaturas de `imagenes/miniaturas/`, de menos de 180 KiB. Las portadas también pesan menos de 200 KiB. Los originales optimizados de galería, de hasta 1920 píxeles en su lado mayor, se solicitan al ampliar la foto. Las primeras cuatro imágenes de galería pasaron de aproximadamente 4 MB a 290 KB en su presentación inicial, manteniendo la ampliación disponible.

Autores, fuentes y licencias identificados se conservan en `imagenes/creditos.json`. Un único desplegable compacto del footer publica las 47 atribuciones comprobables; las imágenes manuales sin fuente confirmada quedan fuera por decisión del autor. Se corrigieron los créditos antiguos de fotos reemplazadas, sin asignarles una licencia Creative Commons falsa. Manrope se distribuye localmente bajo SIL Open Font License, en `fuentes/licencia-manrope.txt`. Georgia y las fuentes de respaldo son fuentes del sistema.

Las flechas de la galería recorren cuatro imágenes por vez en escritorio, dos en tablet y una en celular; al llegar al final vuelven al principio. Cada foto se puede ampliar y cerrar con Escape. El contador de posición se anuncia solo a lectores de pantalla sin textos adicionales debajo de las imágenes. Sin JavaScript se muestran las 46 fotos en una cuadrícula. La comprobación específica de este recorrido está en `tests/galeria-navegador.js` y utiliza Playwright solo como herramienta de desarrollo.

## Archivos

- `index.html`: contenido, metadatos y estructura semántica.
- `css/estilos.css`: estilos comentados para mantenimiento.
- `css/estilos.min.css`: copia comprimida utilizada por la página.
- `js/goles.js`: datos locales con fuente y fecha de corte.
- `js/cumpleanos.js`: validación, agrupación y persistencia, sin dependencia del DOM.
- `js/sitio.js`: navegación, formulario, guardados, líneas de tiempo y galería.
- `imagenes/` y `fuentes/`: recursos locales y sus créditos.
- `imagenes/miniaturas/`: vistas livianas de las fotografías de galería.
- `herramientas/generar-creditos.js`: actualiza únicamente el desplegable de créditos del footer.
- `tests/`: pruebas de lógica y una revisión opcional con navegador.
- `docs/considerandos.md`: cobertura del PDF y alcance de las verificaciones.

## Verificación y mantenimiento

No es necesario instalar nada para usar la web. Para ejecutar las 14 pruebas de lógica con Node.js:

```text
node --test tests/cumpleanos.test.js tests/archivo.test.js tests/estadisticas.test.js
```

Después de editar el CSS legible, regenerá la copia utilizada por la página:

```text
node herramientas/comprimir-css.js
```

Después de corregir una atribución identificada en `imagenes/creditos.json`, actualizá el footer:

```text
node herramientas/generar-creditos.js
```

Ese generador omite las fotografías sin autor o fuente comprobable. No modifica las nueve secciones ni los datos del cumpleaños.

Las revisiones opcionales `tests/navegador.js` y `tests/galeria-navegador.js` utilizan Playwright **solo en el entorno de desarrollo**. Requieren tenerlo disponible. La primera acepta `LEO_TEST_URL` para abrir el sitio con `file://` o un servidor estático; la segunda abre el archivo local directamente. `LEO_BROWSER=chrome` selecciona Chrome en lugar de Edge. El sitio no utiliza Playwright, Python, Java ni paquetes de pruebas al visitarlo.

Se verificó en Edge y Chrome: 320, 390, 768, 1024 y 1440 píxeles; teclado, cambio de tamaño del menú, líneas de tiempo, galería, validación, guardado, recarga y borrado; almacenamiento bloqueado; lectura sin JavaScript; apertura directa sin conexión; consola sin errores ni recursos locales faltantes. HTML y ambas hojas CSS pasan Nu Html Checker 26.11.17 localmente, sin mensajes. Las 338 reglas interpretadas del CSS original coinciden con las de su versión minificada. Axe 4.10.3 no detectó infracciones automáticas WCAG 2/2.1 A/AA en ocho estados de escritorio y celular; esto no equivale a una certificación integral de accesibilidad. El alcance detallado está en `docs/considerandos.md`.

## Actualizar el palmarés

Los registros, años de edición y fuentes están en `datos/palmares.js`. Después de editarlos, ejecutá `node herramientas/generar-palmares.js` para regenerar el HTML estático. Se incluyen los premios otorgados hasta el 17/11/2026; el MVP de MLS 2026 aún no otorgado se excluye. Laureus utiliza los años de premiación 2020 y 2023. Las categorías individuales incluidas son Balón de Oro, Bota de Oro europea, The Best, FIFA World Player, mejor jugador UEFA, Balón de Oro del Mundial, Laureus, Golden Boy, Pichichi, goleador de Champions, mejor jugador de Copa América 2021, MVP y Botín de Oro MLS, MVP MLS Cup, y mejor jugador y goleador de Leagues Cup. No es un recuento de todas las distinciones de medios y organizaciones.

## Tablón de estadísticas

`datos/partidos.js` contiene el registro de 1184 partidos de MessiStats, consultado el 17/11/2026 con último partido el 01/11/2026. `herramientas/estadisticas.js` calcula los totales y promedios; `node herramientas/generar-estadisticas.js` regenera solo el tablón y los destacados en HTML estático. El buscador de cumpleaños se conserva aparte y no depende del generador.

El tablón compara 21 métricas con Arial, cuatro equipos y un único criterio de asistencias: MessiStats. El título de la sección utiliza Manrope. La tabla es estática, sin resaltados al pasar el cursor. Trayectoria utiliza el mismo criterio; puede diferir de las cifras publicadas por los clubes. Incluye participación, minutos, producción ofensiva, promedios, resultados y disciplina. Las amarillas se separan del total de tarjetas descontando las tres rojas directas contrastadas con AFA y Barcelona (las fuentes están en el desplegable). No se incluyen equipos juveniles ni amistosos de clubes. Los resultados son los del partido, sin reinterpretar tandas de penales como victorias.

«Mejor» significa mayor número de goles. Se comparan años calendario y, por separado, ediciones de copas; se excluyen ligas, eliminatorias clasificatorias y amistosos para elegir la copa. Champions y Copa del Rey usan temporadas julio-junio, con la excepción de agosto de 2020 para la Champions 2019/20. Supercopas, competiciones americanas y torneos de selecciones usan el año calendario. Se desempata por asistencias. Resultados: 2012 (91 goles) y UEFA Champions League 2011/12 (14 goles). Los promedios por partido usan partidos disputados; los de 90 minutos usan minutos jugados. Los goles de tandas no cuentan.

Pruebas de estadísticas: `node --test tests/estadisticas.test.js`.
