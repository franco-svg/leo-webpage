# Cómo está construida la página

Esta guía explica la implementación de las nueve secciones de la versión actual. Complementa el README y la revisión de `considerandos.md`: describe la estructura, la presentación y las interacciones, sin recorrer cada línea de código.

## Organización general

La página está hecha con HTML, CSS y JavaScript nativo. Todo el contenido se reúne en `index.html`; no hay páginas separadas para cada sección. El menú utiliza enlaces internos, por ejemplo `href="#biografia"`, que llevan al elemento con ese `id`.

El documento se organiza con `header`, `nav`, `main` y `footer`. Dentro de `main`, cada sección tiene un `section`, un identificador propio y un título. El inicio contiene el único `h1`; los títulos principales de las demás secciones son `h2`. Los atributos `aria-labelledby` relacionan las regiones con sus encabezados.

Los estilos se editan en `css/estilos.css`. El HTML carga `css/estilos.min.css`, una copia comprimida que se actualiza ejecutando `node herramientas/comprimir-css.js`. Las variables de `:root` concentran colores como azul noche, celeste y marfil. Manrope se carga desde `fuentes/manrope.ttf` mediante `@font-face`; algunas reglas específicas usan fuentes del sistema. Grid organiza las columnas y Flexbox distribuye controles y grupos pequeños. Las media queries adaptan cada bloque al ancho disponible.

Los tres scripts se incluyen con `defer`, de modo que se ejecutan después de analizar el HTML y respetan su orden:

1. `js/goles.js` proporciona el archivo local de goles en `MessiGoalArchive`.
2. `js/cumpleanos.js` expone las funciones de consulta y guardado en `MessiBirthday`.
3. `js/sitio.js` conecta los elementos de la página con sus eventos.

En `sitio.js`, `$` y `$$` son abreviaturas de `querySelector` y `querySelectorAll`; no pertenecen a una librería. Las funciones se agrupan dentro de una función que se ejecuta al cargar el archivo para evitar dejar variables internas en el ámbito global.

## 1. Inicio

**HTML.** El bloque `#inicio` usa la clase `.hero`. Dentro de `.hero-grid` se encuentran el título «Lionel Messi», dos enlaces de acceso a Biografía y Cumpleaños, y un `figure` con la foto. El número 10 es un `span` decorativo con `aria-hidden="true"`. La imagen tiene texto alternativo, dimensiones declaradas y `fetchpriority="high"` porque aparece al entrar al sitio.

**CSS.** `.hero-grid` divide el espacio entre texto e imagen. `.hero-photo` recorta la fotografía y forma su borde superior curvo; `object-fit` permite ocupar el marco sin deformarla. El fondo oscuro y el celeste mantienen la identidad del resto de la página. En pantallas pequeñas, las columnas pasan a una disposición vertical.

**JavaScript.** No tiene una función exclusiva. Los botones son enlaces HTML que funcionan por sí mismos. El desplazamiento suave se define en CSS y se reduce cuando el dispositivo solicita menos movimiento.

**Dónde editar.** El título, los destinos y la fotografía se cambian directamente en `#inicio`, dentro de `index.html`.

## 2. Biografía

**HTML.** `#biografia` contiene siete `article.biography-stage`: infancia, formación en Barcelona, tres etapas del primer equipo, PSG e Inter Miami. Cada artículo tiene un `h3` y un bloque `.biography-grid` con la fotografía a la izquierda y el texto a la derecha. El texto se organiza en cinco pares de `h4` y `p`, conservando los subtítulos de cada tema. Al final aparecen los botones anterior y siguiente y el indicador de posición.

**CSS.** `.biography-grid` establece las dos columnas; `.biography-photo` controla el marco de la imagen y `.biography-copy` los tamaños, espacios y separación entre párrafos. Los botones deshabilitados tienen un aspecto diferente para indicar los extremos del recorrido. La distribución se adapta en celular para mantener legibles los textos.

**JavaScript.** `initBiography()` obtiene todos los artículos y guarda un índice llamado `position`. Su función interna `show()` muestra la etapa elegida con el atributo `hidden`, actualiza `#bio-position` y deshabilita la flecha correspondiente al llegar al principio o al final. Los eventos `click` cambian ese índice. Si el botón que tenía el foco queda deshabilitado, el foco pasa al otro control.

**Dónde editar.** Los textos y fotos están escritos en HTML, dentro de cada artículo; no se arman como cadenas de una sola línea en JavaScript. Sin JavaScript se pueden leer todas las etapas y los controles permanecen ocultos.

## 3. Trayectoria

**HTML.** `#trayectoria` tiene cuatro botones en `.career-route`, uno por Barcelona, PSG, Inter Miami y Argentina. Los atributos `data-career` y `data-career-panel` permiten identificar botones y paneles. Cada panel `.career-feature` reúne un `figure`, un título, una lista descriptiva `dl` con partidos, goles y asistencias, y una lista ordenada `ol` de hitos.

**CSS.** La ruta usa una cuadrícula de cuatro opciones y cada panel distribuye fotografía y datos en dos columnas. Las clases `.barcelona`, `.paris`, `.miami` y `.argentina` permiten distinguir los equipos mediante sus acentos de color. `.career-metrics` alinea las tres cifras y `.career-events` separa los acontecimientos por filas. Las media queries reorganizan los botones y el panel en pantallas menores.

**JavaScript.** `initCareer()` convierte el selector en pestañas mediante los roles `tablist`, `tab` y `tabpanel`. Su función `select()` cambia el panel visible, el atributo `aria-selected` y el orden de foco con `tabIndex`. Además del clic, acepta las flechas izquierda y derecha y las teclas Home y End.

**Dónde editar.** Las cifras y los hitos de esta sección se editan en sus paneles de `index.html`. No se recalculan al abrir la página. Sin JavaScript aparecen todos los paneles, sin el selector de pestañas.

## 4. Palmarés

**HTML.** `#palmares` contiene tres `article.title-timeline`: clubes, selección y premios individuales. Cada línea usa una lista ordenada de años; dentro de cada año hay una lista de títulos. Cada título tiene un `button.title-dot` y un bloque `.title-tooltip` con sus detalles. Los totales inferiores se presentan con `dl`, `dt` y `dd`. Un `details` reúne los enlaces de las fuentes.

**CSS.** `.title-timelines` ubica las tres líneas en columnas. Los años conservan una altura común para alinearse y el borde izquierdo de `.title-points` dibuja la línea vertical. El color de cada punto depende de `--team-color`. Los detalles se posicionan sobre el punto y se muestran con `:hover`, `:focus-within` o la clase `.is-open`. En anchos reducidos, las líneas se apilan.

**JavaScript.** `initHonors()` permite abrir y cerrar detalles con un clic y actualiza `aria-expanded`. También maneja la pérdida de foco y la tecla Escape. `.is-dismissed` permite cerrar un detalle incluso si el puntero sigue encima del punto. La aparición por hover o foco está resuelta en CSS; JavaScript agrega el control de apertura y cierre.

**Dónde editar.** Los datos estructurados están en `datos/palmares.js`. `herramientas/generar-palmares.js` construye el HTML de las líneas y sus totales durante el mantenimiento. El navegador recibe ese contenido ya escrito: no ejecuta el generador ni descarga títulos desde una API. Si se cambia el HTML generado a mano, una nueva generación puede reemplazar ese cambio.

## 5. Estadísticas

**HTML.** `#estadisticas` presenta un tablón con una tabla de cinco columnas: métrica, Barcelona, PSG, Inter Miami y Argentina. Usa `caption`, `thead`, encabezados `th` y cinco grupos `tbody`. Debajo aparecen dos artículos `.stats-peak`, dedicados al mejor año por goles y a la mejor edición de una copa por goles, con sus cifras complementarias.

**CSS.** `.stats-board` y las reglas de la tabla organizan títulos, separadores y valores. Las filas tienen colores uniformes a lo ancho, incluidos sus encabezados. El contenedor permite desplazamiento horizontal cuando la tabla no entra en pantalla. `.stats-peaks` distribuye los dos destacados en columnas y los apila en dispositivos pequeños. El tablón se presenta sin efectos de animación.

**JavaScript.** No se calculan estas cifras durante la visita. `herramientas/estadisticas.js` contiene `summarize()`, que suma partidos, minutos, goles, asistencias, tarjetas y resultados, y obtiene promedios y porcentajes. Por ejemplo, goles por partido se calcula dividiendo goles entre partidos y goles por 90 minutos multiplicando los goles por 90 y dividiendo por los minutos jugados. Se contemplan denominadores en cero.

`findPeaks()` agrupa partidos por año calendario y por edición de copa; excluye las ligas de la comparación de copas. El criterio es la cantidad de goles y, ante un empate, las asistencias. `herramientas/generar-estadisticas.js` toma los partidos de `datos/partidos.js` y genera el bloque HTML. Estas herramientas se ejecutan con Node.js durante el mantenimiento, pero Node.js no es necesario para visitar el sitio.

**Dónde editar.** Para actualizar cifras de forma consistente, se revisan los datos de partidos y se vuelve a generar el tablón. Las fechas de corte y fuentes deben acompañar la actualización. La sección no se actualiza automáticamente con nuevos encuentros.

## 6. Cumpleaños

**HTML.** `#cumpleanos` tiene un `form` con un campo numérico para el día, un `select` para el mes y sus respectivos `label`. Incluye un espacio de error con `role="alert"`, un resultado inicialmente oculto y una lista de partidos. Un `details` permite ingresar nombre y nota opcionales y guardar la fecha. Otro bloque muestra las fechas guardadas; `role="status"` anuncia el resultado del guardado o borrado.

**CSS.** `.birthday` organiza la introducción y la herramienta; `.date-fields` distribuye los campos. Los partidos se muestran como `.match-card` y las fechas guardadas tienen botones separados para consultar y borrar. El formulario y las tarjetas se reorganizan en pantallas pequeñas. `.result-summary` controla la presentación del total encontrado.

**JavaScript.** La lógica se divide entre dos archivos:

- En `js/cumpleanos.js`, `validBirthday()` comprueba que el día exista dentro del mes, admitiendo el 29 de febrero porque no se pide año. `findGoals()` busca coincidencias de día y mes en el archivo local, agrupa los goles de un mismo partido, suma el total y ordena los encuentros del más reciente al más antiguo.
- En `js/sitio.js`, `initBirthday()` escucha el envío del formulario y evita recargar la página con `preventDefault()`. `showBirthday()` actualiza el resumen y `renderMatches()` crea las tarjetas con `createElement`. Los enlaces de video llevan a una búsqueda específica en YouTube; no se inserta ni se descarga un video.

El guardado usa `localStorage` con la clave `leo-messi-cumpleanos-v1`. `readSaved()`, `saveBirthday()` y `removeBirthday()` leen, guardan y eliminan fechas. Se utiliza JSON para almacenar los objetos, se conservan hasta cinco fechas y una misma fecha se reemplaza en lugar de duplicarse. Los nombres y notas se validan y limitan en longitud. Si el almacenamiento está bloqueado o tiene datos corruptos, la consulta puede seguir funcionando.

`renderSaved()` dibuja la lista y conecta sus botones. Los textos ingresados se colocan con `textContent` para que se muestren como texto y no se interpreten como HTML. Cambiar el día o el mes oculta el resultado anterior para evitar guardar una consulta que ya no corresponde a los campos.

**Dónde editar.** El formulario está en `index.html`, los goles en `js/goles.js` y las reglas de consulta y persistencia en `js/cumpleanos.js`. Esta sección requiere JavaScript para realizar la búsqueda; no envía la fecha a un servidor.

## 7. Momentos históricos

**HTML.** `#momentos` incluye un `nav.moments-index` con enlaces a tres etapas. Cada etapa es un `article.moments-era` con una cabecera, una fotografía y una lista `ol.moments-timeline`. Los 18 hitos se organizan en tarjetas `li.moment-card`, con año, fecha, categoría, título, explicación y enlace para ampliar la información. Las listas siguientes usan `start` para continuar su numeración.

**CSS.** `.moments-era-cover` combina texto e imagen en la cabecera. `.moments-timeline` coloca tres tarjetas por fila en escritorio, dos en un ancho intermedio y una en celular. Los bordes y las clases de equipo diferencian los hitos manteniendo una estructura común. Las cabeceras cargan miniaturas locales para reducir el peso.

**JavaScript.** No tiene una función propia. El índice funciona con anclas HTML; el diseño y la adaptación de las tarjetas dependen del CSS. Todos los hitos permanecen disponibles sin JavaScript.

**Dónde editar.** Cada acontecimiento se modifica en su tarjeta de `index.html`. Al agregar uno, hay que revisar el orden de fechas y el atributo `start` de las listas posteriores.

## 8. Vida personal

**HTML.** `#vida-personal` comienza con un artículo `.personal-family`, que combina una fotografía familiar y texto. `.family-map` organiza la representación de padres e hijos; los hijos se agrupan en una lista. Después, `.personal-stories` reúne artículos sobre raíces, vida cotidiana y fundación. Los iconos están dibujados con SVG dentro del HTML y los enlaces permiten consultar las fuentes.

**CSS.** `.personal-family` coloca imagen y texto en columnas. El esquema familiar usa Grid y líneas decorativas para relacionar sus integrantes. Los artículos inferiores comparten una cuadrícula; `.personal-foundation` destaca el bloque de la fundación mediante un fondo diferente. En celular, los bloques pasan a una columna.

**JavaScript.** No necesita una función específica: la fotografía, el esquema, los textos y los enlaces son contenido HTML. El CSS resuelve la composición visual.

**Dónde editar.** Los textos, integrantes, enlaces y fotografía se modifican en `#vida-personal`. Los SVG se pueden ajustar dentro de sus propios elementos sin agregar archivos ni librerías de iconos.

## 9. Galería

**HTML.** `#galeria` contiene `.gallery-carousel`, dos botones laterales y `.gallery-grid`, con 46 elementos `figure`. Cada fotografía tiene un enlace a la versión grande, una imagen de `imagenes/miniaturas/` y su `figcaption`. El atributo `data-caption` proporciona el texto para la ampliación. Fuera de la sección se encuentra el `dialog` usado para mostrar la foto grande.

**CSS.** La galería presenta cuatro imágenes en escritorio, dos en tablet y una en celular. Las fotografías mantienen marcos uniformes con `object-fit: cover`. Las flechas quedan a los costados y el diálogo limita la imagen al espacio disponible. El contador está disponible para lectores de pantalla sin mostrarse como texto adicional debajo del carrusel.

**JavaScript.** `initGallery()` calcula cuántas imágenes mostrar según `matchMedia`. `showPhotos()` cambia el atributo `hidden` de cada figura y actualiza el estado accesible. `move()` avanza o retrocede por grupos y usa el resto de la división para volver al principio o al final del recorrido. Los cambios de ancho ajustan la página visible procurando conservar la imagen que tiene el foco.

Al seleccionar una foto, se copia el destino del enlace a la imagen del diálogo y se abre con `showModal()`. Se puede cerrar con el botón, con Escape por el comportamiento nativo del diálogo o haciendo clic fuera de su marco. Al cerrar, el foco vuelve al enlace de origen o a un control visible si cambió la distribución.

**Dónde editar.** Las fotos se agregan como figuras en `#gallery-grid`, con miniatura, original, descripción y pie. Los archivos exclusivos de galería mantienen el sufijo `-galeria` antes de la extensión. El código obtiene la cantidad de figuras del HTML, por lo que no hay que actualizar una constante al incorporar fotos. Sin JavaScript se muestran todas en una cuadrícula y los enlaces permiten abrir los originales.

## Encabezado, footer y recursos compartidos

El encabezado es un `header.site-header` con navegación interna. CSS lo mantiene visible con `position: sticky`. `initNavigation()` maneja el botón del menú compacto, `aria-expanded`, el cierre con Escape y el foco al cambiar de tamaño. Un `IntersectionObserver` identifica la sección visible para actualizar `aria-current` en el menú. El enlace «Saltar al contenido» permite llegar directamente al `main` con el teclado.

El footer utiliza un `details` y su `summary` para desplegar los créditos, sin una función JavaScript específica. Las atribuciones identificadas se registran en `imagenes/creditos.json`; `herramientas/generar-creditos.js` actualiza únicamente el bloque delimitado por los comentarios `IMAGE-CREDITS:START` e `IMAGE-CREDITS:END`. Las fotografías sin fuente confirmada quedan fuera del listado visible, según el criterio documentado en `considerandos.md`.

Las imágenes tienen descripciones y dimensiones declaradas. Se usa `loading="lazy"` en las que pueden esperar hasta aproximarse a la zona visible. Las miniaturas reducen la transferencia inicial de la galería y los originales se solicitan al ampliar. Tanto estas imágenes como la fuente y el archivo de goles se encuentran en el proyecto; los enlaces externos requieren conexión.

## Mantenimiento y comprobación

Para cambiar textos se edita el bloque correspondiente de `index.html`. Para cambiar la apariencia se modifica `css/estilos.css` y luego se regenera su versión minificada. Para modificar comportamientos se revisa la función `init...` correspondiente en `js/sitio.js`; las reglas de fechas y guardado están separadas en `js/cumpleanos.js`.

Las herramientas de `herramientas/` ayudan a preparar archivos estáticos y no forman parte de los scripts cargados por el navegador. Las pruebas de `tests/` verifican la lógica y los recorridos con navegador durante el desarrollo. La evidencia y los límites de la revisión técnica están en [considerandos.md](considerandos.md); esta guía explica la implementación, no reemplaza esas verificaciones.
