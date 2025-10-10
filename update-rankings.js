const ESPNDataFetcher = require('./espn-data-fetcher');
const fs = require('fs').promises;
const path = require('path');

async function updateRankingsFile() {
    try {
        const fetcher = new ESPNDataFetcher();
        const rankings = await fetcher.updateRankings();
        
        const data = {
            lastUpdated: new Date().toISOString(),
            teams: rankings
        };

        await fs.writeFile(
            path.join(__dirname, 'rankings-data.json'),
            JSON.stringify(data, null, 2)
        );

        console.log('Rankings updated successfully');
    } catch (error) {
        console.error('Error updating rankings:', error);
    }
}

// Update rankings immediately
updateRankingsFile();

// Then update every hour
setInterval(updateRankingsFile, 60 * 60 * 1000);