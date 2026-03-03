# EdgeOne SMS - Node.js Version

SMS sender using EdgeOne Pages Edge Functions (Node.js port of the original PHP SMS library).

## Setup

### 1. Install Dependencies

```bash
cd nodejs-sms
npm install
```

### 2. Get an Email API Key (Resend)

This version uses [Resend](https://resend.com) for sending emails to carrier gateways.

1. Sign up at https://resend.com (free tier available)
2. Get your API key from the dashboard
3. Verify your sender email domain in Resend

### 3. Configure Environment Variables

Create a `.env.local` file:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

Or set it in EdgeOne Pages dashboard under **Settings → Environment Variables**.

### 4. Verify Your Domain (Required)

1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `sypnaticwars.com`
4. Add the DNS records Resend provides to your domain
5. Wait for verification (5-30 minutes)

**Note:** Messages will be sent from `SMS <noreply@sypnaticwars.com>`. The sender's email is added as a Reply-To header.

### 5. Deploy to EdgeOne Pages

```bash
# Login to EdgeOne
npx @edgeone/pages login

# Deploy
npx @edgeone/pages deploy
```

Or connect your Git repo to EdgeOne Pages for automatic deployments.

## Usage

### Via Web Interface

1. Open your deployed site (e.g., `https://your-project.edgeone.app`)
2. Fill in the form:
   - **Phone Number**: 10-digit US number (e.g., `4234881795`)
   - **Carrier**: Select from dropdown (e.g., `att`)
   - **Sender Email**: Your email (e.g., `Biggysize21@gmail.com`)
   - **Message**: Up to 160 characters
3. Click "Send Message"

### Via API

```bash
curl -X POST https://your-project.edgeone.app/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail": "Biggysize21@gmail.com",
    "message": "Text me on chat app for peace talk sweetie i am waiting on u right there.",
    "phoneNumber": "4234881795",
    "carrier": "att"
  }'
```

### Response Format

**Success:**
```json
{
  "success": true,
  "errors": [],
  "messageId": "msg_xxxxxxxxxxxxx"
}
```

**Error:**
```json
{
  "success": false,
  "errors": [
    "Phone number must be exactly 10 digits",
    "Valid carrier required"
  ]
}
```

## Supported Carriers

Same as original PHP library:
- alltel, att, boost, cellularone, cingular, comcast
- metropcs, nextel, sprint, tmobile, tracfone
- uscellular, verizon, virginmobile, weblinkwireless

## File Structure

```
nodejs-sms/
├── edge-functions/
│   └── send-sms.js      # Edge Function (API endpoint)
├── index.html           # Web interface
├── package.json         # Dependencies
└── README.md            # This file
```

## Differences from PHP Version

| Feature | PHP Version | Node.js/EdgeOne Version |
|---------|-------------|-------------------------|
| Runtime | PHP server | EdgeOne Pages (Serverless) |
| Email | PHP `mail()` | Resend API |
| Config | None (needs SMTP) | RESEND_API_KEY env var |
| Deployment | Manual FTP | Git push or CLI |
| Scaling | Server-dependent | Auto-scales at edge |

## Troubleshooting

### "Email service not configured"
- Set `RESEND_API_KEY` in environment variables

### "Failed to send"
- Verify your sender email is authenticated in Resend
- Check Resend dashboard for detailed error logs

### Message not received
- Verify the carrier is correct for the phone number
- Some carriers may block automated messages

## Cost

- **Resend**: Free tier includes 100 emails/day, 3,000/month
- **EdgeOne Pages**: Free tier available for small projects
