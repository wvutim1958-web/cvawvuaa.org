# TextMagic SMS Setup Guide for CVCWVUAA

## Why TextMagic?

✅ **No domain email required** - Works with Gmail, Yahoo, etc.  
✅ **No sender ID registration** - Start sending immediately!  
✅ **Pay-as-you-go** - No monthly fees, just $0.04 per text  
✅ **Simple setup** - 5 minutes from signup to first text  
✅ **No phone number needed** - Use your sender name  

## Step 1: Create TextMagic Account

1. Go to https://www.textmagic.com/free-trial/
2. Sign up with **ANY email** (Gmail, Yahoo, your personal email - all work!)
3. Verify your email
4. You'll get **FREE trial credit** to test!

## Step 2: Get Your API Key

Once logged in to TextMagic Dashboard:

1. Click **Settings** (gear icon, top right)
2. Click **API & Webhooks** in left menu
3. Click **Generate new API key**
4. You'll see:
   - **Username**: Your TextMagic username
   - **API Key**: Long string like `abc123def456ghi789`

**Save these!** You'll need them to send texts.

## Step 3: Add Credit

1. Go to: **Buy Credits** (top menu)
2. Choose amount:
   - $10 = 250 texts
   - $20 = 500 texts
   - $50 = 1,250 texts
3. Payment: Credit card or PayPal

**No monthly fees!** Only pay for what you use.

## Step 4: Send Your First Text

### Using the Command Line Script

```bash
cd /workspaces/cvawvuaa.org
node send-sms.js
```

**What you'll need:**
- Username (from Step 2)
- API Key (from Step 2)
- Sender Name (e.g., CVCWVUAA)
- Recipient phone numbers
- Your message

### Example Session

```
🏈 CVCWVUAA TextMagic SMS Sender

════════════════════════════════════════

TextMagic Username (your email): your-username
TextMagic API Key: abc123def456ghi789
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
Est. Cost: $0.08
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
💰 Total Cost: ~$0.08
════════════════════════════════════════
```

## Pricing

- **SMS (US)**: $0.04 per message (25 texts per $1)
- **No monthly fee** - Pay only for what you send
- **No phone number fee** - Uses your sender name
- **No setup fees** - No registration required

**Real-World Examples:**
- 50 members × 4 texts/month = 200 texts = **$8/month**
- 100 members × 4 texts/month = 400 texts = **$16/month**

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
- Or your name: `Tim WVU`
- Max 11 alphanumeric characters

### Best Practices
1. **Keep messages under 160 characters** (avoids multi-part charges)
2. **Always include sender name** in message (CVCWVUAA)
3. **Always include opt-out option** ("Reply STOP to opt out")
4. **Best times to send:**
   - Weekdays: 10am - 8pm
   - Weekends: 11am - 7pm
   - Avoid early morning or late night

### Opt-Out Handling
- TextMagic automatically handles STOP requests
- View opt-outs in Dashboard → Opt-outs
- Never text someone who opted out

## Quick Links

- **Sign Up:** https://www.textmagic.com/free-trial/
- **Dashboard:** https://my.textmagic.com
- **API Settings:** https://my.textmagic.com/online/api/rest-api/keys
- **Buy Credits:** https://my.textmagic.com/online/profile/billing/buy-credits
- **Documentation:** https://www.textmagic.com/docs/api/

## Troubleshooting

**"Authentication failed"**
- Check your API Key is correct
- Make sure you copied the full key
- Try regenerating API key in dashboard

**"Invalid number format"**
- Use E.164 format: +1 followed by 10 digits
- Example: +15551234567 (not 555-123-4567)

**"Insufficient credit"**
- Add more credit: Dashboard → Buy Credits

**"Message too long"**
- Keep under 160 characters for single SMS
- Longer messages are split and charged per segment

## Comparison: TextMagic vs Others

| Feature | TextMagic | ClickSend | Twilio |
|---------|-----------|-----------|--------|
| **Signup** | Any email ✅ | Any email ✅ | Business email ❌ |
| **US Registration** | Not required ✅ | Required ❌ | Not required ✅ |
| **Free Credit** | Trial credit | $5 (~200 texts) | $15 (~1,500 texts) |
| **SMS Cost** | $0.04/text | $0.024/text | $0.0079/text |
| **Monthly Fee** | $0 ✅ | $0 ✅ | $1 (phone) |
| **Setup Time** | 5 minutes ✅ | 1-2 days (registration) | 15-30 minutes |
| **100 texts/month** | $4.00 | $2.36 | $1.79 |

**Bottom line:** TextMagic is the easiest to set up with no registration hassles. Costs a bit more, but worth it for the simplicity!

## Ready to Send?

1. ✅ Sign up at https://www.textmagic.com/free-trial/
2. ✅ Get your API key from Settings → API & Webhooks
3. ✅ Add credit ($10-$20 to start)
4. ✅ Run `node send-sms.js`
5. 🎉 Send your first campaign!

Let's Go Mountaineers! 💛💙
