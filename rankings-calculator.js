class Game {
    constructor(opponent, isHome, score, opponentScore, opponentConference, opponentRanked, opponentWins) {
        this.opponent = opponent;
        this.isHome = isHome;
        this.score = score;
        this.opponentScore = opponentScore;
        this.opponentConference = opponentConference;
        this.opponentRanked = opponentRanked;
        this.opponentWins = opponentWins;
    }

    calculatePoints() {
        let points = 0;
        
        // Only calculate points if the game was won
        if (this.score > this.opponentScore) {
            // Base points for win based on conference
            switch(this.opponentConference) {
                case 'P4': // Power 4 (Big 10, Big 12, SEC, ACC)
                    points += 12;
                    break;
                case 'G5': // Group of 5 (Other FBS)
                    points += 6;
                    break;
                case 'FCS':
                    points += 3;
                    break;
            }

            // Bonus points
            if (!this.isHome) points += 1; // Away game bonus
            if (this.opponentRanked) points += 1; // Ranked opponent bonus
            if (this.score >= 50) points += 1; // High scoring bonus
            if (this.opponentScore === 0) points += 1; // Shutout bonus
            points += this.opponentWins; // Points for opponent's wins
        }

        return points;
    }
}

class Team {
    constructor(name, conference) {
        this.name = name;
        this.conference = conference;
        this.games = [];
        this.totalPoints = 0;
    }

    addGame(game) {
        this.games.push(game);
        this.calculateTotalPoints();
    }

    calculateTotalPoints() {
        this.totalPoints = this.games.reduce((sum, game) => sum + game.calculatePoints(), 0);
    }

    getRecord() {
        const wins = this.games.filter(game => game.score > game.opponentScore).length;
        const losses = this.games.filter(game => game.score < game.opponentScore).length;
        return `${wins}-${losses}`;
    }
}

// Function to update rankings data
async function updateRankingsData() {
    // This function would be called to update the rankings-data.json file
    // It would fetch current game data from an API or database
    // and calculate new rankings using the Team and Game classes
}