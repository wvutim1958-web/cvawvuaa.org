# ClickSend Quick Reference Card

## 🚀 Send SMS in 3 Steps

### 1️⃣ Sign Up (One-time, 5 minutes)
- Go to: https://dashboard.clicksend.com/signup/
- Sign up with **ANY email** (Gmail works!)
- Get **$5 free credit** (~200 texts)

### 2️⃣ Get API Key (One-time)
- Dashboard → Click your name → **API Credentials**
- Save: **Username** (your email) and **API Key**

### 3️⃣ Send Messages
```bash
node send-sms.js
```

## 💰 Pricing
- **$0.0236 per text** (~42 texts per $1)
- **No monthly fees**
- **No phone number fees**

**Examples:**
- 50 members × 1 text = **$1.18**
- 100 members × 1 text = **$2.36**

## 📱 Quick Send Template

```
CVCWVUAA: Game Watch TOMORROW vs [TEAM] at [TIME]! 
[VENUE]. RSVP: cvawvuaa.org/events
Reply STOP to opt out
```

## 🔗 Links
- **Dashboard:** https://dashboard.clicksend.com
- **Add Credit:** Dashboard → Billing → Add Credit
- **Setup Guide:** `/admin/CLICKSEND-SETUP-GUIDE.md`
- **Web Interface:** https://cvawvuaa.org/admin/send-sms.html

## ⚡ Command Reference

**Send bulk SMS:**
```bash
node send-sms.js
```

**What you'll need:**
1. Username (your email)
2. API Key (from dashboard)
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
**Fix:** Add credit: Dashboard → Billing

**Problem:** Message split into multiple texts  
**Fix:** Keep under 160 characters

---

**Need help?** Read full guide: `/admin/CLICKSEND-SETUP-GUIDE.md`
