# Alumni Spotlight - Quick Start Card

## 🎯 For Board Members

### Where People Submit:
**URL:** https://cvawvuaa.org/alumni-spotlight-submit.html

### Where You Check Submissions:
- **Email:** Submissions come to cvcwvuaa@gmail.com via Formspree
- **Subject Line:** "New Alumni Spotlight Submission"

### How to Publish (5 Simple Steps):

1. **Save the Photo**
   - Put it in: `/assets/photos/spotlight/`
   - Name it: `spotlight-firstname-lastname.jpg`

2. **Open the File**
   - File: `/content/spotlight.json`

3. **Add at the Top** (copy this template):
```json
{
  "title": "Name ('YY)",
  "meta": "Category • City, State",
  "text": "Their story in 2-3 sentences.",
  "image": "/assets/photos/spotlight/spotlight-firstname-lastname.jpg",
  "alt": "Brief photo description"
},
```

4. **Save & Push**
```bash
git add content/spotlight.json assets/photos/spotlight/
git commit -m "Add spotlight: [Name]"
git push origin main
```

5. **Wait 2-3 Minutes** - Netlify auto-deploys

### Categories to Use:
- Community Leadership
- Professional Achievement
- Service & Volunteering
- Chapter Involvement
- Entrepreneurship
- Education & Mentorship

### ⚠️ Common Mistakes:
- ❌ Forgetting the comma after the `}` bracket
- ❌ Wrong photo file path
- ❌ Not pushing the photo file to GitHub
- ❌ Adding at bottom instead of top of JSON

### 📖 Full Guide:
See `ALUMNI-SPOTLIGHT-GUIDE.md` for detailed instructions

### 🆘 Need Help?
- Check JSON syntax: https://jsonlint.com
- Contact: Tim Casten (tcasten@gmail.com)

---

**Remember:** Add new spotlights at the TOP of the array so they appear first!
