const axios = require('axios');
const cheerio = require('cheerio');

class CBSDataFetcher {
    constructor() {
        this.baseUrl = 'https://www.cbssports.com/college-football/schedule/FBS/';
        this.currentYear = 2025;
        this.powerConferences = ['ACC', 'SEC', 'Big Ten', 'Big 12']; // Power 4
        this.g5Conferences = ['American', 'Conference USA', 'MAC', 'Mountain West', 'Sun Belt']; // Group of 6
        
        // Point system
        this.pointValues = {
            powerWin: 12,
            g5Win: 6,
            fcsWin: 3,
            beatenTeamWin: 1,
            rankedWin: 1,
            awayWin: 1,
            fiftyPlus: 1,
            shutout: 1
        };
        
        // Team conference affiliations
        this.teamConferences = Object.create(null);

        // ACC Teams
        [
            ['Boston College', 'ACC'],
            ['California', 'ACC'],
            ['Cal', 'ACC'],
            ['Clemson', 'ACC'],
            ['Duke', 'ACC'],
            ['Florida State', 'ACC'],
            ['Georgia Tech', 'ACC'],
            ['Louisville', 'ACC'],
            ['Miami (FL)', 'ACC'],
            ['Miami (Fla.)', 'ACC'],
            ['NC State', 'ACC'],
            ['North Carolina', 'ACC'],
            ['Pittsburgh', 'ACC'],
            ['Pitt', 'ACC'],
            ['SMU', 'ACC'],
            ['Stanford', 'ACC'],
            ['Syracuse', 'ACC'],
            ['Virginia', 'ACC'],
            ['Virginia Tech', 'ACC'],
            ['Wake Forest', 'ACC']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // SEC Teams
        [
            ['Alabama', 'SEC'],
            ['Arkansas', 'SEC'],
            ['Auburn', 'SEC'],
            ['Florida', 'SEC'],
            ['Georgia', 'SEC'],
            ['Kentucky', 'SEC'],
            ['LSU', 'SEC'],
            ['Mississippi State', 'SEC'],
            ['Miss. State', 'SEC'],
            ['Missouri', 'SEC'],
            ['Ole Miss', 'SEC'],
            ['Oklahoma', 'SEC'],
            ['South Carolina', 'SEC'],
            ['So. Carolina', 'SEC'],
            ['Tennessee', 'SEC'],
            ['Texas', 'SEC'],
            ['Texas A&M', 'SEC'],
            ['Vanderbilt', 'SEC']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Big Ten Teams
        [
            ['Illinois', 'Big Ten'],
            ['Indiana', 'Big Ten'],
            ['Iowa', 'Big Ten'],
            ['Maryland', 'Big Ten'],
            ['Michigan', 'Big Ten'],
            ['Michigan State', 'Big Ten'],
            ['Minnesota', 'Big Ten'],
            ['Nebraska', 'Big Ten'],
            ['Northwestern', 'Big Ten'],
            ['Ohio State', 'Big Ten'],
            ['Oregon', 'Big Ten'],
            ['Penn State', 'Big Ten'],
            ['Purdue', 'Big Ten'],
            ['Rutgers', 'Big Ten'],
            ['UCLA', 'Big Ten'],
            ['USC', 'Big Ten'],
            ['Washington', 'Big Ten'],
            ['Wisconsin', 'Big Ten'],
            ['Notre Dame', 'Big Ten']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Big 12 Teams
        [
            ['Arizona', 'Big 12'],
            ['Arizona State', 'Big 12'],
            ['Baylor', 'Big 12'],
            ['BYU', 'Big 12'],
            ['Cincinnati', 'Big 12'],
            ['Colorado', 'Big 12'],
            ['Houston', 'Big 12'],
            ['Iowa State', 'Big 12'],
            ['Kansas', 'Big 12'],
            ['Kansas State', 'Big 12'],
            ['Oklahoma State', 'Big 12'],
            ['TCU', 'Big 12'],
            ['Texas Tech', 'Big 12'],
            ['UCF', 'Big 12'],
            ['Utah', 'Big 12'],
            ['West Virginia', 'Big 12']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // American Athletic Conference Teams
        [
            ['Charlotte', 'American'],
            ['East Carolina', 'American'],
            ['Florida Atlantic', 'American'],
            ['Memphis', 'American'],
            ['Navy', 'American'],
            ['North Texas', 'American'],
            ['Rice', 'American'],
            ['SMU', 'American'],
            ['South Florida', 'American'],
            ['Temple', 'American'],
            ['Tulane', 'American'],
            ['Tulsa', 'American'],
            ['UAB', 'American'],
            ['UTSA', 'American']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Conference USA Teams
        [
            ['FIU', 'Conference USA'],
            ['Jacksonville State', 'Conference USA'],
            ['Liberty', 'Conference USA'],
            ['Louisiana Tech', 'Conference USA'],
            ['Middle Tennessee', 'Conference USA'],
            ['New Mexico State', 'Conference USA'],
            ['Sam Houston', 'Conference USA'],
            ['UTEP', 'Conference USA'],
            ['Western Kentucky', 'Conference USA']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // MAC Teams
        [
            ['Akron', 'MAC'],
            ['Ball State', 'MAC'],
            ['Bowling Green', 'MAC'],
            ['Buffalo', 'MAC'],
            ['Central Michigan', 'MAC'],
            ['Eastern Michigan', 'MAC'],
            ['Kent State', 'MAC'],
            ['Miami (OH)', 'MAC'],
            ['Northern Illinois', 'MAC'],
            ['Ohio', 'MAC'],
            ['Toledo', 'MAC'],
            ['Western Michigan', 'MAC']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Mountain West Teams
        [
            ['Air Force', 'Mountain West'],
            ['Boise State', 'Mountain West'],
            ['Colorado State', 'Mountain West'],
            ['Fresno State', 'Mountain West'],
            ['Hawaii', 'Mountain West'],
            ['Nevada', 'Mountain West'],
            ['New Mexico', 'Mountain West'],
            ['San Diego State', 'Mountain West'],
            ['San Jose State', 'Mountain West'],
            ['UNLV', 'Mountain West'],
            ['Utah State', 'Mountain West'],
            ['Wyoming', 'Mountain West']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Sun Belt Teams
        [
            ['Appalachian State', 'Sun Belt'],
            ['Arkansas State', 'Sun Belt'],
            ['Coastal Carolina', 'Sun Belt'],
            ['Georgia Southern', 'Sun Belt'],
            ['Georgia State', 'Sun Belt'],
            ['James Madison', 'Sun Belt'],
            ['Louisiana', 'Sun Belt'],
            ['Marshall', 'Sun Belt'],
            ['Old Dominion', 'Sun Belt'],
            ['South Alabama', 'Sun Belt'],
            ['Southern Miss', 'Sun Belt'],
            ['Texas State', 'Sun Belt'],
            ['Troy', 'Sun Belt'],
            ['UL Monroe', 'Sun Belt']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Independent FBS Teams
        [
            ['Army', 'Independent'],
            ['UConn', 'Independent'],
            ['UMass', 'Independent']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);

        // Alternate team names
        [
            ['App. State', 'Sun Belt'],
            ['App. St.', 'Sun Belt'],
            ['Ball St.', 'MAC'],
            ['Boise St.', 'Mountain West'],
            ['C. Carolina', 'Sun Belt'],
            ['C. Michigan', 'MAC'],
            ['Colorado St.', 'Mountain West'],
            ['E. Michigan', 'MAC'],
            ['Fresno St.', 'Mountain West'],
            ['Ga. Southern', 'Sun Belt'],
            ['Georgia St.', 'Sun Belt'],
            ['Jacksonville St.', 'Conference USA'],
            ['Kent St.', 'MAC'],
            ['Miami-OH', 'MAC'],
            ['Middle Tenn.', 'Conference USA'],
            ['N. Illinois', 'MAC'],
            ['New Mexico St.', 'Conference USA'],
            ['San Diego St.', 'Mountain West'],
            ['San Jose St.', 'Mountain West'],
            ['So. Miss', 'Sun Belt'],
            ['Texas St.', 'Sun Belt'],
            ['UL-Monroe', 'Sun Belt'],
            ['Utah St.', 'Mountain West'],
            ['W. Kentucky', 'Conference USA'],
            ['W. Michigan', 'MAC'],
            ['Washington St.', 'G5'],
            ['Oregon State', 'G5'],
            ['Washington State', 'G5']
        ].forEach(([team, conf]) => this.teamConferences[team] = conf);
        
        // Create list of FCS teams
        this.fcsTeams = new Set([
            'Abilene Christian', 'Alabama A&M', 'Alabama State', 'Albany', 'Alcorn State',
            'Arkansas-Pine Bluff', 'Austin Peay', 'Bethune-Cookman', 'Brown', 'Bryant',
            'Bucknell', 'Butler', 'Cal Poly', 'Campbell', 'Central Arkansas',
            'Central Connecticut', 'Charleston Southern', 'Chattanooga', 'Citadel', 'Colgate',
            'Columbia', 'Cornell', 'Dartmouth', 'Davidson', 'Dayton', 'Delaware State',
            'Drake', 'Duquesne', 'East Tennessee State', 'East Texas A&M', 'Eastern Illinois',
            'Eastern Kentucky', 'Eastern Washington', 'Elon', 'Florida A&M', 'Fordham',
            'Furman', 'Gardner-Webb', 'Georgetown', 'Grambling', 'Hampton', 'Harvard',
            'Holy Cross', 'Houston Christian', 'Howard', 'Idaho', 'Idaho State', 'Illinois State',
            'Incarnate Word', 'Indiana State', 'Jackson State', 'Lafayette', 'Lamar', 'Lehigh',
            'Lindenwood', 'Long Island', 'Maine', 'Marist', 'McNeese State', 'Mercer',
            'Merrimack', 'Mississippi Valley State', 'Monmouth', 'Montana', 'Montana State',
            'Morehead State', 'Morgan State', 'Murray State', 'New Hampshire', 'Nicholls State',
            'Norfolk State', 'North Alabama', 'North Carolina A&T', 'North Carolina Central',
            'North Dakota', 'North Dakota State', 'Northern Arizona', 'Northern Colorado',
            'Northern Iowa', 'Northwestern State', 'Penn', 'Portland State', 'Prairie View',
            'Presbyterian', 'Princeton', 'Rhode Island', 'Richmond', 'Robert Morris',
            'Sacramento State', 'Sacred Heart', 'Saint Francis', 'St. Thomas', 'Samford',
            'San Diego', 'South Carolina State', 'South Dakota', 'South Dakota State',
            'Southeast Missouri State', 'Southeastern Louisiana', 'Southern', 'Southern Illinois',
            'Southern Utah', 'Stephen F. Austin', 'Stetson', 'Stonehill', 'Stony Brook',
            'Tarleton State', 'Tennessee State', 'Tennessee Tech', 'Texas Southern',
            'Towson', 'UC Davis', 'UT Martin', 'Utah Tech', 'UT Rio Grande Valley',
            'Valparaiso', 'Villanova', 'VMI', 'Wagner', 'Weber State', 'Western Carolina',
            'Western Illinois', 'William & Mary', 'Wofford', 'Yale', 'Youngstown State'
        ]);
    }

    getTeamConference(teamName) {
        // Check if it's an FCS team first
        if (this.fcsTeams.has(teamName)) {
            return 'FCS';
        }
        
        // Check for conference affiliation
        const conference = this.teamConferences[teamName];
        if (conference) {
            return conference;
        }

        // Log unknown team and assume FCS
        console.log(`Warning: Unknown conference for team ${teamName}`);
        return 'FCS';
    }
    
    getPointsForWin(opponent, isAway, scoreDiff) {
        const opponentConference = this.getTeamConference(opponent);
        let points = 0;
        
        // Base points for win based on opponent conference
        if (this.powerConferences.includes(opponentConference)) {
            points += 12;  // Power 4 win
        } else if (this.g5Conferences.includes(opponentConference)) {
            points += 6;   // Group of 5 win
        } else if (opponentConference === 'Independent') {
            points += 6;   // Independent win (G5 points)
        } else if (opponentConference === 'G5') {
            points += 6;   // Other G5 teams (departing teams)
        } else if (opponentConference === 'FCS') {
            points += 3;   // FCS win
        } else {
            points += 3;   // Unknown team defaults to FCS points
        }
        
        // Bonus points
        if (isAway) points += 1;  // Away game bonus
        if (scoreDiff >= 50) points += 1;  // 50+ points bonus
        if (scoreDiff === Infinity) points += 1;  // Shutout bonus
        
        return points;
    }

    async fetchWeekSchedule(week) {
        try {
            const url = `${this.baseUrl}/${this.currentYear}/regular/${week}/`;
            console.log(`Fetching schedule for week ${week} from URL: ${url}`);
            
            const response = await axios.get(url, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Referer': 'https://www.cbssports.com/college-football/',
                    'Connection': 'keep-alive'
                },
                maxRedirects: 5
            });

            const $ = cheerio.load(response.data);
            const games = [];
            
            // CBS Sports specific selectors and parsing
            $('tr').each((_, row) => {
                const $cols = $(row).find('td');
                
                if ($cols.length < 3) return;
                
                try {
                    // Get teams from columns
                    const $awayTeamLink = $($cols[0]).find('a[href*="team"]');
                    const $homeTeamLink = $($cols[1]).find('a[href*="team"]');
                    
                    if (!$awayTeamLink.length || !$homeTeamLink.length) {
                        return;
                    }
                    
                    const awayTeamText = $awayTeamLink.text().trim();
                    const homeTeamText = $homeTeamLink.text().trim();
                    
                    // Extract ranks from team text (e.g., "1 Ohio State")
                    const awayRankMatch = awayTeamText.match(/^(\d+)\s+(.+)/);
                    const homeRankMatch = homeTeamText.match(/^(\d+)\s+(.+)/);
                    
                    const awayTeam = awayRankMatch ? awayRankMatch[2] : awayTeamText;
                    const homeTeam = homeRankMatch ? homeRankMatch[2] : homeTeamText;
                    const awayRank = awayRankMatch ? parseInt(awayRankMatch[1]) : null;
                    const homeRank = homeRankMatch ? parseInt(homeRankMatch[1]) : null;
                        
                    // Get score info from the score column
                    const scoreText = $($cols[2]).text().trim();
                    const scoreMatch = scoreText.match(/(\d+)[^\d]+(\d+)/);
                    const awayScore = scoreMatch ? parseInt(scoreMatch[1]) : null;
                    const homeScore = scoreMatch ? parseInt(scoreMatch[2]) : null;
                        
                    if (awayTeam && homeTeam) {
                        const game = {
                            awayTeam,
                            homeTeam,
                            awayRank,
                            homeRank,
                            awayScore,
                            homeScore,
                        };
                            
                        console.log(`Parsed game: ${game.awayTeam} ${game.awayScore !== null ? game.awayScore : ''} @ ${game.homeTeam} ${game.homeScore !== null ? game.homeScore : ''}`);
                        games.push(game);
                    }
                } catch (error) {
                    console.log('Error parsing row:', error);
                }
            });
            
            console.log(`Parsed ${games.length} games for week ${week}`);
            return games;
            
        } catch (error) {
            console.error(`Error fetching week ${week}:`, error.message);
            return [];
        }
    }

    async fetchAllWeeks() {
        const allGames = [];
        // CBS Sports typically shows weeks 1-15 for regular season
        for (let week = 1; week <= 15; week++) {
            console.log(`\nProcessing Week ${week}...`);
            const games = await this.fetchWeekSchedule(week);
            if (games.length > 0) {
                console.log(`Added ${games.length} valid games from Week ${week}`);
                allGames.push(...games);
            }
        }
        return allGames;
    }

    calculateTeamStats(games) {
        const teams = new Map();

        // Initialize teams
        games.forEach(game => {
            [game.awayTeam, game.homeTeam].forEach(teamName => {
                if (!teams.has(teamName)) {
                    teams.set(teamName, {
                        name: teamName,
                        conference: this.getTeamConference(teamName),
                        wins: 0,
                        losses: 0,
                        points: 0,
                        schedule: [],
                        awayWins: 0,
                        blowoutWins: 0,
                        shutoutWins: 0,
                        qualityWins: []
                    });
                }
            });
        });

        // Process games
        games.forEach(game => {
            if (game.awayScore === null || game.homeScore === null) return;

            const isAwayWin = game.awayScore > game.homeScore;
            const winningTeam = teams.get(isAwayWin ? game.awayTeam : game.homeTeam);
            const losingTeam = teams.get(isAwayWin ? game.homeTeam : game.awayTeam);
            const winningScore = Math.max(game.awayScore, game.homeScore);
            const losingScore = Math.min(game.awayScore, game.homeScore);
            const scoreDiff = winningScore - losingScore;

            // Update basic stats
            winningTeam.wins++;
            losingTeam.losses++;

            // Track special win conditions
            if (isAwayWin) winningTeam.awayWins++;
            if (scoreDiff >= 50) winningTeam.blowoutWins++;
            if (losingScore === 0) winningTeam.shutoutWins++;

            // Calculate points for this win
            const points = this.getPointsForWin(
                losingTeam.name,
                isAwayWin,
                scoreDiff
            );

            winningTeam.points += points;

            // Update schedules
            winningTeam.schedule.push({
                opponent: losingTeam.name,
                isAway: isAwayWin,
                score: `W ${winningScore}-${losingScore}`,
                scoreDiff: scoreDiff,
                points: points
            });

            losingTeam.schedule.push({
                opponent: winningTeam.name,
                isAway: !isAwayWin,
                score: `L ${losingScore}-${winningScore}`,
                scoreDiff: -scoreDiff,
                points: 0
            });

            // Track ranked wins
            if (isAwayWin ? game.homeRank : game.awayRank) {
                winningTeam.qualityWins.push({
                    opponent: losingTeam.name,
                    rank: isAwayWin ? game.homeRank : game.awayRank,
                    score: `${winningScore}-${losingScore}`,
                    points: points
                });
            }
        });

        return Array.from(teams.values());
    }

    async updateRankings() {
        try {
            console.log('Fetching all games...');
            const games = await this.fetchAllWeeks();
            console.log(`\nTotal games fetched: ${games.length}`);
            
            console.log('\nCalculating team statistics...');
            const teams = this.calculateTeamStats(games);
            
            // Sort teams by points (descending)
            teams.sort((a, b) => b.points - a.points);
            
            console.log('\nRankings:');
            teams.forEach((team, index) => {
                console.log(`${index + 1}. ${team.name} (${team.conference})`);
                console.log(`   Record: ${team.wins}-${team.losses}`);
                console.log(`   Points: ${team.points}`);
                if (team.awayWins > 0) console.log(`   Away Wins: ${team.awayWins}`);
                if (team.blowoutWins > 0) console.log(`   50+ Point Wins: ${team.blowoutWins}`);
                if (team.shutoutWins > 0) console.log(`   Shutouts: ${team.shutoutWins}`);
                if (team.qualityWins.length > 0) {
                    console.log('   Quality Wins:');
                    team.qualityWins.forEach(win => {
                        console.log(`     - #${win.rank} ${win.opponent} ${win.score} (${win.points} pts)`);
                    });
                }
                console.log('   Schedule:');
                team.schedule.forEach(game => {
                    console.log(`     - ${game.isAway ? '@ ' : ''}${game.opponent} ${game.score}${game.points ? ` (${game.points} pts)` : ''}`);
                });
                console.log('');
            });
            
            return teams;
        } catch (error) {
            console.error('Error updating rankings:', error.message);
            throw error;
        }
    }
}

module.exports = CBSDataFetcher;

if (require.main === module) {
    const fetcher = new CBSDataFetcher();
    fetcher.updateRankings().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}