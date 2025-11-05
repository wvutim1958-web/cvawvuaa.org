# ClickSend SMS Setup Guide for CVCWVUAA

## Why ClickSend?

✅ **No domain email required** - Works with Gmail, Yahoo, etc.  
✅ **Free $5 credit** to start (~200 free texts!)  
✅ **Pay-as-you-go** - No monthly fees, just $0.0236 per text  
✅ **Easy setup** - No phone number needed, just username & API key  
✅ **Web dashboard** - Send texts manually or use our script  

## Step 1: Create ClickSend Account

1. Go to https://dashboard.clicksend.com/signup/
2. Sign up with **ANY email** (Gmail, Yahoo, your personal email - all work!)
3. Verify your email
4. You'll get **$5 free credit** (~200 texts!)

## Step 2: Get Your API Key

Once logged in to ClickSend Dashboard:

1. Click your **username** (top right) → **API Credentials**
2. You'll see:
   - **Username**: Your email address
   - **API Key**: Click "Show" to reveal (looks like: `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`)

**Save these!** You'll need them to send texts.

## Step 3: Add Credit (After Free $5)

1. Go to: **Account** → **Billing**
2. Click **Add Credit**
3. Minimum: $10 (gets you ~400 texts)
4. Payment methods: Credit card, PayPal, bank transfer

**No monthly fees!** Only pay for what you use.

## Step 4: Send Your First Text

### Option A: ClickSend Dashboard (Manual)

1. Go to: **SMS** → **Send SMS**
2. Enter recipient phone number
3. Type your message
4. Click **Send**

### Option B: Command Line Script (Bulk)

```bash
cd /workspaces/cvawvuaa.org
node send-sms.js
```

**What you'll need:**
- Username (your email)
- API Key (from Step 2)
- Sender Name (e.g., CVCWVUAA)
- Recipient phone numbers
- Your message

## Pricing

- **SMS (US)**: $0.0236 per message (~42 texts per $1)
- **No monthly fee** - Pay only for what you send
- **No phone number fee** - Uses your sender name

**Real-World Examples:**
- 50 members × 4 texts/month = 200 texts = **$4.72/month**
- 100 members × 4 texts/month = 400 texts = **$9.44/month**

*About 3x more than Twilio, but no signup hassles!*

## Message Templates

### Game Watch Reminder (158 chars)
```
CVCWVUAA: Game Watch TOMORROW vs Colorado at NOON! 
Kickback Jack's, Midlothian Tpk. RSVP: cvawvuaa.org/events
Reply STOP to opt out
```

### Last Minute Update (118 chars)
```
CVCWVUAA: Location change! Game watch moved to Capital Ale House. 
Same time. See you there! Reply STOP to opt out
```

### Event Reminder (121 chars)
```
CVCWVUAA: Don't forget! WVU vs Colorado TOMORROW at NOON. 
Kickback Jack's. Free pizza & wings! Reply STOP to opt out
```

## Important Notes

### Phone Number Format
- **US numbers**: +1 followed by 10 digits
- Example: `+15551234567` (NOT `555-123-4567`)

### Sender Name
- Can be your chapter name: `CVCWVUAA`
- Or your name: `Tim from WVU`
- Max 11 characters for best compatibility

### Best Practices
1. **Keep messages under 160 characters** (avoids multi-part charges)
2. **Always include sender name** in message (CVCWVUAA)
3. **Always include opt-out option** ("Reply STOP to opt out")
4. **Best times to send:**
   - Weekdays: 10am - 8pm
   - Weekends: 11am - 7pm
   - Avoid early morning or late night

### Opt-Out Handling
- ClickSend automatically handles STOP requests
- View opt-outs in Dashboard → SMS → Opt Outs
- Never text someone who opted out

## Quick Links

- **ClickSend Dashboard:** https://dashboard.clicksend.com
- **API Credentials:** https://dashboard.clicksend.com/#/account/subaccounts
- **Documentation:** https://developers.clicksend.com/docs/rest/v3/
- **Pricing:** https://www.clicksend.com/us/pricing/

## Using the Command-Line Script

### First Time Setup

No packages to install! The script uses Node's built-in HTTPS module.

### Send Messages

```bash
node send-sms.js
```

Then follow the prompts:

1. **Username**: Your ClickSend email
2. **API Key**: Your API key from dashboard
3. **Sender Name**: CVCWVUAA (or your name)
4. **Phone numbers**: One per line, press Enter twice when done
5. **Message**: Your text message
6. **Confirm**: Type `yes` to send

### Example Session

```
🏈 CVCWVUAA ClickSend SMS Sender

════════════════════════════════════════

ClickSend Username (your email): you@gmail.com
ClickSend API Key: A1B2C3D4-E5F6-7890-ABCD-EF1234567890
Sender Name (e.g., CVCWVUAA): CVCWVUAA

────────────────────────────────────────
Enter phone numbers (one per line)
Press Enter twice when done:
────────────────────────────────────────

+15551234567
+15559876543

────────────────────────────────────────
Message text: CVCWVUAA: Game Watch TOMORROW vs Colorado at NOON! Kickback Jack's. RSVP: cvawvuaa.org/events Reply STOP to opt out

════════════════════════════════════════
READY TO SEND
════════════════════════════════════════
From: CVCWVUAA
To: 2 recipient(s)
Message: "CVCWVUAA: Game Watch TOMORROW vs Colorado at NOON! Kickback Jack's. RSVP: cvawvuaa.org/events Reply STOP to opt out"
Est. Cost: $0.05
════════════════════════════════════════

Send these messages? (yes/no): yes

📤 Sending messages...

✅ +15551234567 - Sent
✅ +15559876543 - Sent

════════════════════════════════════════
RESULTS
════════════════════════════════════════
✅ Sent: 2
❌ Failed: 0
💰 Total Cost: ~$0.05
════════════════════════════════════════
```

## Troubleshooting

**"Authentication failed"**
- Check your API Key is correct
- Make sure you copied the full key (includes dashes)
- Try regenerating API key in dashboard

**"Invalid number format"**
- Use E.164 format: +1 followed by 10 digits
- Example: +15551234567 (not 555-123-4567)

**"Insufficient credit"**
- Add more credit: Dashboard → Billing → Add Credit

**"Message too long"**
- Keep under 160 characters for single SMS
- Longer messages are split and charged per segment

## Comparison: ClickSend vs Twilio

| Feature | ClickSend | Twilio |
|---------|-----------|--------|
| **Signup** | Any email ✅ | Business email required ❌ |
| **Free Credit** | $5 (~200 texts) | $15 (~1,500 texts) |
| **SMS Cost** | $0.0236/text | $0.0079/text |
| **Monthly Fee** | $0 ✅ | $1 (phone number) |
| **50 texts/month** | $1.18 | $1.40 |
| **100 texts/month** | $2.36 | $1.79 |
| **Setup Time** | 5 minutes | 15-30 minutes |

**Bottom line:** ClickSend costs slightly more per text but is WAY easier to set up!

## Ready to Send?

1. ✅ Sign up at https://dashboard.clicksend.com/signup/
2. ✅ Get your API key from dashboard
3. ✅ Run `node send-sms.js`
4. 🎉 Send your first campaign!

Let's Go Mountaineers! 💛💙
