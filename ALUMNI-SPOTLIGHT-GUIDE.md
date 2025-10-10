# Alumni Spotlight Content Pipeline Guide

**Last Updated:** October 10, 2025

---

## 📋 Overview

The Alumni Spotlight feature celebrates outstanding WVU alumni in Central Virginia through short profiles highlighting their achievements, community involvement, and Mountaineer spirit.

---

## 🎯 Purpose

- Recognize alumni making a difference in the community
- Showcase diverse career paths and achievements
- Encourage chapter engagement and pride
- Provide role models for current students and recent graduates
- Build stronger connections within the alumni network

---

## 📝 Content Pipeline

### 1. **Submission** (Public-Facing)

**URL:** `/alumni-spotlight-submit.html`

**How It Works:**
- Anyone can nominate an alumnus (including self-nominations)
- Form collects: alumnus name, graduation year, location, category, story, contact info, photo
- Submissions go to your email via Formspree (free for 50 submissions/month)

**Setup Required:**
1. Create a free Formspree account at https://formspree.io
2. Create a new form
3. Copy your form ID (looks like `xyzabc123`)
4. Update line 98 in `alumni-spotlight-submit.html`:
   ```html
   <form id="spotlightForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
   Replace `YOUR_FORM_ID` with your actual Formspree ID

---

### 2. **Review & Approval** (Board/Admin)

**Process:**
1. Receive submission notification email from Formspree
2. Review the nomination:
   - Is the story compelling?
   - Does it reflect WVU values?
   - Is the information accurate?
3. Contact the alumnus (if not self-submitted) to:
   - Get their permission
   - Request a professional photo
   - Gather additional quotes/details
4. Edit for clarity and length (2-3 sentences ideal)

**Approval Criteria:**
✅ Current or recent chapter member preferred  
✅ Demonstrates leadership, service, or achievement  
✅ Story is specific and inspiring  
✅ Photo available (high-quality, professional preferred)  
❌ Reject if inappropriate, unverifiable, or too vague  

---

### 3. **Publishing** (Manual Process)

**Steps to Add an Approved Spotlight:**

1. **Prepare the Photo:**
   - Save photo to `/assets/photos/spotlight/`
   - Name it clearly: `spotlight-firstname-lastname.jpg`
   - Optimize file size (under 200KB if possible)
   - Recommended size: 800x600px

2. **Edit the JSON File:**
   - Open `/content/spotlight.json`
   - Add new entry at the **top** of the array (most recent first)
   
   **Template:**
   ```json
   {
     "title": "FirstName LastName ('YY)",
     "meta": "Category • City, State",
     "text": "2-3 sentence story highlighting their achievement/contribution.",
     "image": "/assets/photos/spotlight/spotlight-firstname-lastname.jpg",
     "alt": "Brief description of photo"
   }
   ```

   **Example:**
   ```json
   {
     "title": "Sarah Johnson ('18)",
     "meta": "Community Leadership • Richmond, VA",
     "text": "Sarah founded the Richmond Young Alumni Network, connecting 50+ recent grads through monthly career workshops and social events. Her initiative has helped place 12 alumni in new jobs and raised $3,000 for the chapter scholarship fund.",
     "image": "/assets/photos/spotlight/spotlight-sarah-johnson.jpg",
     "alt": "Sarah Johnson at networking event"
   }
   ```

3. **Save and Deploy:**
   - Save `spotlight.json`
   - Commit to Git: `git add content/spotlight.json assets/photos/spotlight/`
   - Push to GitHub: `git push origin main`
   - Netlify will auto-deploy in 2-3 minutes

---

## 📊 Content Guidelines

### Story Writing Tips:
- **Be Specific:** Use numbers, names, concrete achievements
  - ❌ "Helps the community a lot"
  - ✅ "Organized 5 food drives collecting 500+ meals for local families"

- **Lead with Impact:** Start with the most impressive part
  - ❌ "John graduated in 2010. He works in healthcare and volunteers."
  - ✅ "John leads the free clinic that has served 1,000+ uninsured patients in Richmond"

- **Show Mountaineer Spirit:** Connect to WVU values
  - Include phrases like "giving back," "building community," "Mountaineer pride"

- **Keep It Concise:** 2-3 sentences, max 500 characters
  - Focus on 1-2 key achievements
  - Save longer stories for full newsletter features

### Photo Requirements:
- **Professional quality preferred** (headshot, action shot at event)
- Minimum 400px wide
- Clear, well-lit, in focus
- Alumnus must give permission to use
- If no photo available, use placeholder or WVU-themed graphic

---

## 🗓️ Publication Schedule

**Recommended Frequency:** 1-2 spotlights per month

**Best Times to Publish:**
- Start of month (include in newsletter)
- Before major events (spotlight event organizers/volunteers)
- Homecoming season (highlight legacy alumni)
- Graduation time (inspire recent grads with recent alumni success stories)

**Annual Spotlight Ideas:**
- January: New Year, New Goals (alumni in fitness, wellness, personal development)
- February: Black History Month (celebrate diverse alumni)
- March: Women's History Month
- April: Community Service Month
- May: Graduating seniors → recent alumni success stories
- September: Back to School (educators, mentors)
- November: Thanksgiving (gratitude, service)
- December: Year in Review (top alumni achievements)

---

## 📁 File Structure

```
/alumni-spotlight.html              # Public spotlight gallery page
/alumni-spotlight-submit.html       # Submission form
/content/spotlight.json            # Spotlight data (YOU EDIT THIS)
/assets/photos/spotlight/          # Spotlight photos folder
ALUMNI-SPOTLIGHT-GUIDE.md          # This guide
```

---

## 🔗 Promotion Strategy

### Where to Share New Spotlights:

1. **Email Newsletter** - Featured section
2. **Social Media:**
   - Facebook: Tag the alumnus, use photo
   - Instagram: Post to feed and stories
   - Hashtags: #WVU #MountaineerNation #AlumniSpotlight #CVCWVUAASpotlight
3. **Chapter Meetings** - Announce new spotlights
4. **Homepage** - Add a "Latest Spotlight" section (optional enhancement)

### Sample Social Post:
```
🌟 Alumni Spotlight: [Name] ('YY)

[Brief excerpt from their story]

Read more about [Name]'s incredible work in [area] at cvawvuaa.org/alumni-spotlight.html

#WVU #MountaineerNation #AlumniSpotlight #LetsGoMountaineers
```

---

## ✅ Quality Checklist

Before publishing, verify:

- [ ] Alumnus name spelled correctly
- [ ] Graduation year accurate
- [ ] Story is 2-3 sentences, under 500 characters
- [ ] Category chosen from approved list
- [ ] Photo is high quality and properly sized
- [ ] Photo file saved to `/assets/photos/spotlight/`
- [ ] JSON syntax is valid (use JSONLint.com to check)
- [ ] Spotlight added to TOP of spotlight.json array
- [ ] Changes committed and pushed to GitHub
- [ ] Site deployed successfully on Netlify
- [ ] Spotlight appears correctly on live site

---

## 🎓 Categories

Use these standard categories for consistency:

- **Community Leadership** - Organizing community initiatives, nonprofit work
- **Professional Achievement** - Career milestones, promotions, awards
- **Service & Volunteering** - Charitable work, volunteer leadership
- **Chapter Involvement** - Active participation in CVCWVUAA events/programs
- **Entrepreneurship** - Started a business, innovation
- **Education & Mentorship** - Teaching, coaching, mentoring others
- **Other** - Unique achievements that don't fit above

---

## 📧 Email Templates

### Template 1: Request Permission (Non-Self Nominations)

**Subject:** You've Been Nominated for CVCWVUAA Alumni Spotlight! 🌟

Hi [Name],

Great news! A fellow Mountaineer nominated you for our Alumni Spotlight feature on cvawvuaa.org.

Here's what they said about you:
"[Insert nomination text]"

We'd love to feature you! This would include:
- A brief (2-3 sentence) profile highlighting your achievement
- Your name, graduation year, and current location
- A professional photo of you

Would you be interested? If so, please send us:
1. A high-resolution photo (headshot or action shot)
2. Confirmation that the details above are accurate
3. Any additional context you'd like to share

Let's Go Mountaineers!

[Your Name]
CVCWVUAA Communications
cvcwvuaa@gmail.com

---

### Template 2: Thank You After Publication

**Subject:** You're Featured! CVCWVUAA Alumni Spotlight

Hi [Name],

Your Alumni Spotlight is now live on our website! 🎉

Check it out: https://cvawvuaa.org/alumni-spotlight.html

We'll be sharing your spotlight on our social media channels over the next few days. Feel free to share the page with your network!

Thank you for being an outstanding Mountaineer and an inspiration to our alumni community.

Let's Go Mountaineers!

[Your Name]
CVCWVUAA

---

## 🚀 Enhancement Ideas (Future)

- **Spotlight Archive:** Filter by year, category, or location
- **Search Function:** Find alumni by name or keyword
- **Video Spotlights:** Short 60-second video interviews
- **Alumni Spotlight of the Year:** Annual vote/award
- **Auto-Post to Social:** Use Zapier to auto-post when JSON updates
- **Nomination Incentive:** Enter nominators into quarterly raffle
- **LinkedIn Integration:** Auto-tag featured alumni

---

## 🆘 Troubleshooting

### "Spotlight not appearing on site"
- Check JSON syntax at JSONLint.com
- Verify photo path is correct (`/assets/photos/spotlight/filename.jpg`)
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check Netlify deploy logs for errors

### "Form submissions not arriving"
- Verify Formspree form ID is correct
- Check spam folder
- Confirm Formspree account is active (free tier: 50 submissions/month)

### "Photo not displaying"
- Verify photo file exists in `/assets/photos/spotlight/`
- Check filename matches exactly (case-sensitive)
- Ensure photo file was committed and pushed to GitHub
- Try different image format (JPG vs PNG)

---

## 📞 Questions?

Contact the CVCWVUAA Web Committee or reference this guide when training new board members.

**Let's Go Mountaineers!** 🏔️💛💙
