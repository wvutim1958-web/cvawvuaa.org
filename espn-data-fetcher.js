const axios = require('axios');
const cheerio = require('cheerio');

class ESPNDataFetcher {
    constructor() {
        this.baseUrl = 'https://www.espn.com/college-football/schedule';
        this.currentYear = 2025;
        this.conferences = {
            // Power 4 Conferences
            'ACC': 'P4',
            'SEC': 'P4',
            'Big Ten': 'P4',
            'Big 12': 'P4',
            // All other FBS conferences are G5
            'American': 'G5',
            'Conference USA': 'G5',
            'MAC': 'G5',
            'Mountain West': 'G5',
            'Sun Belt': 'G5',
            'Independents': 'G5'
        };
        this.teamConferences = {
            // ACC Teams
            'Boston College': 'ACC',
            'Clemson': 'ACC',
            'Duke': 'ACC',
            'Florida State': 'ACC',
            'Georgia Tech': 'ACC',
            'Louisville': 'ACC',
            'Miami': 'ACC',
            'NC State': 'ACC',
            'North Carolina': 'ACC',
            'Pittsburgh': 'ACC',
            'Syracuse': 'ACC',
            'Virginia': 'ACC',
            'Virginia Tech': 'ACC',
            'Wake Forest': 'ACC',
            
            // SEC Teams
            'Alabama': 'SEC',
            'Arkansas': 'SEC',
            'Auburn': 'SEC',
            'Florida': 'SEC',
            'Georgia': 'SEC',
            'Kentucky': 'SEC',
            'LSU': 'SEC',
            'Mississippi State': 'SEC',
            'Missouri': 'SEC',
            'Ole Miss': 'SEC',
            'South Carolina': 'SEC',

            // Mountain West Teams
            'Air Force': 'Mountain West',
            'Boise State': 'Mountain West',
            'Colorado State': 'Mountain West',
            'Fresno State': 'Mountain West',
            'Hawaii': 'Mountain West',
            'Nevada': 'Mountain West',
            'New Mexico': 'Mountain West',
            'San Diego State': 'Mountain West',
            'San José State': 'Mountain West',
            'UNLV': 'Mountain West',
            'Utah State': 'Mountain West',
            'Wyoming': 'Mountain West',

            // American Athletic Conference Teams
            'Charlotte': 'American',
            'East Carolina': 'American',
            'Florida Atlantic': 'American',
            'Memphis': 'American',
            'Navy': 'American',
            'North Texas': 'American',
            'Rice': 'American',
            'SMU': 'American',
            'South Florida': 'American',
            'Temple': 'American',
            'Tulane': 'American',
            'Tulsa': 'American',
            'UAB': 'American',
            'UTSA': 'American',

            // Conference USA Teams
            'Florida International': 'Conference USA',
            'Jacksonville State': 'Conference USA',
            'Liberty': 'Conference USA',
            'Louisiana Tech': 'Conference USA',
            'Middle Tennessee': 'Conference USA',
            'New Mexico State': 'Conference USA',
            'Sam Houston': 'Conference USA',
            'UTEP': 'Conference USA',
            'Western Kentucky': 'Conference USA',

            // MAC Teams
            'Akron': 'MAC',
            'Ball State': 'MAC',
            'Bowling Green': 'MAC',
            'Buffalo': 'MAC',
            'Central Michigan': 'MAC',
            'Eastern Michigan': 'MAC',
            'Kent State': 'MAC',
            'Miami (OH)': 'MAC',
            'Northern Illinois': 'MAC',
            'Ohio': 'MAC',
            'Toledo': 'MAC',
            'Western Michigan': 'MAC',

            // Sun Belt Teams
            'App State': 'Sun Belt',
            'Arkansas State': 'Sun Belt',
            'Coastal Carolina': 'Sun Belt',
            'Georgia Southern': 'Sun Belt',
            'Georgia State': 'Sun Belt',
            'James Madison': 'Sun Belt',
            'Louisiana': 'Sun Belt',
            'Marshall': 'Sun Belt',
            'Old Dominion': 'Sun Belt',
            'South Alabama': 'Sun Belt',
            'Southern Miss': 'Sun Belt',
            'Texas State': 'Sun Belt',
            'Troy': 'Sun Belt',
            'UL Monroe': 'Sun Belt',

            // Independent Teams
            'Notre Dame': 'Independents',
            'UConn': 'Independents',
            'UMass': 'Independents',
            'Tennessee': 'SEC',
            'Texas A&M': 'SEC',
            'Vanderbilt': 'SEC',

            // Big Ten Teams
            'Illinois': 'Big Ten',
            'Indiana': 'Big Ten',
            'Iowa': 'Big Ten',
            'Maryland': 'Big Ten',
            'Michigan': 'Big Ten',
            'Michigan State': 'Big Ten',
            'Minnesota': 'Big Ten',
            'Nebraska': 'Big Ten',
            'Northwestern': 'Big Ten',
            'Ohio State': 'Big Ten',
            'Penn State': 'Big Ten',
            'Purdue': 'Big Ten',
            'Rutgers': 'Big Ten',
            'Wisconsin': 'Big Ten',

            // Big 12 Teams
            'Arizona': 'Big 12',
            'Arizona State': 'Big 12',
            'Baylor': 'Big 12',
            'BYU': 'Big 12',
            'Cincinnati': 'Big 12',
            'Colorado': 'Big 12',
            'Houston': 'Big 12',
            'Iowa State': 'Big 12',
            'Kansas': 'Big 12',
            'Kansas State': 'Big 12',
            'Oklahoma': 'Big 12',
            'Oklahoma State': 'Big 12',
            'TCU': 'Big 12',
            'Texas': 'Big 12',
            'Texas Tech': 'Big 12',
            'UCF': 'Big 12',
            'Utah': 'Big 12',
            'West Virginia': 'Big 12'
        };
    }

    getTeamConference(teamName) {
        const conference = this.teamConferences[teamName];
        if (!conference) {
            console.log(`Warning: Unknown conference for team ${teamName}`);
            return 'G5'; // Default to G5 for unknown teams
        }
        return conference;
    }

    async fetchWeekSchedule(week) {
        try {
            const url = `${this.baseUrl}/_/week/${week}/year/${this.currentYear}/seasontype/2`;
            console.log(`Fetching schedule for week ${week} from URL: ${url}`);
            
            const response = await axios.get(url, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // default
                }
            });
            
            if (!response.data || typeof response.data !== 'string') {
                console.error(`Invalid response data for week ${week}:`, typeof response.data);
                return [];
            }

            console.log(`Successfully fetched week ${week}, response length: ${response.data.length}`);
            
            // Check if we got an HTML response
            if (!response.data.includes('<!DOCTYPE html>') && !response.data.includes('<html')) {
                console.error(`Response for week ${week} doesn't appear to be HTML:`, response.data.substring(0, 200));
                return [];
            }

            const games = this.parseSchedulePage(response.data);
            console.log(`Parsed ${games.length} games for week ${week}`);
            
            if (games.length === 0) {
                console.log(`No games found for week ${week}. This might be normal for future weeks.`);
            }
            
            return games;
        } catch (error) {
            console.error(`Error fetching week ${week}:`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Headers:`, error.response.headers);
                console.error(`Data:`, error.response.data);
            } else if (error.request) {
                console.error(`No response received:`, error.message);
            } else {
                console.error(`Error details:`, error);
            }
            return [];
        }
    }

    parseSchedulePage(html) {
        const $ = cheerio.load(html);
        const games = [];
        console.log('Parsing schedule page...');

        // Find all rows containing game data
        const rows = $('tr').filter((_, row) => {
            const rowText = $(row).text().trim();
            // Check for game pattern but exclude navigation rows
            return rowText.includes('@') && 
                   !rowText.includes('Skip') && 
                   !rowText.includes('Terms') && 
                   !rowText.includes('Privacy');
        });

        console.log(`Found ${rows.length} potential game rows`);

        let currentDate = '';
        
        rows.each((_, row) => {
            const rowText = $(row).text().trim();
            
            // If this is a date row, update currentDate
            if (rowText.includes('day,')) {
                currentDate = rowText.trim();
                return;
            }

            try {
                // Find cells containing team names and scores
                const cells = $(row).find('td');
                if (cells.length === 0) return;

                // Get all text from the row
                const fullText = cells.map((_, cell) => $(cell).text().trim()).get().join(' ');
                
                // Split on @ to get teams
                const parts = fullText.split('@').map(p => p.trim());
                if (parts.length !== 2) return;

                const [awayPart, homePart] = parts;

                // Extract ranks and team names
                const awayMatch = awayPart.match(/^(?:(\d+)\s+)?([^0-9]+?)(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM|NOON)?|\s+[A-Z]+\s+\d+)?/);
                const homeMatch = homePart.match(/^(?:(\d+)\s+)?([^0-9]+?)(?:\s+[A-Z]+\s+\d+|\s+\d{1,2}:\d{2}\s*(?:AM|PM|NOON)?)/);

                if (!awayMatch || !homeMatch) {
                    console.log('Failed to parse teams from:', awayPart, ' | ', homePart);
                    return;
                }

                // Clean up team names
                const cleanTeamName = (name) => {
                    name = name.trim()
                        .replace(/\s+/g, ' ')  // normalize spaces
                        .replace(/\([^)]*\)/g, '')  // remove parentheses
                        .trim();
                    
                    // Common abbreviation mappings
                    const mappings = {
                        'MSST': 'Mississippi State',
                        'USF': 'South Florida',
                        'UCF': 'UCF',
                        'UNLV': 'UNLV',
                        'TCU': 'TCU',
                        'LSU': 'LSU',
                        'UAB': 'UAB',
                        'SMU': 'SMU',
                        'UL': 'Louisiana',
                        'ULM': 'UL Monroe',
                        'UTEP': 'UTEP',
                        'UTSA': 'UTSA'
                    };

                    return mappings[name] || name;
                };

                const game = {
                    date: currentDate,
                    awayTeam: cleanTeamName(awayMatch[2].trim()),
                    homeTeam: cleanTeamName(homeMatch[2].trim()),
                    awayRank: awayMatch[1] ? parseInt(awayMatch[1]) : null,
                    homeRank: homeMatch[1] ? parseInt(homeMatch[1]) : null,
                    awayScore: null,
                    homeScore: null
                };

                // Look for scores in the text (patterns like "TEAM 24, TEAM 21" or "TEAM 24 TEAM 21")
                const scoreMatch = fullText.match(/[A-Z]+\s+(\d+)[\s,]+[A-Z]+\s+(\d+)/);
                if (scoreMatch) {
                    game.awayScore = parseInt(scoreMatch[1]);
                    game.homeScore = parseInt(scoreMatch[2]);
                    console.log(`Found scores: ${game.awayScore}-${game.homeScore}`);
                } else {
                    // Look for alternative score patterns
                    const altScoreMatch = fullText.match(/(\d+)-(\d+)/);
                    if (altScoreMatch) {
                        game.awayScore = parseInt(altScoreMatch[1]);
                        game.homeScore = parseInt(altScoreMatch[2]);
                        console.log(`Found alt scores: ${game.awayScore}-${game.homeScore}`);
                    }
                }

                console.log(`Parsed game: ${game.awayTeam}${game.awayRank ? ` (#${game.awayRank})` : ''} @ ${game.homeTeam}${game.homeRank ? ` (#${game.homeRank})` : ''}`);
                if (game.awayScore !== null) {
                    console.log(`Score: ${game.awayScore}-${game.homeScore}`);
                }

                games.push(game);
            } catch (error) {
                console.error(`Error parsing row: ${rowText}`, error);
            }
        });

        return games;

        return games;
    }

    extractRank(text) {
        // Look for a number at the start of the text
        const match = text.match(/^(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    async fetchAllWeeks() {
        const allGames = [];
        const errors = [];
        console.log('Starting to fetch all weeks...');

        // Test fetch one week first to validate parsing
        console.log('\nTesting with Week 1...');
        try {
            const testGames = await this.fetchWeekSchedule(1);
            console.log('Week 1 test response structure:', testGames);
        } catch (error) {
            console.error('Week 1 test failed:', error);
        }

        // Fetch weeks 1 through 15 (regular season + conference championships)
        for (let week = 1; week <= 15; week++) {
            try {
                console.log(`\nProcessing Week ${week}...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay between requests
                const games = await this.fetchWeekSchedule(week);
                
                if (games && Array.isArray(games)) {
                    const validGames = games.filter(game => 
                        game && 
                        typeof game === 'object' && 
                        game.homeTeam && 
                        game.awayTeam
                    );

                    if (validGames.length > 0) {
                        const gamesWithWeek = validGames.map(game => ({ ...game, week }));
                        allGames.push(...gamesWithWeek);
                        console.log(`Added ${validGames.length} valid games from Week ${week}`);
                    } else {
                        console.log(`No valid games found in Week ${week} response`);
                    }
                } else {
                    console.log(`Invalid response format for Week ${week}`);
                }
            } catch (error) {
                console.error(`Failed to fetch Week ${week}:`, error);
                errors.push({ week, error: error.message });
            }
        }

        console.log('\nFetch summary:');
        console.log(`Total games collected: ${allGames.length}`);
        
        if (errors.length > 0) {
            console.log(`Errors encountered: ${errors.length}`);
            errors.forEach(error => {
                console.log(`Week ${error.week}: ${error.error}`);
            });
        }

        if (allGames.length === 0) {
            throw new Error('No games were successfully fetched from any week');
        }

        return allGames;
    }

    calculateTeamPoints(games, teamName) {
        let totalPoints = 0;
        const teamGames = games.filter(game => 
            game.homeTeam === teamName || game.awayTeam === teamName
        );

        for (const game of teamGames) {
            const isHome = game.homeTeam === teamName;
            const teamScore = isHome ? game.homeScore : game.awayScore;
            const opponentScore = isHome ? game.awayScore : game.homeScore;
            const opponentName = isHome ? game.awayTeam : game.homeTeam;
            
            if (teamScore > opponentScore) {
                // Base points for win
                const opponentConference = this.getTeamConference(opponentName);
                totalPoints += this.getBasePoints(opponentConference);

                // Bonus points
                if (!isHome && !game.neutral) totalPoints += 1; // Away game
                if (teamScore >= 50) totalPoints += 1; // 50+ points scored
                if (opponentScore === 0) totalPoints += 1; // Shutout
                
                // Opponent wins bonus
                const opponentWins = this.getTeamWins(games, opponentName);
                totalPoints += opponentWins;

                // Ranked opponent bonus
                const opponentRank = isHome ? game.awayRank : game.homeRank;
                if (opponentRank && opponentRank <= 25) totalPoints += 1;
            }
        }

        return totalPoints;
    }

    getBasePoints(conference) {
        switch(conference) {
            case 'P4': return 12;
            case 'G5': return 6;
            default: return 3; // FCS
        }
    }

    getTeamWins(games, teamName) {
        return games.filter(game => {
            const isHome = game.homeTeam === teamName;
            const teamScore = isHome ? game.homeScore : game.awayScore;
            const opponentScore = isHome ? game.awayScore : game.homeScore;
            return teamScore > opponentScore;
        }).length;
    }

    async updateRankings() {
        const games = await this.fetchAllWeeks();
        const teams = new Set([
            ...games.map(game => game.homeTeam),
            ...games.map(game => game.awayTeam)
        ]);

        const rankings = Array.from(teams).map(team => ({
            name: team,
            points: this.calculateTeamPoints(games, team),
            record: this.getTeamRecord(games, team)
        }));

        rankings.sort((a, b) => b.points - a.points);
        return rankings.slice(0, 25);
    }

    getTeamRecord(games, teamName) {
        const teamGames = games.filter(game => 
            game.homeTeam === teamName || game.awayTeam === teamName
        );
        
        const wins = teamGames.filter(game => {
            const isHome = game.homeTeam === teamName;
            return isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore;
        }).length;

        const losses = teamGames.filter(game => {
            const isHome = game.homeTeam === teamName;
            return isHome ? game.homeScore < game.awayScore : game.awayScore < game.homeScore;
        }).length;

        return `${wins}-${losses}`;
    }
}

module.exports = ESPNDataFetcher;