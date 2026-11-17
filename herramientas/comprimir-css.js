/* Herramienta opcional de mantenimiento; no se ejecuta en la página. Sin paquetes. */
const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, '../css');
const source = fs.readFileSync(path.join(folder, 'estilos.css'), 'utf8');
// Se conservan espacios de calc(), cadenas, selectores y valores de propiedades.
const compact = source.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(line => line.trim()).filter(Boolean).join('\n');
fs.writeFileSync(path.join(folder, 'estilos.min.css'), compact + '\n');
console.log(`CSS comprimido: ${Buffer.byteLength(source)} → ${Buffer.byteLength(compact)} bytes`);
