# Website Cleanup Report - Duplicate & Unused Files

**Generated:** October 10, 2025  
**Status:** Needs Review & Cleanup

---

## 📋 SUMMARY

Total files identified for potential removal: **120+ files**

### Categories:
1. **Backup HTML files** (62 .bak files in _backups - already moved ✅)
2. **Duplicate newsletters** (3 duplicate versions)
3. **Backup PowerShell scripts** (7 backup-related PS1 files)
4. **Duplicate CSV files** (8 duplicate database/payment CSVs)
5. **Duplicate images** (2 -copy.jpg files)
6. **Old letters/documents** (11 .txt documents from 2025)
7. **Admin backup files** (3 broken/original backup HTML files)
8. **Test files in content folder** (2 "New File.txt" files)
9. **Member portal duplicates** (2 duplicate member-portal files)
10. **Corrupted backup file** (1 index-corrupted-backup.html)
11. **Old newsletter HTML** (Multiple October newsletter versions)
12. **Unused utility scripts** (25+ PowerShell scripts)

---

## 🗑️ FILES TO REMOVE

### 1. DUPLICATE NEWSLETTERS (Safe to Remove)
**Keep:** The FINAL or most recent version  
**Remove:**

```
✅ RECOMMENDED FOR REMOVAL:
- CVCWVUAA-October-2025-Newsletter.html (duplicate)
- CVCWVUAA-October-2025-Newsletter-HTML.html (duplicate)
- CVCWVUAA-October-Newsletter-FINAL.html (if same as above)

KEEP ONE VERSION: The most complete/final newsletter
```

---

### 2. BACKUP HTML FILES (Safe to Remove)
**These are all in _backups folder - ALREADY CLEANED ✅**

```
_backups/ folder contains 62+ .bak files - already organized!
```

---

### 3. BACKUP POWERSHELL SCRIPTS (Can Remove)
**These are one-off utility scripts that have served their purpose:**

```
✅ RECOMMENDED FOR REMOVAL:
- basic-backup.ps1
- quick-backup.ps1  
- run-password-backup.ps1
- simple-password-backup.ps1
- restore-from-backups.ps1
- password-backup-system.ps1
- password-extractor.ps1

REASON: These were temporary backup utilities. Password backup is in password-backup/ folder.
```

---

### 4. ONE-TIME UTILITY SCRIPTS (Can Remove)
**Scripts that were used once for specific tasks:**

```
✅ RECOMMENDED FOR REMOVAL:
- add-google-analytics.ps1 (already added analytics)
- calculate-customer-totals.ps1 (one-time calculation)
- convert-chrome-csv.ps1 (one-time conversion)
- fix-encoding.ps1 (one-time fix)
- fix-utf8.ps1 (one-time fix)
- update-nav.ps1 (navigation already updated)
- update-about-dropdown.ps1 (already updated)
- update-footer-links.ps1 (already updated)
- standardize-nav.ps1 (already standardized)
- simple-google-analytics.ps1 (duplicate functionality)
- resize-facebook-cover.ps1 (one-time image resize)
- make-booklet.ps1 (one-time PDF creation)
- create-password-booklet.ps1 (duplicate of above)
- extract-passwords.ps1 (already extracted)

TOTAL: 14 utility scripts
```

---

### 5. DUPLICATE CSV FILES (Sensitive - Review Before Removing)
**Payment/Transaction CSVs:**

```
⚠️ REVIEW BEFORE REMOVAL:
- customer-payment-totals.csv
- customer-payment-totals via paypal.csv (duplicate with different name)
- customer-transactions-complete.csv
- pay pal customer-transactions-complete 10032025.csv (dated version)

RECOMMENDATION: Keep only the most recent/complete version, archive older ones
```

**Database CSV Duplicates in content/ folder:**

```
⚠️ REVIEW BEFORE REMOVAL:
- content/CVCWVUAA-Master-Database-2025-10-06.csv
- content/CVCWVUAA-Master-Database-2025-10-06 original.csv (duplicate)
- content/CVCWVUAA-Master-Database-2025-10-06 (3).csv (duplicate)
- content/CVCWVUAA-Master-Database-2025-10-06 (4).csv (duplicate)

RECOMMENDATION: Keep only the PRIMARY database file, remove numbered copies (3) and (4)
```

---

### 6. DUPLICATE IMAGES (Safe to Remove)
**Gallery images with -copy suffix:**

```
✅ RECOMMENDED FOR REMOVAL:
- assets/gallery/2025/09/472922903_617541587486012_5937835596900102062_n-copy.jpg
- assets/gallery/2025/09/82279131_2510255619097031_4820471456792051712_n-copy.jpg

REASON: Duplicate images with "-copy" suffix - originals exist
```

---

### 7. OLD CORRESPONDENCE/DOCUMENTS (Archive or Remove)
**Letters and emails from 2025:**

```
⚠️ REVIEW BEFORE REMOVAL (Consider moving to /content/ or /admin/):
- CVCWVUAA-Board-Recruitment-Letter.txt
- CVCWVUAA-Board-Transition-Letter.txt
- CVCWVUAA-Towne-Bank-Letter-WORD.txt
- CVCWVUAA-Towne-Bank-Official-Letter.html
- David-Haines-Removal-Letter-WORD.txt
- David-Haines-Removal-Notice.html
- David-Turner-Board-Recruitment-Email.txt
- Email-to-Stephanie-Hopkins-Towne-Bank.txt
- Formal-Records-Demand-Letter.txt
- Membership-Update-Letter.txt
- member-emails.txt

RECOMMENDATION: Move to /content/correspondence/ folder or remove if no longer needed
```

---

### 8. ADMIN BACKUP FILES (Can Remove)
**Old admin interface backups:**

```
✅ RECOMMENDED FOR REMOVAL:
- admin/index-broken-backup.html
- admin/index-original-backup.html
- admin/button-test.html

REASON: Old development/testing files
```

---

### 9. TEST/JUNK FILES (Safe to Remove)
**Random test files:**

```
✅ RECOMMENDED FOR REMOVAL:
- content/New File.txt (empty or junk)
- content/4New File.txt (empty or junk)
- assets/gallery/2025/09/test.txt (test file)
- temp.html (temporary file)
- resource.html.txt (incorrect extension)

REASON: Test/temporary files with no content
```

---

### 10. DUPLICATE MEMBER PORTAL FILES (Review)
**Multiple member portal versions:**

```
⚠️ REVIEW BEFORE REMOVAL:
- member-portal.html (current version)
- member-portal-file.html (alternate version?)
- member-portal-backup-2025-09-30.html (dated backup)

RECOMMENDATION: Keep member-portal.html, move backup to _backups/, determine if member-portal-file.html is needed
```

---

### 11. CORRUPTED/OLD BACKUPS (Safe to Remove)
**Broken backup files:**

```
✅ RECOMMENDED FOR REMOVAL:
- index-corrupted-backup.html

REASON: Corrupted backup file, no longer useful
```

---

### 12. DEPLOYMENT TRIGGER FILES (Keep)
**These may be used by deployment:**

```
❌ DO NOT REMOVE:
- deployment-trigger.txt
- _deploy_now.txt

REASON: May be used by deployment scripts or Netlify
```

---

### 13. SURVEY/FORM DOCUMENTS (Keep)
**Documentation files:**

```
❌ DO NOT REMOVE (KEEP):
- CVCWVUAA-Alumni-Survey-Form.md
- CVCWVUAA-Membership-Database-Template.csv
- All *-GUIDE.md files
- All *-README.md files

REASON: Active documentation
```

---

## 🎯 RECOMMENDED CLEANUP ACTIONS

### Phase 1: SAFE REMOVALS (Low Risk)
```
Move these to _backups/ or delete:
1. Duplicate newsletter HTML files (keep FINAL version)
2. Duplicate -copy.jpg images
3. Test files (New File.txt, test.txt, temp.html)
4. Corrupted backup (index-corrupted-backup.html)
5. Admin backup files (index-broken-backup.html, etc.)
6. One-time utility PowerShell scripts (14 files)
7. Backup PowerShell scripts (7 files)
```

### Phase 2: REVIEW & ARCHIVE (Medium Risk)
```
Review then move to organized folders:
1. Old correspondence letters (11 .txt files) → /content/correspondence/
2. Member portal backups → _backups/
3. Duplicate database CSVs → /content/archive/ (keep primary only)
```

### Phase 3: SENSITIVE DATA REVIEW (High Risk)
```
Carefully review before removing:
1. PayPal CSVs (keep most recent, archive older)
2. Member database duplicates (keep primary, remove numbered copies)
3. Password backup CSV (verify it's in password-backup/ folder first)
```

---

## 📊 ESTIMATED SPACE SAVINGS

**Total files to remove/archive:** ~120 files  
**Estimated space saved:** 5-10 MB  
**Primary benefit:** Cleaner project structure, easier navigation

---

## ✅ CLEANUP CHECKLIST

### Immediate (Safe):
- [ ] Remove duplicate newsletter HTML files (keep FINAL version)
- [ ] Remove duplicate -copy.jpg images (2 files)
- [ ] Remove test.txt, New File.txt, 4New File.txt
- [ ] Remove temp.html and resource.html.txt
- [ ] Remove corrupted index-corrupted-backup.html
- [ ] Remove admin/index-broken-backup.html, admin/index-original-backup.html, admin/button-test.html

### Scripts (Safe):
- [ ] Remove 14 one-time utility PowerShell scripts
- [ ] Remove 7 backup-related PowerShell scripts

### Review First (Medium Risk):
- [ ] Review and organize 11 correspondence .txt files
- [ ] Review member-portal duplicates
- [ ] Review duplicate database CSVs in /content/

### Handle Carefully (Sensitive):
- [ ] Review PayPal/transaction CSVs
- [ ] Verify password backup location before removing scripts

---

## 🚀 NEXT STEPS

1. **Review this report** - Confirm which files are safe to remove
2. **Backup first** - Run a full backup before cleanup
3. **Phase 1 cleanup** - Remove safe files first
4. **Test website** - Verify nothing broke
5. **Phase 2 cleanup** - Organize archives
6. **Commit changes** - Git commit with "Cleanup: Remove duplicate and unused files"

---

**Need help with cleanup?** Let me know which phase you want to start with!
