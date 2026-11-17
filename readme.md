# Lionel Messi · De Rosario al mundo

Sitio educativo para Introducción a la Programación Web. Desarrollado con **HTML, CSS y JavaScript nativo**, sin frameworks, backend, APIs de ejecución, gestor de paquetes ni proceso de compilación.

## Abrir la página

Abrí `index.html` con doble clic. Para entregar o compartir el trabajo, copiá la carpeta completa conservando las rutas. Las imágenes, la fuente, el archivo de goles y las interacciones funcionan sin conexión. Los enlaces a videos, fichas, fuentes y licencias requieren Internet.

Los navegadores administran `localStorage` por origen. Las fechas guardadas al abrir el archivo directamente pueden ser distintas de las guardadas usando un servidor local. Si el navegador bloquea el almacenamiento, se informa el problema y la consulta sigue funcionando.

## Las mismas siete secciones

Inicio, Biografía, Trayectoria, Palmarés, Estadísticas, Momentos y Galería. El buscador de cumpleaños está dentro de Estadísticas. El menú se adapta a celulares, el palmarés muestra tres líneas de tiempo de clubes, selección y premios individuales, con detalles y totales hasta el 17 de noviembre de 2026 y la galería permite ampliar las imágenes y cerrarlas con Escape.

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

Las fotografías proceden de Wikimedia Commons. Autores, fuentes y licencias CC BY/CC BY-SA figuran en el pie de página y en `imagenes/creditos.json`. Se optimizaron y todas pesan menos de 200 KB. Manrope se distribuye localmente bajo SIL Open Font License; su licencia está en `fuentes/licencia-manrope.txt`. Georgia y las fuentes de respaldo son fuentes del sistema.

## Archivos

- `index.html`: contenido, metadatos y estructura semántica.
- `css/estilos.css`: estilos comentados para mantenimiento.
- `css/estilos.min.css`: copia comprimida utilizada por la página.
- `js/goles.js`: datos locales con fuente y fecha de corte.
- `js/cumpleanos.js`: validación, agrupación y persistencia, sin dependencia del DOM.
- `js/sitio.js`: navegación, formulario, guardados, líneas de tiempo y galería.
- `imagenes/` y `fuentes/`: recursos locales y sus créditos.
- `tests/`: pruebas de lógica y una revisión opcional con navegador.
- `docs/considerandos.md`: cobertura del PDF y alcance de las verificaciones.

## Verificación y mantenimiento

No es necesario instalar nada para usar la web. Para ejecutar las nueve pruebas de lógica con Node.js:

```text
node --test tests/cumpleanos.test.js tests/archivo.test.js
```

Después de editar el CSS legible, regenerá la copia utilizada por la página:

```text
node herramientas/comprimir-css.js
```

La revisión opcional `tests/navegador.js` utiliza Playwright **solo en el entorno de desarrollo**. Requiere tenerlo disponible y un servidor estático en el puerto 4173; `LEO_TEST_URL` cambia la dirección y `LEO_BROWSER=chrome` selecciona Chrome en lugar de Edge. El sitio no utiliza Playwright, Python ni ningún paquete de pruebas al visitarlo.

Se verificó en Edge y Chrome: 320, 390, 768, 1024 y 1440 píxeles; teclado, líneas de tiempo, galería, validación, guardado, recarga y borrado; almacenamiento bloqueado; lectura sin JavaScript; apertura directa sin conexión; consola sin errores ni recursos locales faltantes. HTML y CSS se revisaron con parsers locales. Axe no detectó infracciones automáticas WCAG 2/2.1 A/AA en las vistas revisadas; esto no equivale a una certificación integral de accesibilidad.

## Actualizar el palmarés

Los registros, años de edición y fuentes están en `datos/palmares.js`. Después de editarlos, ejecutá `node herramientas/generar-palmares.js` para regenerar el HTML estático. Se incluyen los premios otorgados hasta el 17/11/2026; el MVP de MLS 2026 aún no otorgado se excluye. Laureus utiliza los años de premiación 2020 y 2023. Las categorías individuales incluidas son Balón de Oro, Bota de Oro europea, The Best, FIFA World Player, mejor jugador UEFA, Balón de Oro del Mundial, Laureus, Golden Boy, Pichichi, goleador de Champions, mejor jugador de Copa América 2021, MVP y Botín de Oro MLS, MVP MLS Cup, y mejor jugador y goleador de Leagues Cup. No es un recuento de todas las distinciones de medios y organizaciones.
