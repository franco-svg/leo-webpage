const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const target = '../herramientas/estadisticas.js';
const api = fs.existsSync(require('node:path').join(__dirname, target)) ? require(target) : {};
const sample = [
    { date: '2012-01-01', team: 'Barcelona', home: 'FC Barcelona', away: 'Rival', result: '3-0', minutes: 90, starter: true, goals: 3, assists: 1, cards: 1, red: false },
    { date: '2012-01-02', team: 'Barcelona', home: 'Rival', away: 'FC Barcelona', result: '2-1', minutes: 30, starter: false, goals: 0, assists: 1, cards: 1, red: true }
];
test('calcula promedios con el denominador correcto y separa disciplina de producción', () => {
    assert.equal(typeof api.summarize, 'function');
    const stats = api.summarize(sample);
    assert.equal(stats.games, 2);
    assert.equal(stats.goalsPerGame, 1.5);
    assert.equal(stats.assistsPerGame, 1);
    assert.equal(stats.goalsPer90, 2.25);
    assert.equal(stats.assistsPer90, 1.5);
    assert.equal(stats.contributions, 5);
    assert.equal(stats.yellow, 1);
    assert.equal(stats.red, 1);
    assert.equal(stats.wins, 1);
    assert.equal(stats.losses, 1);
    assert.equal(stats.hattricks, 1);
    assert.equal(stats.scoringGames, 1);
    assert.equal(stats.starts, 1);
});
test('un conjunto vacío no genera NaN ni infinitos', () => {
    assert.equal(typeof api.summarize, 'function');
    const stats = api.summarize([]);
    assert.equal(stats.goalsPerGame, 0);
    assert.equal(stats.minutesPerGoal, null);
    assert.equal(stats.winRate, 0);
});
test('elige el año y la copa de mayor producción goleadora, excluyendo ligas y amistosos', () => {
    assert.equal(typeof api.findPeaks, 'function');
    const matches = [
        { ...sample[0], date: '2012-02-01', competition: 'EUR UEFA Champions League', goals: 4 },
        { ...sample[0], date: '2012-03-01', competition: 'PRM La Liga', goals: 5 },
        { ...sample[0], date: '2011-09-01', competition: 'EUR UEFA Champions League', goals: 3 },
        { ...sample[0], date: '2013-01-01', competition: 'FRN International friendly', goals: 6 }
    ];
    const peaks = api.findPeaks(matches);
    assert.equal(peaks.year.label, '2012');
    assert.equal(peaks.year.stats.goals, 9);
    assert.equal(peaks.cup.label, 'UEFA Champions League · 2011/12');
    assert.equal(peaks.cup.stats.goals, 7);
});

test('el archivo real reproduce los totales y las ediciones contrastadas', () => {
    const archive = require('../datos/partidos.js');
    assert.equal(archive.matches.length, 1184);
    for (const [team, games, goals, assists, red] of [['Barcelona', 778, 672, 269, 1], ['PSG', 75, 32, 34, 0], ['Inter Miami', 123, 107, 58, 0], ['Argentina', 208, 126, 67, 2]]) {
        const result = api.summarize(archive.matches.filter(match => match.team === team));
        assert.deepEqual([result.games, result.goals, result.assists, result.red], [games, goals, assists, red]);
        assert.equal(result.wins + result.draws + result.losses, games);
        assert.ok(result.yellow >= 0);
    }
    const peaks = api.findPeaks(archive.matches);
    assert.equal(peaks.year.label, '2012');
    assert.deepEqual([peaks.year.stats.games, peaks.year.stats.goals, peaks.year.stats.assists], [69, 91, 22]);
    assert.equal(peaks.cup.label, 'UEFA Champions League · 2011/12');
    assert.deepEqual([peaks.cup.stats.games, peaks.cup.stats.goals, peaks.cup.stats.assists], [11, 14, 6]);
});

test('los partidos de Champions de agosto de 2020 pertenecen a la edición 2019/20', () => {
    const matches = [
        { ...sample[0], competition: 'EUR UEFA Champions League', date: '2019-09-01', goals: 3 },
        { ...sample[0], competition: 'EUR UEFA Champions League', date: '2020-08-14', goals: 4 },
        { ...sample[0], competition: 'EUR UEFA Champions League', date: '2020-10-01', goals: 6 }
    ];
    assert.equal(api.findPeaks(matches).cup.label, 'UEFA Champions League · 2019/20');
    assert.equal(api.findPeaks(matches).cup.stats.goals, 7);
});
