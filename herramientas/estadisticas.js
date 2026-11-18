// Cálculos compartidos por el generador estático y las pruebas. Sin dependencias.
function summarize(matches) {
    const stats = {
        games: matches.length,
        minutes: 0,
        goals: 0,
        assists: 0,
        starts: 0,
        yellow: 0,
        red: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        scoringGames: 0,
        hattricks: 0,
    };
    const names = {
        Barcelona: 'FC Barcelona',
        PSG: 'Paris Saint-Germain',
        'Inter Miami': 'Inter Miami CF',
        Argentina: 'Argentina',
    };
    for (const match of matches) {
        stats.minutes += match.minutes;
        stats.goals += match.goals;
        stats.assists += match.assists;
        stats.starts += Number(match.starter);
        stats.red += Number(match.red);
        stats.yellow += match.cards - Number(match.red);
        stats.scoringGames += Number(match.goals > 0);
        stats.hattricks += Number(match.goals >= 3);
        const [home, away] = match.result.split('-').map(Number);
        const difference = match.home === names[match.team] ? home - away : away - home;
        stats[difference === 0 ? 'draws' : difference > 0 ? 'wins' : 'losses']++;
    }
    const divide = (number, denominator) => (denominator ? number / denominator : 0);
    return {
        ...stats,
        substitutes: stats.games - stats.starts,
        contributions: stats.goals + stats.assists,
        goalsPerGame: divide(stats.goals, stats.games),
        assistsPerGame: divide(stats.assists, stats.games),
        contributionsPerGame: divide(stats.goals + stats.assists, stats.games),
        goalsPer90: divide(stats.goals * 90, stats.minutes),
        assistsPer90: divide(stats.assists * 90, stats.minutes),
        minutesPerGoal: stats.goals ? stats.minutes / stats.goals : null,
        winRate: divide(stats.wins * 100, stats.games),
    };
}
function findPeaks(matches) {
    const years = new Map();
    const cups = new Map();
    const append = (map, key, match) => {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(match);
    };
    for (const match of matches) {
        const [year, month] = match.date.split('-').map(Number);
        append(years, String(year), match);
        if (!/^(EUR|CUP|SUP|IUP|NAM|CPA|WCP|WCT|COC)\s/.test(match.competition)) continue;
        // Champions y Copa del Rey usan temporada; supercopas y torneos americanos usan edición anual.
        let season = /^(EUR|CUP)\s/.test(match.competition)
            ? `${month >= 7 ? year : year - 1}/${String(month >= 7 ? year + 1 : year).slice(2)}`
            : year;
        // La Champions 2019/20 terminó excepcionalmente en agosto por la pandemia.
        if (
            match.competition.startsWith('EUR ') &&
            match.date >= '2020-07-01' &&
            match.date <= '2020-08-23'
        )
            season = '2019/20';
        append(cups, `${match.competition.replace(/^\S+\s+/, '')} · ${season}`, match);
    }
    const best = (map) =>
        [...map]
            .map(([label, list]) => ({ label, stats: summarize(list) }))
            .sort((a, b) => b.stats.goals - a.stats.goals || b.stats.assists - a.stats.assists)[0];
    return { year: best(years), cup: best(cups) };
}
module.exports = { summarize, findPeaks };
