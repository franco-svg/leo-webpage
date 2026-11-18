/* Lógica de fechas y persistencia, independiente del DOM y sin dependencias. */
(() => {
    'use strict';
    const STORAGE_KEY = 'leo-messi-cumpleanos-v1';
    const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    function validBirthday(day, month) {
        const d = Number(day);
        const m = Number(month);
        return (
            Number.isInteger(d) &&
            Number.isInteger(m) &&
            m >= 1 &&
            m <= 12 &&
            d >= 1 &&
            d <= monthDays[m - 1]
        );
    }

    function findGoals(goals, day, month) {
        if (!validBirthday(day, month)) throw new Error('Ingresá una fecha válida.');
        const dateSuffix = `-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const grouped = new Map();
        for (const goal of goals) {
            if (!goal.date.endsWith(dateSuffix)) continue;
            const key = `${goal.date}|${goal.home}|${goal.away}`;
            if (!grouped.has(key)) grouped.set(key, { ...goal, total: 0, minutes: [] });
            const match = grouped.get(key);
            match.total += 1;
            match.minutes.push(goal.minute);
        }
        const matches = [...grouped.values()].sort((a, b) => b.date.localeCompare(a.date));
        // El archivo está en orden descendente de gol; los minutos se muestran en orden de juego.
        for (const match of matches)
            match.minutes.sort((a, b) => {
                const elapsed = (value) =>
                    String(value)
                        .split('+')
                        .reduce((sum, part) => sum + Number(part), 0);
                return elapsed(a) - elapsed(b);
            });
        return {
            day: Number(day),
            month: Number(month),
            total: matches.reduce((sum, match) => sum + match.total, 0),
            matches,
        };
    }

    function normalizeSaved(items) {
        if (!Array.isArray(items)) return [];
        const seen = new Set();
        return items
            .filter((item) => {
                if (!item || !validBirthday(item.day, item.month)) return false;
                if (item.name !== undefined && typeof item.name !== 'string') return false;
                if (item.note !== undefined && typeof item.note !== 'string') return false;
                const key = `${Number(item.day)}/${Number(item.month)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 5)
            .map((item) => ({
                day: Number(item.day),
                month: Number(item.month),
                name: (item.name || '').trim().slice(0, 40),
                note: (item.note || '').trim().slice(0, 160),
            }));
    }

    function readSaved(storage) {
        try {
            const raw = storage.getItem(STORAGE_KEY);
            let parsed;
            try {
                parsed = JSON.parse(raw || '[]');
            } catch {
                parsed = [];
            }
            return { available: true, items: normalizeSaved(parsed) };
        } catch {
            return { available: false, items: [] };
        }
    }

    function writeSaved(storage, items) {
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(items));
            return { ok: true, items };
        } catch {
            return {
                ok: false,
                items: [],
                message:
                    'El navegador no permite guardar. Podés seguir consultando sin guardar tu fecha.',
            };
        }
    }

    function saveBirthday(storage, item) {
        const normalized = normalizeSaved([item]);
        if (!normalized.length)
            return { ok: false, items: [], message: 'Revisá la fecha antes de guardarla.' };
        const next = normalized[0];
        const previous = readSaved(storage);
        if (!previous.available)
            return {
                ok: false,
                items: [],
                message:
                    'El navegador no permite guardar. Podés seguir consultando sin guardar tu fecha.',
            };
        const others = previous.items.filter(
            (old) => old.day !== next.day || old.month !== next.month,
        );
        return writeSaved(storage, [next, ...others].slice(0, 5));
    }

    function removeBirthday(storage, day, month) {
        const previous = readSaved(storage);
        if (!previous.available)
            return {
                ok: false,
                items: [],
                message: 'El navegador no permite acceder a las fechas guardadas.',
            };
        return writeSaved(
            storage,
            previous.items.filter(
                (item) => item.day !== Number(day) || item.month !== Number(month),
            ),
        );
    }

    globalThis.MessiBirthday = Object.freeze({
        validBirthday,
        findGoals,
        readSaved,
        saveBirthday,
        removeBirthday,
    });
})();
