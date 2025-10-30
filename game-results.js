const gameResults = {
    'Iowa State': {
        games: [
            { 
                week: 1,
                opponent: 'Kansas State',
                conference: 'Big 12',
                isWin: true,
                isAway: true,
                score: 24,
                opponentScore: 21,
                wasOpponentRanked: true, // KState was #17
                opponentRanking: 17,
                opponentWins: 0, // Current record 0-1
                points: {
                    base: 12,      // Power 4 win
                    away: 1,       // Away game win
                    ranked: 1,     // Opponent was ranked
                    total: 14
                }
            }
        ]
    }
};

module.exports = gameResults;