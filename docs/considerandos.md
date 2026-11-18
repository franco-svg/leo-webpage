# Cobertura de los considerandos del PDF

Revisión técnica del 18 de noviembre de 2026. La petición del autor de conservar las nueve secciones actuales prevalece sobre el mínimo general de diez que figura en el punto 1.11 del PDF.

| Grupo | Estado de esta versión |
| --- | --- |
| 1. Estructura | `index.html` en la raíz; recursos locales y rutas verificadas; metadatos esenciales, favicon SVG, navegación por nueve secciones, encabezado, contenido principal y footer. README y comentarios de mantenimiento. |
| 2. HTML | Un H1, encabezados jerárquicos, etiquetas semánticas, listas, imágenes con descripciones corregidas y dimensiones reales, formulario con labels y tabla con caption, thead y cinco grupos tbody. El footer reúne las atribuciones identificadas. |
| 3. CSS | Archivo legible separado del HTML y versión realmente minificada, sin dependencias. Eliminadas 81 reglas obsoletas. Grid/Flexbox, unidades relativas, media queries, foco visible y movimiento reducido. |
| 4. JavaScript | Tres scripts clásicos con defer, eventos con addEventListener, funciones por responsabilidad y ausencia de librerías en ejecución. Validación, consulta local, almacenamiento protegido y manejo de errores. |
| 5. Contenido | Se preservaron los textos y el orden de las nueve secciones del respaldo del autor. Se corrigieron atributos alternativos y créditos que describían imágenes anteriores. Las fuentes estadísticas conservan sus fechas de corte. |
| 6. Accesibilidad | Navegación por teclado, skip link, labels, mensajes asociados, atributos ARIA y galería con diálogo nativo y Escape. Corregido el foco al cambiar entre menú de escritorio y compacto. |
| 7. Opcionales elegidos | Favicon SVG, consulta por cumpleaños, almacenamiento local y navegación rápida para volver al inicio. No se incorporan servicios, cuentas ni funciones ajenas a la página. |

## Validación y evidencia

- **HTML y CSS:** validados localmente con **Nu Html Checker 26.11.17**, el motor del servicio de validación HTML de W3C. La versión final de `index.html`, `css/estilos.css` y `css/estilos.min.css` produce cero mensajes. La página no se envió al servicio externo.
- **Integridad del contenido:** comparación del texto y orden de las nueve secciones con el respaldo realizado antes de la limpieza, sin diferencias. La comparación excluye los números decorativos ocultos a lectores de pantalla y los nuevos créditos del footer.
- **CSS:** el navegador interpreta las mismas 338 reglas en el archivo original y su versión minificada.
- **Lógica:** 14 pruebas de fechas, archivo, almacenamiento y cálculo de estadísticas superadas.
- **Navegadores:** pruebas completas en Microsoft Edge y Google Chrome, con anchos de 320, 390, 768, 1024 y 1440 píxeles. Sin desbordes horizontales globales, errores de consola ni recursos locales faltantes.
- **Galería:** 46 imágenes, recorrido circular, última página parcial, versiones grandes al ampliar, Escape y retorno del foco. El carrusel carga miniaturas; las fotografías grandes de galería se solicitan al ampliar.
- **Cumpleaños:** fecha inexistente, fecha sin goles, 29 de febrero, guardado, recarga, borrado y texto del usuario tratado sin interpretar HTML. Se contemplan almacenamiento bloqueado y datos corruptos.
- **Sin conexión:** apertura directa con `file://`, fuente e imágenes locales y consulta del archivo de goles disponibles. La lectura y navegación principales también funcionan sin JavaScript.
- **Accesibilidad automática:** Axe 4.10.3 sin infracciones automáticas WCAG 2/2.1 A/AA en ocho estados: página, créditos desplegados, resultado del cumpleaños y diálogo de galería, tanto en escritorio como en celular.

Las comprobaciones automáticas no constituyen una certificación completa WCAG AA. Axe deja para revisión manual los textos superpuestos a fotografías y las relaciones de la tabla. Se verificaron sus cinco encabezados de columna, 21 filas de métricas y 84 celdas de datos, todas con contenido; los números decorativos están ocultos mediante ARIA y los controles con símbolos tienen nombres accesibles.

## Imágenes y atribuciones

Los 55 archivos fotográficos principales se normalizaron a JPEG real. Las imágenes AVIF o WebP que tenían extensión `.jpg` ya no dependen de que el navegador detecte su formato. Se corrigieron las dimensiones declaradas, se retiraron metadatos de cámara innecesarios y se registraron las atribuciones identificadas antes de optimizarlos.

Las 46 miniaturas están en `imagenes/miniaturas/`, con un máximo de 180 KiB. Las portadas usadas directamente también pesan menos de 200 KiB. Las versiones grandes de galería conservan hasta 1920 píxeles en su lado mayor y pueden superar ese peso porque se solicitan solo al ampliar una foto. Este reparto conserva calidad sin cargar los originales en cada recorrido del carrusel.

El footer publica 47 atribuciones identificadas, incluidas las fuentes de Wikimedia Commons y los autores reconocibles en los metadatos originales. No se asignan licencias Creative Commons a fotografías de agencia. Por instrucción del autor, las fotografías manuales sin fuente confirmada quedan fuera del listado visible; su falta de información se conserva en el registro interno, sin inventar autores ni permisos.

El respaldo previo a la limpieza permanece en `tmp/respaldo-antes-revision-tecnica.zip`, fuera de la entrega y del control de versiones.

## Alcance

Se mantienen las nueve secciones solicitadas; no se agregan secciones para completar artificialmente el mínimo de diez. Los ejemplos de metadatos que requieren dominio público, verificación de cuentas o servicios de terceros no se rellenan con datos ficticios. Tampoco se añaden refresh automático, Analytics, chatbot, PWA ni un formulario que simule enviar mensajes.

Los enlaces externos dependen de sus respectivos proveedores. Esta revisión comprueba recursos y destinos internos; no garantiza que todos los servicios externos mantengan su contenido o disponibilidad. El funcionamiento principal de la página no depende de visitarlos.
