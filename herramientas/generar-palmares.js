// Genera HTML estático: el palmarés funciona sin peticiones de red ni JavaScript.
const fs = require('node:fs');
const path = require('node:path');
const data = require('../datos/palmares.js');
const root = path.resolve(__dirname, '..');
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const years = [...new Set([...data.clubs, ...data.national, ...data.individual].map(item => item.year))].sort((a, b) => a - b);
const teams = { 'FC Barcelona': 'barcelona', PSG: 'paris', 'Inter Miami': 'miami', Argentina: 'argentina', 'Lionel Messi': 'individual' };
function total(label, value, note = '') {
    return `<div><dt>${escape(label)}</dt><dd>${value}${note ? `<small>${escape(note)}</small>` : ''}</dd></div>`;
}
function timeline(key, label) {
    const records = data[key];
    const rows = years.map(year => `<li class="title-year"><time datetime="${year}">${year}</time><ul class="title-points" aria-label="${escape(label)}: ${year}">${records.filter(item => item.year === year).map((item, index) => {
        const id = `title-${key}-${year}-${index}`;
        return `<li class="title-point ${teams[item.team]}"><button type="button" class="title-dot" aria-label="${escape(item.title)}, ${escape(item.team)}, ${year}" aria-describedby="${id}" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">●</span></button><span class="title-tooltip" id="${id}" role="tooltip"><strong>${escape(item.title)}</strong><span>${escape(item.team)} · ${escape(item.detail)}</span></span></li>`;
    }).join('')}</ul></li>`).join('\n');
    const totals = key === 'clubs'
        ? ['FC Barcelona', 'PSG', 'Inter Miami'].map(team => total(team, records.filter(item => item.team === team).length)).join('')
        : key === 'national' ? total('Argentina', records.length, '4 mayor · 1 olímpico · 1 Sub-20')
            : total('Premios incluidos', records.length, 'Sin nominaciones ni equipos ideales');
    return `<article class="title-timeline" data-timeline="${key}" aria-label="${label}"><h3>${label}</h3><ol>${rows}</ol><dl class="title-totals" aria-label="Totales de ${label}">${totals}</dl></article>`;
}
const section = `<section class="chapter container" id="palmares" aria-labelledby="palmares-title">
    <div class="section-label"><span>03 / PALMARÉS</span></div>
    <div class="section-heading"><h2 id="palmares-title">Palmarés</h2></div>
    <p class="honors-context">Hasta el 17 de noviembre de 2026. Pasá el mouse, enfocá o tocá un punto.</p>
    <div class="title-timelines">${timeline('clubs', 'Clubes')}${timeline('national', 'Selección')}${timeline('individual', 'Individuales')}</div>
    <p class="honors-context">Individuales: selección de premios. Cada punto corresponde al año de edición o al final de la temporada.</p>
    <details class="honors-source"><summary>Fuentes del palmarés</summary><ul>${[...new Set([...data.clubs, ...data.national, ...data.individual].map(item => item.source))].map((url, index) => `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${['Palmarés oficial de Messi', 'FIFA: historial de The Best', 'Laureus: ganadores', 'MLS: MVP 2024 y 2025', 'MLS: Botín de Oro 2026', 'MLS Cup: MVP 2025', 'Leagues Cup: premios 2023'][index]}</a></li>`).join('')}</ul></details>
</section>`;
const filename = path.join(root, 'index.html');
const html = fs.readFileSync(filename, 'utf8');
if (!/<section[^>]*id="palmares"/.test(html)) throw new Error('No se encontró la sección Palmarés');
fs.writeFileSync(filename, html.replace(/<section class="chapter container" id="palmares"[\s\S]*?<\/section>/, section));
console.log(`Palmarés generado: ${data.clubs.length} títulos de clubes, ${data.national.length} de selección y ${data.individual.length} premios individuales.`);
