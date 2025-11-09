# Authentication & Email Setup Guide

This guide will help you set up authentication and email functionality for BZGamers.

## Prerequisites

1. **Database Migration**: Run Prisma migrations to create User and WaitlistEmail tables
2. **Environment Variables**: Set up required environment variables
3. **Resend Account**: Create a Resend account for email sending

## Step 1: Database Migration

Run Prisma migrations to create the new tables:

```bash
npx prisma migrate dev --name add_auth_and_waitlist
```

Or if you prefer to generate the migration first:

```bash
npx prisma migrate dev --create-only --name add_auth_and_waitlist
npx prisma migrate dev
```

## Step 2: Environment Variables

Add the following to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
# AUTH_TRUST_HOST=true  # Optional: Can also set this instead of trustHost in config

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=BZGamers <onboarding@yourdomain.com>
RESEND_EMAIL_DELAY_MS=500  # Delay between emails in milliseconds (default: 500ms)
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### Get Resend API Key

1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use the test domain (`onboarding@resend.dev`)
3. Get your API key from the dashboard
4. Update `RESEND_FROM_EMAIL` with your verified email address

## Step 3: Create Admin User

Run the seed script to create your first admin user:

```bash
node scripts/seed-admin.js
```

Follow the prompts to:
- Enter admin email
- Enter admin password (min 6 characters)
- Enter admin name (optional)

Alternatively, you can create an admin user programmatically:

```javascript
const { PrismaClient } = require('./src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('your-password', 10)
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
}
```

## Step 4: Test the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Sign in as admin**:
   - Go to http://localhost:3000/auth/signin
   - Use the credentials you created

3. **Access admin dashboard**:
   - Go to http://localhost:3000/admin
   - You should see the waitlist management interface

4. **Test waitlist**:
   - Go to http://localhost:3000
   - Submit an email to the waitlist
   - Check the admin dashboard to see it appear

5. **Test email sending**:
   - In the admin dashboard, click "Send Email"
   - Use the default template or write a custom message
   - Send to selected emails or all pending emails

## Features

### Authentication
- **Sign In**: `/auth/signin` - Login page for admin users
- **Session Management**: Uses NextAuth.js with JWT strategy
- **Role-Based Access**: Admin and Guest roles
- **Protected Routes**: Admin routes require authentication

### Waitlist Management
- **Email Collection**: Users can join waitlist from homepage
- **Admin Dashboard**: View all waitlist emails at `/admin`
- **Email Sending**: Send emails to waitlist users via Resend
- **Status Tracking**: Track which emails have been notified

### Email Templates
- **Welcome Email**: Default template for new waitlist signups
- **Custom Messages**: Admin can send custom HTML emails
- **Template System**: Reusable email templates in `src/lib/email-templates.js`

## API Endpoints

### Public Endpoints
- `POST /api/waitlist` - Add email to waitlist

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/waitlist` - Get all waitlist emails
- `POST /api/admin/send-email` - Send emails to waitlist users

## Troubleshooting

### "Unauthorized" Error
- Make sure you're signed in as an admin user
- Check that your user has `role: 'ADMIN'` in the database

### Email Not Sending
- Verify your Resend API key is correct
- Check that `RESEND_FROM_EMAIL` is a verified email in Resend
- Check the Resend dashboard for error logs

### Database Errors
- Make sure you've run Prisma migrations
- Verify your `DATABASE_URL` is correct in `.env.local`
- Run `npx prisma generate` to regenerate the Prisma client

### NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your app URL
- Clear browser cookies and try again

## Security Notes

1. **Never commit** `.env.local` to version control
2. **Use strong passwords** for admin accounts
3. **Rotate secrets** regularly in production
4. **Limit admin access** to trusted users only
5. **Monitor email sending** to prevent abuse

## Next Steps

- Set up email verification for user accounts
- Add password reset functionality
- Implement rate limiting for email sending
- Add email analytics and tracking
- Create user registration flow

