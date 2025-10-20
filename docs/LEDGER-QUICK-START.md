# Financial Ledger - Quick Start Guide

**Get started with your new accounting system in 2 minutes!**

---

## 🚀 Access the Ledger

**Option 1: From Admin Hub**
1. Go to: https://cvawvuaa.org/admin/index.html
2. Login with password: `T58C62`
3. Find "💰 Financial Management" section
4. Click "💵 Financial Ledger"

**Option 2: Direct Link**
- https://cvawvuaa.org/admin/financial-ledger.html

---

## 💵 Add a Simple Deposit

1. Click **"💵 Add Deposit"** button
2. Fill in:
   - **Date:** Today (default)
   - **Amount:** 25.00
   - **Description:** Member Dues - John Smith
   - **Category:** Member Dues
3. Click **"Save Transaction"**
4. Watch balance update! ✅

---

## 📊 Add a Split Transaction (Your Requested Feature!)

**Example: You deposit 4 checks totaling $100**

1. Click **"💵 Add Deposit"** button
2. Fill in:
   - **Date:** Today
   - **Amount:** 100.00
   - **Description:** Bank Deposit - 4 membership checks
   - **Category:** Split Transaction
3. ☑️ **Check "Split this transaction"** box
4. Click **"+ Add Split Line"** for each person:

   **Split 1:**
   - Member: Tim Casten
   - Category: Member Dues
   - Amount: 25.00

   **Split 2:**
   - Member: Joe Smith
   - Category: Chapter Donations
   - Amount: 25.00

   **Split 3:**
   - Member: Sally Ride
   - Category: Scholarship Donations
   - Amount: 50.00

5. Verify total shows **$100.00 ✅**
6. Click **"Save Transaction"**

---

## 📤 Add an Expense

1. Click **"📤 Add Expense"** button
2. Fill in:
   - **Date:** Today
   - **Amount:** 245.00
   - **Description:** Game Watch Event - Pizza & Drinks
   - **Category:** Event Costs
3. Click **"Save Transaction"**
4. Watch balance decrease

---

## 👀 View Split Details

- Look for transactions with **📊 3 splits** indicator
- Click the **📊** icon
- See complete breakdown by member and category

---

## 🔧 Current Limitations (Demo Mode)

⚠️ **Data resets when you refresh the page**

**Why?** Firebase not configured yet (takes 15 min)

**To Fix:** Follow `docs/FIREBASE-SETUP-GUIDE.md`

Once configured:
- ✅ Data persists forever
- ✅ Works across multiple devices
- ✅ Real-time sync
- ✅ Automatic backups

---

## 💡 Tips

**Balance Display:**
- 🟢 Green = Healthy balance ($1000+)
- 🟡 Yellow = Low balance ($0-$999)
- 🔴 Red = Negative balance

**Categories:**
- Use consistent categories for better reporting
- "Other Income/Expense" for one-off items

**Descriptions:**
- Be specific: "Member Dues - John Smith" not just "Dues"
- Include check numbers: "Check #1234 - Scholarship"

**Split Transactions:**
- Must equal total amount (system validates)
- Can have unlimited split lines
- Great for batch deposits

---

## 📊 What You Can Track

**Income Sources:**
- Member Dues
- Chapter Donations
- Scholarship Donations
- Event Revenue
- Merchandise Sales
- Interest Income

**Expense Types:**
- Scholarships Awarded
- Event Costs
- Operating Expenses
- Marketing/Printing
- Website Hosting
- Communications
- Bank Fees

---

## 🆘 Troubleshooting

**Balance not updating?**
- Check transaction saved (green notification)
- Refresh page
- Check browser console (F12) for errors

**Split total not matching?**
- System prevents saving if totals don't match
- Look for red ⚠️ indicator
- Add/adjust split amounts

**Changes not persisting?**
- Demo mode active (Firebase not configured)
- Follow FIREBASE-SETUP-GUIDE.md to fix

---

## 🎯 Next Steps

**Immediate:**
- ✅ Test adding deposits
- ✅ Test split transactions
- ✅ Test adding expenses
- ✅ Verify balance calculations

**Optional (15 min):**
- 📖 Read: FIREBASE-SETUP-GUIDE.md
- 🔧 Configure Firebase
- ✅ Enable data persistence

**Future Features:**
- 📊 Reporting (category breakdowns, date ranges)
- 👥 Member database integration
- 🧾 Automatic receipt generation
- 📧 Email notifications
- 💰 Budget tracking

---

## 📞 Need Help?

**Documentation:**
- Full Setup: `docs/FIREBASE-SETUP-GUIDE.md`
- This Guide: `docs/LEDGER-QUICK-START.md`

**Common Questions:**

**Q: Is my data secure?**
A: Currently admin-password protected. Firebase adds enterprise security.

**Q: Can multiple people use it?**
A: Yes, once Firebase is configured. Real-time sync included!

**Q: What does it cost?**
A: Free! Firebase free tier supports 150 members easily.

**Q: Can I export data?**
A: CSV export coming in Phase 2 (reporting features).

---

**🎉 You're ready! Go deposit that $100 check and split it by member!** 💰

Access now: https://cvawvuaa.org/admin/financial-ledger.html
