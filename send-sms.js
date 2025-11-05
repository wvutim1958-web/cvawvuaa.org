// Simple TextMagic SMS sender for CVCWVUAA
// Usage: node send-sms.js

const readline = require('readline');
const https = require('https');

// No package installation needed - uses Node's built-in https module!

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function sendSMS() {
    console.log('\n🏈 CVCWVUAA TextMagic SMS Sender\n');
    console.log('════════════════════════════════════════\n');
    
    // Get credentials
    const username = await question('TextMagic Username (your email): ');
    const apiKey = await question('TextMagic API Key: ');
    const fromName = await question('Sender Name (e.g., CVCWVUAA): ');
    
    if (!username || !apiKey || !fromName) {
        console.log('\n❌ All fields are required!');
        rl.close();
        return;
    }
    
    // Credentials for API
    const auth = Buffer.from(`${username.trim()}:${apiKey.trim()}`).toString('base64');
    
    // Get recipients
    console.log('\n────────────────────────────────────────');
    console.log('Enter phone numbers (one per line)');
    console.log('Press Enter twice when done:');
    console.log('────────────────────────────────────────\n');
    
    const recipients = [];
    while (true) {
        const phone = await question('');
        if (!phone.trim()) break;
        recipients.push(phone.trim());
    }
    
    if (recipients.length === 0) {
        console.log('\n❌ No recipients entered!');
        rl.close();
        return;
    }
    
    // Get message
    console.log('\n────────────────────────────────────────');
    const message = await question('Message text: ');
    
    if (!message.trim()) {
        console.log('\n❌ Message cannot be empty!');
        rl.close();
        return;
    }
    
    // Show summary
    console.log('\n════════════════════════════════════════');
    console.log('READY TO SEND');
    console.log('════════════════════════════════════════');
    console.log(`From: ${fromName}`);
    console.log(`To: ${recipients.length} recipient(s)`);
    console.log(`Message: "${message}"`);
    console.log(`Est. Cost: $${(recipients.length * 0.04).toFixed(2)}`);
    console.log('════════════════════════════════════════\n');
    
    const confirm = await question('Send these messages? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled. No messages sent.\n');
        rl.close();
        return;
    }
    
    // Send messages
    console.log('\n📤 Sending messages...\n');
    
    let sent = 0;
    let failed = 0;
    
    for (const toNumber of recipients) {
        try {
            const success = await sendTextMagicSMS(auth, toNumber, message, fromName);
            
            if (success) {
                console.log(`✅ ${toNumber} - Sent`);
                sent++;
            } else {
                console.log(`❌ ${toNumber} - Failed`);
                failed++;
            }
            
            // Wait 1 second between messages to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`❌ ${toNumber} - Failed: ${error.message}`);
            failed++;
        }
    }
    
    // Summary
    console.log('\n════════════════════════════════════════');
    console.log('RESULTS');
    console.log('════════════════════════════════════════');
    console.log(`✅ Sent: ${sent}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💰 Total Cost: ~$${(sent * 0.04).toFixed(2)}`);
    console.log('════════════════════════════════════════\n');
    
    rl.close();
}

// TextMagic API function
function sendTextMagicSMS(auth, toNumber, message, fromName) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            text: message,
            phones: toNumber,
            from: fromName
        });
        
        const options = {
            hostname: 'rest.textmagic.com',
            port: 443,
            path: '/api/v2/messages',
            method: 'POST',
            headers: {
                'X-TM-Username': auth.split(':')[0],
                'X-TM-Key': auth.split(':')[1],
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode === 201 || res.statusCode === 200) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (e) {
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(payload);
        req.end();
    });
}

// Run the script
sendSMS().catch(error => {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
});
