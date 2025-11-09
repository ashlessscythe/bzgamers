Here’s a complete **`resend-email-setup.md`** guide for integrating **Resend** into a **Next.js App Router** project to send transactional emails:

---

````markdown
# 📧 Sending Emails with Resend in a Next.js App Router App

This guide walks through setting up **Resend** to send emails from a Next.js project using the **App Router** (`app/` directory).

---

## 🧩 Prerequisites

- A [Resend](https://resend.com) account
- A verified domain or sender email (e.g. `you@yourdomain.com`)
- A Next.js project (v13+ with the App Router)
- Node.js 18+ (required for `fetch` in server components)

Install the official Resend SDK:

```bash
npm install resend
# or
yarn add resend
````

---

## ⚙️ 1. Configure Environment Variables

Create or update your `.env.local` file:

```bash
RESEND_API_KEY=your_resend_api_key_here
```

Never commit this key to git.

---

## 🧠 2. Create a Server Route for Sending Emails

Create a new route inside your App Router API folder:

**`app/api/send/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    const data = await resend.emails.send({
      from: 'Acme <onboarding@yourdomain.com>', // must be verified in Resend
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error });
  }
}
```

This creates a POST endpoint at `/api/send` that triggers a Resend email.

---

## 🧭 3. Call the Endpoint from a Client Component

You can now call your new `/api/send` route from a form or button click.

**Example: `app/contact/page.tsx`**

```tsx
'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const sendEmail = async () => {
    setStatus('Sending...');
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Contact Form Submission',
        message,
      }),
    });

    const data = await res.json();
    setStatus(data.success ? '✅ Sent!' : '❌ Failed to send.');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Contact Us</h1>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendEmail}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        Send Email
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}
```

---

## 📄 4. Using React Email (Optional)

If you want more elegant, reusable email templates, use [React Email](https://react.email):

```bash
npm install @react-email/components
```

Then define a component like:

**`emails/WelcomeEmail.tsx`**

```tsx
import { Html, Text } from '@react-email/components';

export default function WelcomeEmail({ user }: { user: string }) {
  return (
    <Html>
      <Text>Welcome aboard, {user}! 🎉</Text>
    </Html>
  );
}
```

Send it using:

```ts
import WelcomeEmail from '@/emails/WelcomeEmail';
import { render } from '@react-email/render';

const html = render(<WelcomeEmail user="Tony" />);
await resend.emails.send({
  from: 'Acme <welcome@yourdomain.com>',
  to: 'tony@example.com',
  subject: 'Welcome!',
  html,
});
```

---

## ✅ 5. Verify and Test

1. Verify your sending domain in the [Resend dashboard](https://resend.com/domains).
2. Run your app:

```bash
npm run dev
```

3. Submit the contact form — you should see the email appear in your Resend dashboard and inbox.

---

## 🧾 References

* [Resend Docs](https://resend.com/docs)
* [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
* [React Email](https://react.email/)

---

**Done!** You now have a working Resend email system in your Next.js App Router app.

```

---

Would you like me to generate the actual `.md` file for download (so you can drop it straight into your repo)?
```
