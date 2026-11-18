/* Herramienta opcional de mantenimiento. El sitio no necesita ejecutarla. */
const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, '../css');
const source = fs.readFileSync(path.join(folder, 'estilos.css'), 'utf8');

// Se preservan cadenas, escapes y espacios significativos de selectores y calc().
let output = '';
let quote = null;
let pendingSpace = false;
for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (quote) {
        output += char;
        if (char === '\\') output += source[++index] || '';
        else if (char === quote) quote = null;
        continue;
    }
    if (char === '/' && source[index + 1] === '*') {
        const end = source.indexOf('*/', index + 2);
        if (end === -1) throw new Error('Hay un comentario CSS sin cerrar');
        index = end + 1;
        pendingSpace = true;
        continue;
    }
    if (/\s/.test(char)) {
        pendingSpace = true;
        continue;
    }
    if ('{};'.includes(char)) {
        if (char === '}' && output.endsWith(';')) output = output.slice(0, -1);
        output += char;
        pendingSpace = false;
        continue;
    }
    if (pendingSpace && output && !'{};:'.includes(output.at(-1))) output += ' ';
    pendingSpace = false;
    if (char === '"' || char === "'") quote = char;
    output += char;
}
if (quote) throw new Error('Hay una cadena CSS sin cerrar');
fs.writeFileSync(path.join(folder, 'estilos.min.css'), output.trim() + '\n');
console.log(`CSS comprimido: ${Buffer.byteLength(source)} → ${Buffer.byteLength(output)} bytes`);
