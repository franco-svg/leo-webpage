// Actualiza únicamente los créditos del footer a partir del registro de imágenes.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'index.html');
const credits = JSON.parse(fs.readFileSync(path.join(root, 'imagenes/creditos.json'), 'utf8'));
const escape = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
// Solo se publican atribuciones identificadas. Las fotos sin fuente quedan fuera.
const published = credits.filter(
    (credit) => credit.artist && (credit.source || credit.attributionStatus === 'embedded-credit'),
);
const entries = published
    .map((credit) => {
        const title = escape(credit.label || credit.name);
        const author = escape(
            credit.artist
                ? credit.artist + (credit.agency ? ` / ${credit.agency}` : '')
                : 'Autor no identificado',
        );
        const source = credit.source
            ? ` · <a href="${escape(credit.source)}" target="_blank" rel="noopener noreferrer">Fuente</a>`
            : '';
        const license = credit.licenseurl
            ? `<a href="${escape(credit.licenseurl)}" target="_blank" rel="noopener noreferrer">${escape(credit.license)}</a>`
            : escape(credit.license || 'Fuente y licencia por confirmar');
        return `<li><strong>${title}</strong><span>${author}${source} · ${license}</span></li>`;
    })
    .join('\n');
const block = `<!-- IMAGE-CREDITS:START -->
            <details class="photo-credits" id="creditos">
                <summary>Créditos de las imágenes</summary>
                <div class="photo-credits-content" role="region" aria-label="Autores y licencias de las fotografías" tabindex="0">
                    <ul class="photo-credit-list">${entries}</ul>
                    <p>Tipografía <a href="fuentes/licencia-manrope.txt" target="_blank" rel="noopener noreferrer">Manrope · SIL Open Font License</a>.</p>
                </div>
            </details>
            <!-- IMAGE-CREDITS:END -->`;
const source = fs.readFileSync(filename, 'utf8');
const start = '<!-- IMAGE-CREDITS:START -->';
let output;
if (source.includes(start)) {
    output = source.replace(
        /<!-- IMAGE-CREDITS:START -->[\s\S]*?<!-- IMAGE-CREDITS:END -->/,
        block,
    );
} else {
    const footerStart = source.indexOf('<footer class="site-footer">');
    const footerEnd = source.indexOf('</footer>', footerStart);
    const containerEnd = source.lastIndexOf('</div>', footerEnd);
    if (footerStart < 0 || footerEnd < 0 || containerEnd < footerStart)
        throw new Error('No se encontró el footer');
    output = source.slice(0, containerEnd) + block + '\n        ' + source.slice(containerEnd);
}
fs.writeFileSync(filename, output);
console.log(`${published.length} fotografías con atribución identificada en el footer.`);
