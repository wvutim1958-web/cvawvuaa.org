const CBSDataFetcher = require('./cbs-data-fetcher');
const fs = require('fs').promises;
const path = require('path');

async function main() {
    try {
        console.log('Initializing CBS Data Fetcher...');
        const fetcher = new CBSDataFetcher();
        console.log('Fetching rankings...');
        const rankings = await fetcher.updateRankings();
        
        console.log('Preparing rankings data...');
        // Save rankings to JSON file
        const rankingsData = {
            teams: rankings,
            lastUpdated: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(__dirname, 'rankings-data.json'),
            JSON.stringify(rankingsData, null, 2)
        );

        console.log('\nTop 25 Rankings:');
        rankings.forEach((team, i) => {
            console.log(`${i+1}. ${team.name} (${team.wins}-${team.losses}) - ${team.points} points`);
        });
        
        console.log('\nRankings have been saved to rankings-data.json');
    } catch (error) {
        console.error('Error running rankings:', error);
        console.error('Stack trace:', error.stack);
    }
}

main();