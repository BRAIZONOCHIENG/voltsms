# VoltSMS Email Templates

Professional, branded email templates for Supabase Authentication.

## Templates Included

| File | Purpose | Supabase Template Name |
|------|---------|----------------------|
| `confirm-signup.html` | Email verification after signup | Confirm signup |
| `reset-password.html` | Password reset request | Reset password |
| `magic-link.html` | Passwordless login | Magic link |
| `email-change.html` | Email address change confirmation | Change email address |
| `invite-user.html` | Admin invites new user | Invite user |

## How to Apply to Supabase

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your VoltSMS project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Each Template
For each template:
1. Click on the template name (e.g., "Confirm signup")
2. Copy the HTML content from the corresponding `.html` file
3. Paste it into the **Body** field
4. Update the **Subject** line:
   - Confirm signup: `Welcome to VoltSMS! Verify your email ⚡`
   - Reset password: `Reset your VoltSMS password 🔐`
   - Magic link: `Your VoltSMS login link ✨`
   - Change email: `Confirm your new email address 📧`
   - Invite user: `You're invited to VoltSMS! 🎉`
5. Click **Save**

### Step 3: Update Logo URL
The templates reference `https://voltsms.com/voltsms-logo.png`.

**Option A**: Host the logo at that exact URL on your domain.

**Option B**: Replace the logo URL in all templates with your actual hosted logo URL (e.g., Supabase Storage, S3, or Cloudinary).

To upload to Supabase Storage:
1. Go to **Storage** in Supabase Dashboard
2. Create a bucket called `public` (enable public access)
3. Upload `voltsms-logo.png`
4. Copy the public URL
5. Replace all instances of `https://voltsms.com/voltsms-logo.png` with your Storage URL

## Template Variables

Supabase uses Go template syntax. The variable `{{ .ConfirmationURL }}` is automatically replaced with the correct link.

## Testing

After applying templates:
1. Create a test account with a new email
2. Check your inbox for the styled email
3. Verify the button/link works correctly

## Customization

- **Colors**: Search and replace the hex codes
  - Primary: `#845ec2`
  - Secondary: `#d65db1`
  - Accent: `#ff6f91`
  - Yellow: `#f9f871`
- **Text**: Edit any copy directly in the HTML
- **Logo**: Update the `<img src="...">` URL
