# Mailchimp SMS Setup Guide for CVCWVUAA

## Why Mailchimp SMS is Perfect for You

✅ **Cheapest option:** $0.02 per text (10 texts = $0.20!)  
✅ **You probably already have it** if you use Mailchimp for email  
✅ **No monthly fees** - Pay only for what you send  
✅ **Same interface** as your email campaigns  
✅ **Track everything** - Delivery, clicks, replies  

---

## Step 1: Enable SMS in Mailchimp

1. **Log in to Mailchimp:** https://mailchimp.com/
2. **Click your profile icon** (top right) → **Account**
3. **Click Settings** → **Billing**
4. Look for **SMS Credits** section
5. Click **Add SMS Credits** or **Enable SMS**

**Note:** You may need to upgrade to a paid plan if you're on the Free plan. But even the cheapest plan ($13/month) includes unlimited contacts + SMS at $0.02 per text.

---

## Step 2: Add Phone Numbers to Your Audience

### Option A: Import from CSV (Easiest for multiple contacts)

1. **Export phone numbers from your site:**
   - Go to: https://cvawvuaa.org/text-notifications.html?admin=1
   - Click **"Export CSV"**
   - Open the CSV file

2. **In Mailchimp:**
   - Go to **Audience** → **All contacts**
   - Click **Add contacts** → **Import contacts**
   - Choose **CSV or tab-delimited text file**
   - Upload your CSV file

3. **Map the fields:**
   - Map "Phone" column to **Phone Number**
   - Map "Name" column to **First Name** (or merge as one field)
   - Click **Import**

4. **Review and finish:**
   - Mailchimp will validate phone numbers
   - Invalid numbers will be flagged
   - Click **Complete Import**

### Option B: Add Contacts Manually (Good for small lists)

1. **Go to:** Audience → All contacts → **Add a contact**
2. Fill in:
   - **Email:** (can use dummy email like `name@sms-only.local` if they don't have email)
   - **Phone Number:** +15551234567 (must include +1)
   - **First Name / Last Name**
3. Click **Subscribe**
4. Repeat for all 10 contacts

### Option C: Update Existing Contacts

If your members are already in Mailchimp (from email campaigns):

1. **Go to:** Audience → All contacts
2. **Find the contact** (use search)
3. Click their name → **Edit**
4. Add their **Phone Number** field
5. Click **Save**

---

## Step 3: Create SMS Campaign

1. **Go to:** Campaigns → **Create Campaign** → **SMS**

2. **Select audience:**
   - Choose your main audience
   - OR create a segment/tag for "SMS-only members"

3. **Filter by phone numbers:**
   - Mailchimp will automatically only send to contacts with phone numbers
   - You can also create a segment: "Phone Number is not blank"

4. **Compose your message:**
   ```
   CVCWVUAA: Game Watch TOMORROW vs Colorado at NOON! 
   Kickback Jack's, 10330 Midlothian Tpk. 
   Free pizza & wings! RSVP: cvawvuaa.org/events 
   Reply STOP to opt out
   ```

5. **Character count:**
   - Maximum: **160 characters** per SMS
   - Mailchimp shows count as you type
   - Messages over 160 chars are split (and cost 2x, 3x, etc.)

6. **Sender Name:**
   - Mailchimp may ask for a sender name
   - Use: **CVCWVUAA** or **WVU Alumni**
   - Max 11 characters

7. **Review:**
   - Check recipient count (should show 10)
   - Review cost estimate ($0.20 for 10 texts)
   - Preview message

8. **Send or Schedule:**
   - **Send Now** - Instant delivery
   - **Schedule** - Pick date/time (great for day-before reminders!)

---

## Step 4: Track Results

After sending:

1. **Go to:** Campaigns → View report
2. **See metrics:**
   - ✅ Delivered
   - ❌ Failed
   - 📱 Clicked links (if you include short URLs)
   - 🔕 Unsubscribed

---

## Tips for Mailchimp SMS

### Keep Messages Short
```
✅ GOOD (145 chars):
CVCWVUAA: Game watch TOMORROW vs Colorado at NOON! 
Kickback Jack's, Midlothian Tpk. 
Free food! cvawvuaa.org/events Reply STOP to opt out

❌ TOO LONG (185 chars - costs 2x):
CVCWVUAA: Game Watch TOMORROW vs Colorado Buffaloes at NOON! 
Kickback Jack's Restaurant, 10330 Midlothian Turnpike, North Chesterfield. 
Free pizza and wings for all members! 
RSVP at cvawvuaa.org/events Reply STOP to opt out
```

### Use URL Shorteners
- Mailchimp automatically shortens URLs in SMS
- `cvawvuaa.org/events` becomes `mchlnk.co/abc123` (saves characters)

### Personalize Messages
```
Hi *|FNAME|*, WVU game watch tomorrow at noon! 
Kickback Jack's. See you there! -Tim
```

### Schedule for Best Times
- **Day before event:** Send between 4-6pm
- **Day of event:** Send morning (9-11am)
- **Avoid:** Early morning (<8am) or late night (>9pm)

### Include Opt-Out
- **Required:** Always include "Reply STOP to opt out"
- Mailchimp handles STOP requests automatically

---

## Sample Messages for Different Events

### Game Watch Reminder (Day Before)
```
CVCWVUAA: Don't forget! WVU vs Colorado TOMORROW at NOON. 
Kickback Jack's, Midlothian Tpk. Free pizza & wings! 
Reply STOP to opt out
```
(142 characters)

### Last-Minute Location Change
```
CVCWVUAA ALERT: Location changed! 
Game watch now at Capital Ale House. Same time (noon). 
See you there! Reply STOP to opt out
```
(127 characters)

### General Event Reminder
```
CVCWVUAA: Chapter meeting THIS Thursday 7pm at River City Brewing. 
Light refreshments provided. cvawvuaa.org Reply STOP to opt out
```
(138 characters)

### RSVP Request
```
CVCWVUAA: Can you make Saturday's game watch? 
Reply YES or NO. Details: cvawvuaa.org/events 
-Tim Reply STOP to opt out
```
(122 characters)

---

## Pricing Examples

| Recipients | Cost per Text | Total Cost |
|-----------|---------------|------------|
| 10 people | $0.02 | **$0.20** |
| 25 people | $0.02 | **$0.50** |
| 50 people | $0.02 | **$1.00** |
| 100 people | $0.02 | **$2.00** |

**Compare to other services:**
- SimpleTexting: $29/month minimum
- Twilio: $0.0079/text BUT requires domain email + $1/month for number
- TextMagic: $0.04/text
- **Mailchimp: $0.02/text** ✅ Winner!

---

## Mailchimp Plans & SMS

| Plan | Monthly Cost | SMS Cost | Best For |
|------|-------------|----------|----------|
| **Free** | $0 | May not include SMS | Testing only |
| **Essentials** | $13/month | $0.02/text | Small chapters (500 contacts) |
| **Standard** | $20/month | $0.02/text | Growing chapters (100K contacts) |
| **Premium** | $350/month | $0.02/text | Large organizations |

**Recommendation:** If you're already using Mailchimp for emails, you're all set! If not, the Essentials plan ($13/month) gets you unlimited email + SMS.

---

## Troubleshooting

**"SMS not available in my account"**
- Check if you're on Free plan → Upgrade to Essentials ($13/month)
- Or add SMS credits: Account → Billing → Add SMS Credits

**"Phone number invalid"**
- Must use E.164 format: +15551234567
- Include country code (+1 for US)
- No spaces, dashes, or parentheses

**"Message too long"**
- Keep under 160 characters
- Use URL shorteners
- Remove extra words

**"High cost estimate"**
- Check if message is split (over 160 chars)
- Each part costs $0.02
- Example: 200 char message = 2 parts × $0.02 = $0.04 per person

---

## Quick Workflow for Game Watch Announcements

### Day Before Event:

1. **Log in to Mailchimp**
2. **Create SMS Campaign**
3. **Select your SMS audience** (or segment with phone numbers)
4. **Type message:**
   ```
   CVCWVUAA: Game watch TOMORROW vs [TEAM] at [TIME]! 
   [VENUE]. Free food! cvawvuaa.org/events 
   Reply STOP to opt out
   ```
5. **Schedule for 5pm** (day before)
6. **Done!**

**Total time:** 3 minutes  
**Total cost:** $0.20 for 10 people

---

## Resources

- **Mailchimp SMS Guide:** https://mailchimp.com/help/about-sms-campaigns/
- **Mailchimp Login:** https://mailchimp.com/
- **Your Text Sign-Ups:** https://cvawvuaa.org/text-notifications.html?admin=1
- **Export Contacts:** Use admin view to download CSV

---

## Bottom Line

For **10 texts at $0.20**, Mailchimp SMS is the absolute cheapest and easiest option!

**Next Steps:**
1. ✅ Log in to Mailchimp
2. ✅ Enable SMS (if not already enabled)
3. ✅ Import your 10 phone numbers
4. ✅ Create your first SMS campaign
5. 🎉 Send for only 20 cents!

Let's Go Mountaineers! 💛💙
