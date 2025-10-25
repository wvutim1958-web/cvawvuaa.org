# Firebase Trigger Email Setup for Password Reset

## Overview
Using Firebase's "Trigger Email" extension to send password reset emails automatically when a reset token is created.

## Step 1: Install Firebase Extension

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **cvawvuaa-org**
3. Click **Extensions** in left sidebar
4. Click **Install Extension**
5. Search for **"Trigger Email"**
6. Click **Install** on "Trigger Email from Firestore"

## Step 2: Configure Extension

During installation, you'll be asked for these settings:

### **SMTP Connection**
Choose one of these options:

#### Option A: Gmail (Easiest - Free)
- **SMTP server**: `smtp.gmail.com`
- **SMTP port**: `587`
- **SMTP username**: Your Gmail address (e.g., `cvawvuaa@gmail.com`)
- **SMTP password**: Create an **App Password** (see below)
- **Email sender**: `CVAWVUAA <cvawvuaa@gmail.com>`

**How to create Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select app: Mail
3. Select device: Other (Custom name) → "Firebase Email"
4. Click **Generate**
5. Copy the 16-character password (no spaces)
6. Use this as SMTP password

#### Option B: Google Workspace (If you have it)
- Same as Gmail but can send 2,000 emails/day instead of 500

### **Firestore Collection Settings**
- **Email documents collection**: `mail`
- **Default FROM email**: `CVAWVUAA <cvawvuaa@gmail.com>`
- **Default Reply-To**: Same as FROM

### **Other Settings**
- **Users collection**: Leave blank (we're not using Firebase Auth users)
- **Templates collection**: `mailTemplates` (optional)

## Step 3: Update Firebase Rules

Add these rules to allow the extension to read/write the `mail` collection:

```javascript
// In Firebase Console → Firestore Database → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing rules for members, transactions, etc...
    
    // Mail collection for email extension
    match /mail/{mailId} {
      allow write: if true; // Extension needs to update delivery status
      allow read: if false; // Only extension reads this
    }
  }
}
```

## Step 4: Update JavaScript Code

The code is already prepared! When a user requests password reset, the system will:

1. Generate 6-digit code
2. Save reset token to member document
3. **Create email document in `mail` collection** ← We need to add this

Here's the code to add to `/members/index.html`:

```javascript
// After saving reset token to member document (around line 870)
await db.collection('members').doc(memberDoc.id).update({
    resetToken: resetToken,
    resetExpires: resetExpires,
    resetTokenCreated: firebase.firestore.FieldValue.serverTimestamp()
});

// ADD THIS: Create email document for Firebase Extension to send
const resetLink = `https://cvawvuaa.org/members/reset-password.html?token=${resetToken}`;

await db.collection('mail').add({
    to: email,
    from: 'CVAWVUAA <noreply@cvawvuaa.org>',
    replyTo: 'cvawvuaa@gmail.com',
    message: {
        subject: 'Reset Your CVAWVUAA Members Portal Password',
        text: `
Hello,

You requested to reset your password for the CVAWVUAA Members Portal.

Your username: ${memberData.username}
Reset code: ${resetToken}

Click here to reset your password:
${resetLink}

Or manually enter the code on the reset page:
https://cvawvuaa.org/members/reset-password.html

This code will expire in 30 minutes.

If you did not request this reset, please ignore this email.

Best regards,
CVAWVUAA Chapter
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #002855; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .code-box { background: white; border: 2px solid #EAAA00; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #002855; margin: 20px 0; }
        .button { display: inline-block; background: #002855; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password for the CVAWVUAA Members Portal.</p>
            
            <p><strong>Your username:</strong> ${memberData.username}</p>
            
            <div class="code-box">
                ${resetToken}
            </div>
            
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password Now</a>
            </p>
            
            <p>Or copy this link:<br>
            <a href="${resetLink}">${resetLink}</a></p>
            
            <p><strong>This code expires in 30 minutes.</strong></p>
            
            <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>CVAWVUAA Chapter<br>
            West Virginia University Alumni Association</p>
        </div>
    </div>
</body>
</html>
        `
    }
});
```

## Step 5: Test the System

1. Go to https://cvawvuaa.org/members/
2. Click "Forgot Username or Password?"
3. Enter a member's email address
4. Check the email inbox - should receive reset email within seconds!
5. Click the reset link or enter the code
6. Set new password
7. Login with new credentials

## Step 6: Monitor Email Delivery

In Firebase Console:
1. Go to **Firestore Database**
2. Open **mail** collection
3. Each email document shows:
   - `delivery.state`: "SUCCESS", "ERROR", "PENDING"
   - `delivery.startTime`: When sending started
   - `delivery.endTime`: When completed
   - `delivery.error`: Error message if failed

## Troubleshooting

### Email not sending?
- Check SMTP credentials are correct
- Check Gmail App Password is valid (not regular password)
- Check `mail` collection has the document
- Check document has `to`, `message.subject`, `message.text` fields

### Email going to spam?
- Add SPF record to DNS: `v=spf1 include:_spf.google.com ~all`
- Use a consistent FROM address
- Ask recipients to add cvawvuaa@gmail.com to contacts

### Hit rate limits?
- Gmail free: 500/day
- Google Workspace: 2,000/day
- Upgrade to SendGrid if needed (100/day free)

## Cost
- **Firebase Extension**: FREE
- **Gmail SMTP**: FREE (500 emails/day)
- **Cloud Functions**: FREE tier covers this usage
- **Firestore Writes**: ~2 writes per reset (well within free tier)

## Security Notes
1. Never commit SMTP password to git
2. Use Firebase Extension environment config (not in code)
3. App Password only works with extension - not exposed to client
4. Reset tokens expire in 30 minutes
5. Tokens are deleted after successful reset

## Next Steps After Installation
1. Replace the demo success message in `/members/index.html`
2. Remove the "Reset Password Now" button from modal (not needed - email has it)
3. Update success message to: "Check your email for reset instructions"
