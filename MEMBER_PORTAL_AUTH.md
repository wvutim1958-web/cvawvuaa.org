# Member Portal Authentication System

## Overview
The member portal now supports **two authentication methods** with an optional username/password setup for easier future access.

## Authentication Methods

### Method 1: Traditional (Last Name + Street Number)
- **Format**: `lastname + streetnumber` (e.g., `casten4701`)
- **Example**: If your name is Tim Casten at 4701 Stoney Creek Parkway, enter: `casten4701`
- **Requirements**: All lowercase, no spaces or special characters
- **Password**: Not required

### Method 2: Username + Password
- **Format**: Custom username + password
- **Requirements**: 
  - Username: At least 4 characters, letters/numbers/underscore only
  - Password: At least 6 characters
- **Setup**: Created after first login (optional)

## First-Time Login Flow

1. **Member logs in** using lastname+streetnumber
2. **System verifies**:
   - Member exists in database
   - Member status is "active"
3. **If no username exists**, system prompts:
   - "Setup Your Login Credentials" modal appears
   - Member can create username/password
   - **OR** click "Skip for Now" to continue without setup
4. **Portal opens** with member information

## Credential Setup Modal

### Fields
- **Username**: 4+ characters, alphanumeric and underscore only
- **Password**: 6+ characters minimum
- **Confirm Password**: Must match password

### Validation
- ✅ Passwords must match
- ✅ Username uniqueness checked against database
- ✅ Format requirements enforced
- ❌ Error messages displayed for invalid input

### Actions
- **Create Credentials**: Saves username/password to Firebase
- **Skip for Now**: Continue to portal without creating credentials

## Future Login Options

### With Username/Password
1. Enter username in login field
2. Password field appears automatically
3. Enter password
4. Click "Access Member Portal"

### Without Username (Traditional)
1. Enter lastname+streetnumber
2. Password field remains hidden
3. Click "Access Member Portal"

## Technical Implementation

### Firebase Storage
Credentials stored in `members` collection:
```javascript
{
  username: "string",
  password: "string", // NOTE: Should be hashed in production
  credentialsCreated: timestamp
}
```

### Dynamic Form Behavior
- Password field shows/hides based on input format
- Input detection: underscore OR no numbers at end = username format
- Automatic password field clearing when switching to traditional login

### Session Management
After successful login, system stores:
- `memberAuth`: "true"
- `memberId`: Firebase document ID
- `memberName`: Full name
- `memberEmail`: Email address

### Security Features
- ✅ Active status verification
- ✅ Unique username enforcement
- ✅ Password confirmation requirement
- ⚠️ **Production TODO**: Hash passwords before storing (currently plain text)

## User Experience Features

### Smart Input Detection
The system automatically detects login format:
- Type "john_smith" → Password field appears
- Type "casten4701" → Password field hidden

### Clear Instructions
Login page displays:
- Format examples for both methods
- Real-time field visibility based on input
- Helpful error messages

### Optional Setup
Members can:
- Create credentials immediately after first login
- Skip setup and use traditional method indefinitely
- Create credentials later (future feature)

## Admin Considerations

### Member Data Required
For traditional login to work, members need:
- `name` field (full name with last name at end)
- `address` field (starting with street number)
- `status` field (must be "active")

### Credential Management
Admins should consider:
- Password reset functionality (future enhancement)
- Credential recovery process (future enhancement)
- Ability to revoke credentials if needed

## Security Recommendations for Production

### High Priority
1. **Hash Passwords**: Use bcrypt.js or similar before storing
2. **Rate Limiting**: Prevent brute force attacks
3. **HTTPS Only**: Ensure all traffic is encrypted
4. **Session Timeout**: Implement automatic logout after inactivity

### Medium Priority
5. **Password Reset**: Email-based password recovery
6. **Two-Factor Auth**: Optional 2FA for enhanced security
7. **Login Audit Trail**: Track login attempts and successes
8. **Account Lockout**: After multiple failed attempts

## Testing Checklist

- [ ] Traditional login works (lastname+number)
- [ ] Username/password login works
- [ ] Setup modal appears on first login
- [ ] Skip button allows portal access without setup
- [ ] Username uniqueness is enforced
- [ ] Password confirmation validation works
- [ ] Inactive members are blocked
- [ ] Session persists across page refreshes
- [ ] Logout clears session completely
- [ ] Password field shows/hides correctly based on input

## Known Limitations

1. **Plain Text Passwords**: Currently stored without hashing (development only)
2. **No Password Recovery**: Members can't reset forgotten passwords yet
3. **No Credential Updates**: Members can't change username/password after creation
4. **No Admin Reset**: Admins can't reset member credentials from admin panel

## Future Enhancements

1. Password reset via email
2. Credential update in member profile
3. Admin panel for credential management
4. Password strength indicator
5. Remember me checkbox
6. Login history/activity log
7. Security notifications (new login from unknown device)
8. Account recovery questions
