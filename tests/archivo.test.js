const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../js/goles.js');
require('../js/cumpleanos.js');
const archive = globalThis.MessiGoalArchive;

test('el archivo no duplica goles y sus fechas son fechas reales dentro de su corte declarado', () => {
    assert.equal(new Set(archive.goals.map(goal => goal.id)).size, archive.goals.length);
    for (const goal of archive.goals) {
        assert.equal(new Date(`${goal.date}T12:00:00Z`).toISOString().slice(0, 10), goal.date);
        assert.ok(goal.date <= archive.through);
        assert.match(goal.source, /^https:\/\//);
    }
});

test('18 de diciembre reúne los dobletes de 2011 y 2022 y el gol de 2016', () => {
    const result = MessiBirthday.findGoals(archive.goals, 18, 12);
    assert.equal(result.total, 5);
    assert.equal(result.matches.length, 3);
    assert.deepEqual(result.matches[0].minutes, ['23', '108'], 'La final usa el minuto de la ficha oficial de FIFA');
    assert.equal(result.matches[2].total, 2);
});

test('el 29 de febrero encuentra el hat-trick de Suiza y el 24 de junio devuelve cero', () => {
    assert.equal(MessiBirthday.findGoals(archive.goals, 29, 2).total, 3);
    assert.equal(MessiBirthday.findGoals(archive.goals, 24, 6).total, 0);
});
