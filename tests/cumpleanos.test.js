// Ejecutar con: node --test tests/cumpleanos.test.js (sin dependencias).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sandbox = {};
const logicPath = path.join(__dirname, '../js/cumpleanos.js');
if (fs.existsSync(logicPath)) vm.runInNewContext(fs.readFileSync(logicPath, 'utf8'), sandbox);
const api = sandbox.MessiBirthday || {};
const fixture = [
  { date: '2022-12-18', home: 'Argentina', away: 'France', minute: '23', result: '3-3', competition: 'World Cup', source: 'https://www.messistats.com/en/detail/1' },
  { date: '2022-12-18', home: 'Argentina', away: 'France', minute: '108', result: '3-3', competition: 'World Cup', source: 'https://www.messistats.com/en/detail/1' },
  { date: '2016-12-18', home: 'FC Barcelona', away: 'Espanyol', minute: '90', result: '4-1', competition: 'La Liga', source: 'https://www.messistats.com/en/detail/2' },
  { date: '2012-02-29', home: 'Switzerland', away: 'Argentina', minute: '20', result: '1-3', competition: 'International friendly', source: 'https://www.messistats.com/en/detail/3' }
];

test('rechaza fechas inexistentes y acepta 29 de febrero sin necesitar año de nacimiento', () => {
  assert.equal(typeof api.validBirthday, 'function', 'Debe existir el validador de fechas');
  for (const [day, month] of [[31, 4], [30, 2], [0, 1], [1, 13], [1.5, 3], ['', 3], [NaN, 2]]) {
    assert.equal(api.validBirthday(day, month), false, `${day}/${month} debe rechazarse`);
  }
  assert.equal(api.validBirthday(29, 2), true);
  assert.equal(api.validBirthday('18', '12'), true);
});

test('suma goles del mismo día de todos los años y agrupa por partido, más reciente primero', () => {
  assert.equal(typeof api.findGoals, 'function', 'Debe existir la consulta');
  const result = api.findGoals(fixture, 18, 12);
  assert.equal(result.total, 3);
  assert.equal(result.matches.length, 2);
  assert.equal(result.matches[0].date, '2022-12-18');
  assert.deepEqual(Array.from(result.matches[0].minutes), ['23', '108']);
  assert.equal(result.matches[1].total, 1);
});

test('devuelve cero real para un día sin goles y un error para una fecha imposible', () => {
  assert.equal(typeof api.findGoals, 'function');
  assert.equal(api.findGoals(fixture, 24, 6).total, 0);
  assert.throws(() => api.findGoals(fixture, 31, 2), /fecha/i);
});

test('restaura solo recuerdos válidos y tolera JSON corrupto o storage bloqueado', () => {
  assert.equal(typeof api.readSaved, 'function');
  assert.equal(api.readSaved({ getItem: () => '{broken' }).items.length, 0);
  assert.equal(api.readSaved({ getItem: () => { throw Error('blocked'); } }).available, false);
  const result = api.readSaved({ getItem: () => JSON.stringify([
    { day: 18, month: 12, name: 'Leo', note: 'Un recuerdo' },
    { day: 31, month: 2 }, null, { day: 1, month: 1, name: { bad: true } }
  ]) });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].name, 'Leo');
});

test('guarda de verdad, no duplica fechas y limita a cinco recuerdos recientes', () => {
  assert.equal(typeof api.saveBirthday, 'function');
  let raw = null;
  const storage = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
  for (let day = 1; day <= 6; day++) assert.equal(api.saveBirthday(storage, { day, month: 1, name: 'Ana', note: '' }).ok, true);
  assert.equal(JSON.parse(raw).length, 5);
  assert.equal(JSON.parse(raw)[0].day, 6);
  api.saveBirthday(storage, { day: 6, month: 1, name: 'Otra persona', note: '' });
  assert.equal(JSON.parse(raw).length, 5);
  assert.equal(api.readSaved(storage).items[0].name, 'Otra persona');
  assert.equal(api.saveBirthday({ getItem: () => null, setItem: () => { throw Error('quota'); } }, { day: 1, month: 1 }).ok, false);
});

test('el borrado persiste y no elimina fechas ajenas', () => {
  assert.equal(typeof api.removeBirthday, 'function');
  let raw = JSON.stringify([{ day: 18, month: 12, name: '', note: '' }, { day: 1, month: 5, name: '', note: '' }]);
  const storage = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
  assert.equal(api.removeBirthday(storage, 18, 12).ok, true);
  assert.equal(JSON.parse(raw).length, 1);
  assert.equal(JSON.parse(raw)[0].month, 5);
});
