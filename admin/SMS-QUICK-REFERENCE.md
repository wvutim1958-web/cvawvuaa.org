# TextMagic Quick Reference Card

## 🚀 Send SMS in 3 Steps

### 1️⃣ Sign Up (One-time, 5 minutes)

- Go to: https://www.textmagic.com/free-trial/
- Sign up with **ANY email** (Gmail works!)
- Get **free trial credit**

### 2️⃣ Get API Key (One-time)

- Dashboard → Settings → **API & Webhooks** → Generate new API key
- Save: **Username** and **API Key**

### 3️⃣ Send Messages

```bash
node send-sms.js
```

## 💰 Pricing

- **$0.04 per text** (25 texts per $1)
- **No monthly fees**
- **No phone number fees**
- **No registration required**

**Examples:**
- 50 members × 1 text = **$2.00**
- 100 members × 1 text = **$4.00**

## 📱 Quick Send Template

```
CVCWVUAA: Game Watch TOMORROW vs [TEAM] at [TIME]! 
[VENUE]. RSVP: cvawvuaa.org/events
Reply STOP to opt out
```

## 🔗 Links

- **Sign Up:** https://www.textmagic.com/free-trial/
- **Dashboard:** https://my.textmagic.com
- **Add Credit:** Dashboard → Buy Credits
- **Setup Guide:** `/admin/TEXTMAGIC-SETUP-GUIDE.md`
- **Web Interface:** https://cvawvuaa.org/admin/send-sms.html

## ⚡ Command Reference

**Send bulk SMS:**
```bash
node send-sms.js
```

**What you'll need:**

1. Username (from dashboard)
2. API Key (from Settings → API & Webhooks)
3. Sender name (CVCWVUAA)
4. Phone numbers (+15551234567 format)
5. Message (keep under 160 chars)

## ✅ Pre-Flight Checklist

Before sending:
- [ ] Phone numbers in +15551234567 format
- [ ] Message under 160 characters
- [ ] Sender name set (CVCWVUAA)
- [ ] Include "Reply STOP to opt out"
- [ ] Sending between 10am-8pm
- [ ] Enough credit in account

## 🆘 Troubleshooting

**Problem:** "Authentication failed"  
**Fix:** Regenerate API key in dashboard

**Problem:** "Invalid number"  
**Fix:** Use +1 format: +15551234567

**Problem:** "Insufficient credit"  
**Fix:** Add credit: Dashboard → Buy Credits

**Problem:** Message split into multiple texts  
**Fix:** Keep under 160 characters

---

**Need help?** Read full guide: `/admin/TEXTMAGIC-SETUP-GUIDE.md`
