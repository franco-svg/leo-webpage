# Messi: de Rosario al mundo

## Diseño y alcance

Se conserva la navegación y las siete secciones existentes: Inicio, Biografía,
Trayectoria, Palmarés, Estadísticas, Momentos y Galería. La autorización del
usuario para decidir el diseño permite avanzar sin una instancia adicional de
aprobación. Estética editorial: fondo marfil, azul noche, celeste argentino,
acentos dorados, títulos serif y fotografías con sus créditos originales.

HTML semántico, CSS externo y JavaScript nativo con `defer`. Sin frameworks,
paquetes de ejecución, backend, compilación ni API requerida al visitar el sitio.
Se debe poder abrir `index.html` directamente. Los videos y fuentes externas
requieren conexión; las imágenes, la navegación y las consultas son locales.

El buscador, dentro de Estadísticas, compara día y mes de todos los años del
archivo de goles. Agrupa por partido, suma goles y ofrece una búsqueda de video
específica por partido. No se confunden los penales de una tanda con goles del
partido. Incluye 29 de febrero, fechas inválidas y fechas sin goles. Muestra la
fuente, el total del archivo y su fecha de corte.

Se guardan voluntariamente hasta cinco fechas con nombre y nota opcionales.
localStorage se valida al leerlo, permite recuperar y borrar recuerdos y falla
con un mensaje claro cuando el navegador bloquea el almacenamiento. Los textos
del usuario se insertan con `textContent`.

## Criterio para el PDF

El punto 1.11 solicita diez secciones. Prevalece la instrucción directa del
usuario de conservar las existentes. Los ejemplos de metadatos no se copian
como requisitos literales: no se inventa un código de Search Console, un dominio
publicado ni una redirección automática. Los puntos del capítulo 7 son opcionales.
Las estadísticas históricas conservan sus períodos y el palmarés se identifica
como selección hasta 2024, sin presentarlo como un total actual.

## Plan de implementación y verificación

- [x] Preparar el archivo local de goles con atribución y optimizar fotografías.
- [x] Escribir y ejecutar pruebas que fallen para fechas, agregación y guardado.
- [x] Implementar la lógica independiente en `js/cumpleanos.js` y pasar pruebas.
- [x] Rehacer `index.html` y `css/estilos.css` conservando contenido y créditos.
- [x] Implementar menú móvil, pestañas de palmarés, cumpleaños, guardados y galería.
- [x] Revisar escritorio y móvil; probar teclado, recarga, borrado y storage bloqueado.
- [x] Revisar HTML, rutas, imágenes, consola, contraste y movimiento reducido.
- [x] Actualizar README y registrar la cobertura del PDF y límites verificados.
- Integración autorizada: revisar el cambio, comitearlo y mergear la rama
  `codex/complete-messi-website` a `main`. El historial de Git registra el cierre.
