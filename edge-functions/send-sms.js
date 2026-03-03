// EdgeOne Pages Edge Function - SMS Sender
// Uses email-to-SMS gateways via Resend API (native fetch, no SDK)

// Verified domain for sending (configure in Resend dashboard)
const SENDER_DOMAIN = 'sypnaticwars.com';
const SENDER_NAME = 'SMS';
const RESEND_API_URL = 'https://api.resend.com/emails';

const CARRIERS = {
  alltel: "message.alltel.com",
  att: "txt.att.net",
  boost: "myboostmobile.com",
  cellularone: "cell1.textmsg.com",
  cingular: "cingularme.com",
  comcast: "comcastpcs.textmsg.com",
  metropcs: "metropcs.sms.us",
  nextel: "messaging.nextel.com",
  sprint: "messaging.sprintpcs.com",
  tmobile: "tmomail.net",
  tracfone: "txt.att.net",
  uscellular: "email.uscc.net",
  verizon: "vtext.com",
  virginmobile: "vmobl.com",
  weblinkwireless: "airmessage.net"
};

function formatPhoneNumber(number) {
  return number.replace(/\D/g, "");
}

function validateInput(email, message, number, carrier) {
  const errors = [];

  if (!email) {
    errors.push("Sender email required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid sender email");
  }

  if (!number) {
    errors.push("Phone number required");
  } else if (formatPhoneNumber(number).length !== 10) {
    errors.push("Phone number must be exactly 10 digits");
  }

  if (!message) {
    errors.push("Message required");
  } else if (message.length > 160) {
    errors.push("Message cannot be greater than 160 characters");
  }

  if (!carrier || !CARRIERS[carrier]) {
    errors.push("Valid carrier required");
  }

  return errors;
}

export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  // Only accept POST requests
  if (request.method !== "POST") {
    return Response.json(
      { success: false, errors: ["Method not allowed"] },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const { senderEmail, message, phoneNumber, carrier } = body;

    // Validate input
    const errors = validateInput(senderEmail, message, phoneNumber, carrier);
    if (errors.length > 0) {
      return Response.json({
        success: false,
        errors
      });
    }

    // Format phone number
    const cleanNumber = formatPhoneNumber(phoneNumber);
    const carrierDomain = CARRIERS[carrier];
    const recipientEmail = `${cleanNumber}@${carrierDomain}`;

    // Check if Resend API key is configured
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({
        success: false,
        errors: ["Email service not configured. Set RESEND_API_KEY in environment variables."]
      });
    }

    // Send email via Resend API using native fetch
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <noreply@${SENDER_DOMAIN}>`,
        to: [recipientEmail],
        subject: '',
        text: message.substring(0, 160),
        headers: {
          'Reply-To': senderEmail
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({
        success: false,
        errors: [`Failed to send: ${result.message || response.statusText}`]
      });
    }

    return Response.json({
      success: true,
      errors: [],
      messageId: result.id
    });

  } catch (err) {
    return Response.json({
      success: false,
      errors: [`Server error: ${err.message}`]
    });
  }
}
