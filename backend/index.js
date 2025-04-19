import express from 'express';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const app = express();
const port = process.env.PORT || 8080;

// Mailgun setup
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY, // You MUST provide this in env
  // url: 'https://api.eu.mailgun.net' // Uncomment if you're on EU region
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'fraudalerthub.info';
const FROM_EMAIL = `Fraud Alert <postmaster@${MAILGUN_DOMAIN}>`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Reusable mail sending function
async function sendReplyEmail(to, subject, body) {
  try {
    const data = await mg.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: [to],
      subject: `Re: ${subject}`,
      text: body,
    });

    console.log('Mailgun response:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

// Main endpoint
app.post('/incoming-email', async (req, res) => {
  const { sender, subject, 'stripped-text': strippedText } = req.body;

  console.log('✅ Received email from:', sender);
  console.log('📨 Subject:', subject);
  console.log('📝 Body:', strippedText);

  const replyText = `Hi! We received your forwarded message.\n\nSubject: ${subject}\n\nOur system is analyzing this message. We'll get back with a scam score soon.`;

  try {
    await sendReplyEmail(sender, subject, replyText);
    res.status(200).json({ message: 'Reply sent successfully.' });
  } catch {
    res.status(500).json({ message: 'Failed to send reply.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
