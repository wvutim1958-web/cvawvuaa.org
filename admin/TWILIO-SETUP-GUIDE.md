# Twilio SMS Setup Guide for CVCWVUAA

## Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. You'll get **$15 free trial credit** (enough for ~1,500 texts!)

## Step 2: Get Your Credentials

Once logged in to Twilio Console (https://console.twilio.com):

1. **Account SID**: Find on dashboard (looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
2. **Auth Token**: Click "Show" next to Auth Token on dashboard
3. **Phone Number**: 
   - Click "Get a Trial Number" (free during trial)
   - Or buy a number: Phone Numbers → Buy a Number → Search by area code
   - Cost: $1/month for a number

**Save these securely!** You'll need them to send texts.

## Step 3: Set Up Verified Numbers (Trial Account)

⚠️ **Trial accounts can only text verified numbers**. To verify:

1. Go to: Phone Numbers → Verified Caller IDs
2. Click "Add a new number" (red plus button)
3. Enter phone number → Twilio sends verification code
4. Enter code to verify

**To text ANYONE** (not just verified numbers): Upgrade to paid account
- No monthly fee, just pay per text (~$0.0079 per SMS)
- Add $20 to start (lasts a long time!)

## Step 4: Send Your First Text

### Option A: Twilio Console (Manual)

1. Go to: Messaging → Try it out → Send an SMS
2. Select your Twilio number (From)
3. Enter recipient number (To)
4. Type message
5. Click Send

### Option B: Use Our Web Tool (Next Step)

I'll create a simple web interface you can use to send texts to your member list!

## Pricing

- **Phone Number**: $1/month
- **SMS (US)**: $0.0079 per message (~126 texts per $1)
- **MMS (with images)**: $0.02 per message

**Example costs:**
- 50 members × 4 messages/month = 200 texts = ~$1.58/month
- 100 members × 4 messages/month = 400 texts = ~$3.16/month

## Tips

1. **Keep messages under 160 characters** to avoid multi-part charges
2. **Include your chapter name** so people know who's texting
3. **Always provide opt-out option**: "Reply STOP to unsubscribe"
4. **Best times to send**: 
   - Weekdays: 10am-8pm
   - Weekends: 11am-7pm
   - Avoid early morning or late night

## Sample Messages

### Game Watch Reminder
```
CVCWVUAA: Game Watch TOMORROW vs Colorado at NOON! 
Kickback Jack's, Midlothian Tpk. RSVP: cvawvuaa.org/events
Reply STOP to opt out
```
(158 characters)

### Last Minute Update
```
CVCWVUAA: Location change! Game watch moved to Capital Ale House. 
Same time. See you there! Reply STOP to opt out
```
(118 characters)

### Event Reminder
```
CVCWVUAA: Don't forget! WVU vs Colorado TOMORROW at NOON. 
Kickback Jack's. Free pizza & wings! Reply STOP to opt out
```
(121 characters)

## Next Steps

1. ✅ Sign up for Twilio
2. ✅ Get your phone number
3. ✅ Save your Account SID and Auth Token
4. 📱 Use the web tool I'm creating to send bulk texts!

---

**Questions?** Check Twilio docs: https://www.twilio.com/docs/sms/quickstart
