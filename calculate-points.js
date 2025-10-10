class PointCalculator {
    constructor() {
        this.powerConferences = ['ACC', 'SEC', 'Big Ten', 'Big 12'];
        this.g5Conferences = ['American', 'Conference USA', 'MAC', 'Mountain West', 'Sun Belt'];
    }

    calculateTeamPoints(team) {
        let totalPoints = 0;
        
        for (const game of team.games) {
            if (game.isWin) {
                // Base points for win
                if (this.powerConferences.includes(game.opponentConference)) {
                    totalPoints += 12; // Power 4 win
                } else if (this.g5Conferences.includes(game.opponentConference)) {
                    totalPoints += 6;  // Group of 6 win
                } else {
                    totalPoints += 3;  // FCS or below
                }

                // Bonus points
                if (game.isAway) totalPoints += 1;           // Away win
                if (game.score >= 50) totalPoints += 1;      // 50+ points scored
                if (game.opponentScore === 0) totalPoints += 1; // Shutout
                if (game.wasOpponentRanked) totalPoints += 1;   // Ranked win

                // Add point for each win by beaten opponent
                totalPoints += game.opponentWins;
            }
        }

        return {
            totalPoints: totalPoints,
            pointsPerGame: totalPoints / team.games.length
        };
    }

    sortTeams(teams) {
        return teams.sort((a, b) => {
            // Sort by total points first
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            // If tied on points, sort by points per game
            return b.pointsPerGame - a.pointsPerGame;
        });
    }
}

module.exports = PointCalculator;