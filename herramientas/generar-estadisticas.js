// Generación opcional del tablón. El navegador recibe HTML; no necesita Node ni paquetes.
const fs = require('node:fs');
const path = require('node:path');
const archive = require('../datos/partidos.js');
const { summarize, findPeaks } = require('./estadisticas.js');
const teams = ['Barcelona', 'PSG', 'Inter Miami', 'Argentina'];
const stats = teams.map((team) =>
    summarize(archive.matches.filter((match) => match.team === team)),
);
const all = summarize(archive.matches);
const peaks = findPeaks(archive.matches);
const integer = (number) => number.toLocaleString('es-AR');
const decimal = (number) =>
    number === null
        ? '—'
        : number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const groups = [
    [
        'Participación',
        [
            ['Partidos', 'games'],
            ['Minutos jugados', 'minutes'],
            ['Como titular', 'starts'],
            ['Como suplente', 'substitutes'],
        ],
    ],
    [
        'Producción ofensiva',
        [
            ['Goles', 'goals'],
            ['Asistencias', 'assists'],
            ['Goles + asistencias', 'contributions'],
            ['Partidos con gol', 'scoringGames'],
            ['Hat-tricks o más', 'hattricks'],
        ],
    ],
    [
        'Promedios',
        [
            ['Goles por partido', 'goalsPerGame', true],
            ['Asistencias por partido', 'assistsPerGame', true],
            ['Goles + asistencias por partido', 'contributionsPerGame', true],
            ['Goles por 90 minutos', 'goalsPer90', true],
            ['Asistencias por 90 minutos', 'assistsPer90', true],
            ['Minutos por gol', 'minutesPerGoal', true],
        ],
    ],
    [
        'Resultados',
        [
            ['Victorias', 'wins'],
            ['Empates', 'draws'],
            ['Derrotas', 'losses'],
            ['Victorias (%)', 'winRate', true],
        ],
    ],
    [
        'Disciplina',
        [
            ['Amarillas', 'yellow'],
            ['Rojas directas', 'red'],
        ],
    ],
];
const table = groups
    .map(
        ([group, rows]) =>
            `<tbody><tr class="ledger-group"><th colspan="5" scope="rowgroup">${group}</th></tr>${rows.map(([label, key, rate]) => `<tr><th scope="row">${label}</th>${stats.map((team) => `<td>${rate ? decimal(team[key]) : integer(team[key])}</td>`).join('')}</tr>`).join('\n')}</tbody>`,
    )
    .join('\n');
function peakCard(kind, label, data, description) {
    const fields = [
        ['Partidos', data.games],
        ['Asistencias', data.assists],
        ['Goles / partido', decimal(data.goalsPerGame)],
        ['Goles / 90 min', decimal(data.goalsPer90)],
        ['Minutos', integer(data.minutes)],
        ['Amarillas', data.yellow],
        ['Rojas', data.red],
        ['Hat-tricks o más', data.hattricks],
    ];
    return `<article class="stats-peak ${kind}"><header><span>${kind === 'peak-year' ? 'Mejor año por goles' : 'Mejor copa por goles'}</span><h3>${label}</h3></header><div class="peak-score"><strong>${data.goals}</strong><span>goles</span></div><p>${description}</p><dl>${fields.map(([name, value]) => `<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl></article>`;
}
const board = `<!-- STATS-BOARD:START -->
                <div class="stats-board">
                    <div class="stats-board-heading"><h3>Tablón de carrera</h3><p>Partidos oficiales · Registro hasta el 01/11/2026</p></div>
                    <dl class="stats-overview">${[
                        ['Partidos', all.games],
                        ['Goles', all.goals],
                        ['Asistencias', all.assists],
                        ['Minutos', all.minutes],
                    ]
                        .map(
                            ([name, value]) =>
                                `<div><dt>${name}</dt><dd>${integer(value)}</dd></div>`,
                        )
                        .join('')}</dl>
                    <p class="ledger-mobile-hint">Deslizá la tabla para comparar los cuatro equipos.</p>
                    <div class="stats-scroll" role="region" aria-label="Comparación de estadísticas por equipo" tabindex="0">
                        <table class="stats-ledger"><caption>Estadísticas por equipo. Barcelona 2004–2021; PSG 2021–2023; Inter Miami 2023–2026; selección mayor de Argentina 2005–2026.</caption><thead><tr><th scope="col">Estadística</th>${teams.map((team, index) => `<th scope="col" class="ledger-team-${index}">${team}</th>`).join('')}</tr></thead>${table}</table>
                    </div>
                    <details class="stats-method"><summary>Fuentes y criterio de cálculo</summary><p>Fuente única del tablón: <a href="${archive.source}" target="_blank" rel="noopener noreferrer">www.messistats.com · registro de partidos</a>, consultado el 17/11/2026. Incluye amistosos internacionales de la selección mayor, sin fútbol juvenil ni amistosos de clubes. Las asistencias siguen el criterio de esta fuente y pueden diferir del publicado por los clubes.</p><p>Promedios por partido: total dividido por partidos jugados. Tasas por 90 minutos: total × 90 / minutos. Goles + asistencias cuenta ambas acciones. Las tandas de penales no se suman a los goles; los resultados corresponden al marcador del partido. Los hat-tricks incluyen actuaciones con cuatro o más goles.</p><p>Las tres rojas directas corresponden al debut con Argentina del 17/08/2005, el partido ante Chile del 06/07/2019 y la final de Supercopa del 17/01/2021. Referencias: <a href="https://www.afa.com.ar/A/posts/hace-18-anos-debutaba-leo-messi-en-la-seleccion-argentina" target="_blank" rel="noopener noreferrer">AFA: debut</a>, <a href="https://www.afa.com.ar/es/posts/ultima-victoria-de-argentina-frente-a-chile" target="_blank" rel="noopener noreferrer">AFA: Chile</a> y <a href="https://www.fcbarcelona.com/en/news/1979352" target="_blank" rel="noopener noreferrer">Barcelona: Supercopa</a>.</p></details>
                </div>
                <div class="stats-peaks" role="group" aria-label="Mejor año y mejor torneo de copa">
                    ${peakCard('peak-year', peaks.year.label, peaks.year.stats, 'Año calendario · Barcelona y Argentina. 79 goles con el club y 12 con la selección.')}
                    ${peakCard('peak-cup', peaks.cup.label, peaks.cup.stats, 'FC Barcelona · Semifinalista y máximo goleador de la edición.')}
                </div>
                <p class="stats-peak-note">“Mejor” = mayor cantidad de goles en un año o en una edición de copa. No se comparan temporadas de liga. Desempate por asistencias. Estadísticas calculadas sobre el mismo registro.</p>
                <!-- STATS-BOARD:END -->

                `;
const filename = path.join(__dirname, '../index.html');
const source = fs.readFileSync(filename, 'utf8');
let output;
if (source.includes('<!-- STATS-BOARD:START -->'))
    output = source.replace(/<!-- STATS-BOARD:START -->[\s\S]*?<!-- STATS-BOARD:END -->\s*/, board);
else {
    const start = source.indexOf('                <div class="table-scroll"');
    const end = source.indexOf('<article class="birthday"', start);
    if (start < 0 || end < 0) throw new Error('No se encontró el bloque de estadísticas');
    output = source.slice(0, start) + '                ' + board + source.slice(end);
}
fs.writeFileSync(filename, output);
console.log(
    JSON.stringify({
        teams: stats.map((s, i) => [teams[i], s.games, s.goals, s.assists, s.yellow, s.red]),
        bestYear: peaks.year.label,
        bestCup: peaks.cup.label,
    }),
);
