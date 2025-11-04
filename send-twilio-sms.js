// Simple Twilio SMS sender for CVCWVUAA
// Usage: node send-twilio-sms.js

const readline = require('readline');

// Check if twilio package is installed
let twilio;
try {
    twilio = require('twilio');
} catch (e) {
    console.log('\n❌ Twilio package not installed!');
    console.log('\nRun this command first:');
    console.log('  npm install twilio');
    console.log('\nThen run this script again.\n');
    process.exit(1);
}

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
    console.log('\n🏈 CVCWVUAA Twilio SMS Sender\n');
    console.log('════════════════════════════════════════\n');
    
    // Get credentials
    const accountSid = await question('Twilio Account SID: ');
    const authToken = await question('Twilio Auth Token: ');
    const fromNumber = await question('Your Twilio Phone Number (e.g., +15551234567): ');
    
    if (!accountSid || !authToken || !fromNumber) {
        console.log('\n❌ All fields are required!');
        rl.close();
        return;
    }
    
    // Initialize Twilio client
    const client = twilio(accountSid.trim(), authToken.trim());
    
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
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${recipients.length} recipient(s)`);
    console.log(`Message: "${message}"`);
    console.log(`Est. Cost: $${(recipients.length * 0.0079).toFixed(2)}`);
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
            const result = await client.messages.create({
                body: message,
                from: fromNumber,
                to: toNumber
            });
            
            console.log(`✅ ${toNumber} - Sent (SID: ${result.sid})`);
            sent++;
            
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
    console.log(`💰 Total Cost: ~$${(sent * 0.0079).toFixed(2)}`);
    console.log('════════════════════════════════════════\n');
    
    rl.close();
}

// Run the script
sendSMS().catch(error => {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
});
