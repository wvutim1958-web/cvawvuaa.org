# Twilio SMS Quick Start Guide

## ✅ What's Been Set Up

You now have a complete SMS notification system for your chapter:

### 1. Text Notification Sign-Up Form
**URL:** https://cvawvuaa.org/text-notifications.html

- Members can sign up to receive text notifications
- Collects: Name, Phone, Email (optional), Carrier, Preferences
- Submissions go to your email
- Also saves locally for easy export

**Admin View:** https://cvawvuaa.org/text-notifications.html?admin=1
- View all sign-ups
- Export phone numbers as TXT, CSV, or JSON

### 2. Web-Based SMS Sender
**URL:** https://cvawvuaa.org/admin/send-sms.html

- Save your Twilio credentials (stored locally in browser)
- Load recipients from sign-ups or enter manually
- Compose messages with templates
- Preview messages before sending
- See character count and estimated costs

**Note:** This is a UI only - requires server-side script to actually send (see below)

### 3. Command-Line SMS Sender (Node.js)
**File:** `send-twilio-sms.js`

This script actually sends the texts via Twilio.

**Setup (one-time):**
```bash
cd /workspaces/cvawvuaa.org
npm install twilio
```

**Usage:**
```bash
node send-twilio-sms.js
```

Then follow the prompts to:
1. Enter your Twilio credentials
2. Enter phone numbers (one per line, press Enter twice when done)
3. Enter your message
4. Confirm and send!

## 🚀 How to Get Started with Twilio

### Step 1: Sign Up for Twilio
1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. Get **$15 free trial credit** (good for ~1,500 texts!)

### Step 2: Get Your Phone Number
1. In Twilio Console: https://console.twilio.com
2. Click "Get a Trial Number" (free) OR
3. Buy a number: Phone Numbers → Buy a Number → Search by area code
   - Cost: **$1/month**
   - Recommendation: Get a Richmond area code (804)

### Step 3: Get Your Credentials
From the Twilio Console dashboard:
- **Account SID**: Starts with "AC..." (visible on dashboard)
- **Auth Token**: Click "Show" to reveal (keep this secret!)
- **Phone Number**: Format like +15551234567

### Step 4: Send Your First Text

**Option A - Twilio Console (Easiest for Testing):**
1. Go to: Messaging → Try it out → Send an SMS
2. Select your Twilio number (From)
3. Enter recipient number (To)
4. Type message → Send

**Option B - Command Line (Best for Bulk):**
```bash
node send-twilio-sms.js
```

## 💰 Pricing

- **Phone Number:** $1/month
- **SMS (US):** $0.0079 per message (~126 texts per dollar)
- **MMS (with images):** $0.02 per message

**Real-World Examples:**
- 50 members × 4 texts/month = 200 texts = **$1.58/month** + $1 number = **$2.58/month**
- 100 members × 4 texts/month = 400 texts = **$3.16/month** + $1 number = **$4.16/month**

## 📝 Message Templates

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

## ⚠️ Important Notes

### Trial Account Limitations
- Can only text **verified numbers** during trial
- To verify a number: Phone Numbers → Verified Caller IDs → Add number
- **Solution:** Upgrade to paid account (no monthly fee, just pay-per-text)

### Best Practices
1. **Keep messages under 160 characters** (avoids multi-message charges)
2. **Always include your chapter name** (CVCWVUAA)
3. **Always include opt-out option** ("Reply STOP to opt out")
4. **Best times to send:**
   - Weekdays: 10am - 8pm
   - Weekends: 11am - 7pm
   - Avoid early morning or late night

### Legal Requirements
- Include opt-out option in every message
- Honor opt-out requests immediately
- Don't text after 9pm or before 8am local time
- Keep messages relevant to chapter activities

## 🔗 Quick Links

- **Twilio Console:** https://console.twilio.com
- **Twilio Documentation:** https://www.twilio.com/docs/sms
- **Text Sign-Up Form:** https://cvawvuaa.org/text-notifications.html
- **Admin Sign-Ups:** https://cvawvuaa.org/text-notifications.html?admin=1
- **SMS Sender UI:** https://cvawvuaa.org/admin/send-sms.html
- **Setup Guide:** `/admin/TWILIO-SETUP-GUIDE.md`

## 🎯 Typical Workflow

### Before Game Watch
1. Members sign up at https://cvawvuaa.org/text-notifications.html
2. You collect phone numbers over time

### Day Before Event
1. Export phone list from admin page
2. Run `node send-twilio-sms.js`
3. Enter credentials (only first time, then saved)
4. Paste phone numbers
5. Enter reminder message
6. Confirm and send!

### Results
- Each member gets individual text (no one sees other numbers)
- Takes ~1 second per text (50 people = ~1 minute total)
- Instant delivery
- Members can reply STOP to opt out

## ❓ Troubleshooting

**"Can't send to this number"**
- Trial account: Number must be verified
- Solution: Verify number OR upgrade to paid account

**"Invalid phone number format"**
- Use E.164 format: +1 followed by 10 digits
- Example: +15551234567 (not 555-123-4567)

**"Authentication failed"**
- Check Account SID and Auth Token
- Make sure Auth Token hasn't been regenerated

**Need help?**
- Twilio support is excellent for trial/paid accounts
- Check https://www.twilio.com/docs/sms/quickstart

---

**Ready to send your first campaign?**
1. Sign up for Twilio
2. Get your phone number
3. Run `node send-twilio-sms.js`
4. Send a test to yourself first!

Let's Go Mountaineers! 💛💙
