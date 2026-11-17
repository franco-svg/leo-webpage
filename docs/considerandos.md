# Cobertura de los considerandos del PDF

El PDF se tomó como lista de criterios académicos. La petición directa del
usuario prevalece sobre instrucciones o ejemplos contenidos en el documento.

| Grupo | Aplicación en esta página |
| --- | --- |
| 1. Estructura | `index.html` en raíz; rutas relativas; CSS y JS externos; metadatos esenciales y sociales; favicon; navegación real; siete secciones; responsive; recursos locales; README y comentarios. |
| 2. HTML | Un h1; encabezados jerárquicos; header/nav/main/section/article/aside/footer; listas y ficha de datos; imágenes con alt y epígrafes; form, labels, input, select, textarea y button; tabla con caption, thead, tbody y tfoot. Sin tablas de maquetación ni etiquetas obsoletas. |
| 3. CSS | Hoja externa, original comentado y copia comprimida; Manrope importada desde un archivo local con licencia; variables de diseño, grid/flex y media queries; foco y contraste; tamaños adaptables; transiciones discretas y preferencia de movimiento reducido. |
| 4. JavaScript | Tres scripts con defer; addEventListener; funciones por responsabilidad; fechas válidas, feedback accesible, consulta real de datos locales y localStorage protegido; sin librerías en el sitio. |
| 5. Contenido | Textos revisados; períodos históricos explícitos; archivo con fecha de corte; fuentes, licencias y créditos; enlaces con destinos descriptivos; videos mediante búsquedas por partido. |
| 6. Accesibilidad | Navegación por teclado, skip link, foco visible, labels, errores asociados, aria-expanded y aria-pressed, galería con dialog nativo/Escape, devolución del foco y ausencia de reproducción automática. Revisión local con Axe y pruebas de navegador. |
| 7. Opcionales elegidos | Favicon SVG, búsqueda local por cumpleaños, guardado de recuerdos, fecha de actualización y enlaces para volver al inicio. |

## Decisiones sobre puntos particulares

- **1.11, diez secciones:** se mantienen las siete existentes por instrucción
  expresa del usuario. El buscador pertenece a Estadísticas y no agrega un
  destino nuevo a la navegación principal.
- **Metadatos de ejemplo:** no se inventan un dominio, una imagen social absoluta,
  un código de Search Console ni una cuenta de Analytics. No se aplica refresh
  automático porque interrumpiría la consulta y la lectura. `lang="es-AR"`
  identifica el idioma. Los ejemplos del PDF no son todos necesarios en cada web.
- **3.18, compresión:** la página carga `estilos.min.css`, generado a partir del
  original mediante una herramienta opcional de JavaScript, sin dependencias.
- **2.13 y 3.14, validadores W3C:** no se ejecutó la validación remota. Se verificó
  el HTML con un parser HTML5 y el CSS con un parser CSS ejecutados localmente,
  sin errores. No se afirma certificación W3C.
- **7, funciones opcionales:** no se incorporan cuentas, formularios que simulan
  enviar mensajes, analítica, notificaciones ni servicios de backend.

## Evidencia de verificación

- Nueve pruebas automatizadas de fechas, archivo real y almacenamiento.
- Pruebas completas en Microsoft Edge y Google Chrome.
- Resoluciones de 320, 390, 768, 1024 y 1440 píxeles sin desborde horizontal global.
  La tabla de estadísticas tiene desplazamiento horizontal propio en móvil.
- Guardado de nombre y nota, recarga y recuperación, borrado persistente y texto
  del usuario tratado sin HTML. Datos corruptos y storage bloqueado contemplados.
- Apertura de `index.html` con `file://` y navegador sin conexión; imágenes,
  tipografía, scripts y búsqueda disponibles localmente.
- Lectura, navegación y todo el palmarés disponibles con JavaScript desactivado.
- Navegación móvil, Escape, filtros y galería con recuperación de foco.
- Nombres guardados de 40 caracteres sin espacios ajustados a 320 píxeles y
  foco visible después de borrar la última fecha recuperada.
- Cero errores de consola y cero recursos locales faltantes en las pruebas.
- Axe: cero infracciones automáticas A/AA detectadas en escritorio, resultados,
  móvil y galería. Las verificaciones automáticas no certifican por sí solas
  cumplimiento integral WCAG; se complementaron con revisión visual y teclado.

Los enlaces externos y los resultados de video dependen de terceros. El sitio
no requiere visitar esos servicios para leer el contenido o consultar goles.
