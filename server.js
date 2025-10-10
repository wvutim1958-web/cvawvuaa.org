const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const PointCalculator = require('./calculate-points');
const gameResults = require('./game-results');
const app = express();

const calculator = new PointCalculator();

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Create initial rankings file if it doesn't exist
async function initializeRankingsFile() {
    const rankingsPath = path.join(__dirname, 'rankings-data.json');
    try {
        await fs.access(rankingsPath);
    } catch {
        const initialData = { teams: [], lastUpdated: null };
        await fs.writeFile(rankingsPath, JSON.stringify(initialData, null, 2));
    }
}

// Initialize data on startup
initializeRankingsFile().catch(console.error);

// Serve static files from current directory
app.use(express.static(__dirname));

// API endpoint to get rankings
app.get('/api/rankings', async (req, res) => {
    try {
        const rankings = {
            teams: [
                { 
                    name: 'Iowa State', 
                    conference: 'Big 12', 
                    rank: 1, 
                    record: '1-0', 
                    totalPoints: 14, 
                    games: 1, 
                    pointsPerGame: 14.0,
                    pointBreakdown: {
                        powerWins: 12,
                        awayWins: 1,
                        rankedWins: 1
                    }
                },
                { name: 'Oregon', conference: 'Pac-12', rank: 3, record: '5-0', totalPoints: 165, games: 5, pointsPerGame: 33.0 },
                { name: 'Ole Miss', conference: 'SEC', rank: 4, record: '5-0', totalPoints: 160, games: 5, pointsPerGame: 32.0 },
                { name: 'Texas A&M', conference: 'SEC', rank: 5, record: '5-0', totalPoints: 155, games: 5, pointsPerGame: 31.0 },
                { name: 'Oklahoma', conference: 'Big 12', rank: 6, record: '5-0', totalPoints: 150, games: 5, pointsPerGame: 30.0 },
                { name: 'Indiana', conference: 'Big Ten', rank: 7, record: '5-0', totalPoints: 145, games: 5, pointsPerGame: 29.0 },
                { name: 'Alabama', conference: 'SEC', rank: 8, record: '4-1', totalPoints: 140, games: 5, pointsPerGame: 28.0 },
                { name: 'Texas Tech', conference: 'Big 12', rank: 9, record: '5-0', totalPoints: 135, games: 5, pointsPerGame: 27.0 },
                { name: 'Georgia', conference: 'SEC', rank: 10, record: '4-1', totalPoints: 130, games: 5, pointsPerGame: 26.0 },
                { name: 'LSU', conference: 'SEC', rank: 11, record: '4-1', totalPoints: 125, games: 5, pointsPerGame: 25.0 },
                { name: 'Tennessee', conference: 'SEC', rank: 12, record: '4-1', totalPoints: 120, games: 5, pointsPerGame: 24.0 },
                { name: 'Georgia Tech', conference: 'ACC', rank: 13, record: '5-0', totalPoints: 115, games: 5, pointsPerGame: 23.0 },
                { name: 'Missouri', conference: 'SEC', rank: 14, record: '5-0', totalPoints: 110, games: 5, pointsPerGame: 22.0 },
                { name: 'Michigan', conference: 'Big Ten', rank: 15, record: '4-1', totalPoints: 105, games: 5, pointsPerGame: 21.0 },
                { name: 'Notre Dame', conference: 'Independent', rank: 16, record: '3-2', totalPoints: 100, games: 5, pointsPerGame: 20.0 },
                { name: 'Illinois', conference: 'Big Ten', rank: 17, record: '5-1', totalPoints: 95, games: 6, pointsPerGame: 15.8 },
                { name: 'BYU', conference: 'Big 12', rank: 18, record: '5-0', totalPoints: 90, games: 5, pointsPerGame: 18.0 },
                { name: 'Virginia', conference: 'ACC', rank: 19, record: '5-1', totalPoints: 85, games: 6, pointsPerGame: 14.2 },
                { name: 'Vanderbilt', conference: 'SEC', rank: 20, record: '5-1', totalPoints: 80, games: 6, pointsPerGame: 13.3 },
                { name: 'Arizona State', conference: 'Pac-12', rank: 21, record: '4-1', totalPoints: 75, games: 5, pointsPerGame: 15.0 },
                { name: 'Iowa State', conference: 'Big 12', rank: 22, record: '5-1', totalPoints: 70, games: 6, pointsPerGame: 11.7 },
                { name: 'Memphis', conference: 'American', rank: 23, record: '6-0', totalPoints: 65, games: 6, pointsPerGame: 10.8 },
                { name: 'South Florida', conference: 'American', rank: 24, record: '4-1', totalPoints: 60, games: 5, pointsPerGame: 12.0 },
                { name: 'Florida State', conference: 'ACC', rank: 25, record: '3-2', totalPoints: 55, games: 5, pointsPerGame: 11.0 }
            ],
            lastUpdated: new Date().toISOString()
        };
        res.json(rankings);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, create initial data
            const initialData = { teams: [], lastUpdated: null };
            await fs.writeFile(
                path.join(__dirname, 'rankings-data.json'),
                JSON.stringify(initialData, null, 2)
            );
            res.json(initialData);
        } else {
            console.error('Error reading rankings:', error);
            res.status(500).json({ error: error.message });
        }
    }
});

// API endpoint to update rankings
app.get('/api/update-rankings', async (req, res) => {
    try {
        const fetcher = new CBSDataFetcher();
        console.log('Initializing CBS Sports data fetcher...');
        
        console.log('Fetching games from CBS Sports...');
        const games = await fetcher.fetchAllWeeks();
        console.log(`Retrieved ${games.length} games`);

        console.log('Calculating rankings...');
        const rankings = await fetcher.updateRankings();
        
        // Enhance rankings with additional information
        const enhancedRankings = rankings.map(team => ({
            ...team,
            conference: fetcher.getTeamConference(team.name),
            qualityWins: team.qualityWins || []
        }));
        
        const rankingsData = {
            teams: enhancedRankings,
            lastUpdated: new Date().toISOString()
        };

        await fs.writeFile(
            path.join(__dirname, 'rankings-data.json'),
            JSON.stringify(rankingsData, null, 2)
        );

        res.json(rankingsData);
    } catch (error) {
        console.error('Error updating rankings:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Rankings server running at http://localhost:${port}/cfb-rankings.html`);
    console.log(`API endpoints:`);
    console.log(`  GET /api/rankings - Get current rankings`);
    console.log(`  GET /api/update-rankings - Update rankings from CBS Sports`);
});