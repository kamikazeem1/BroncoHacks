const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const port = process.env.PORT;

require('dotenv').config();

// Middleware to parse incoming JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = `Fraud Alert <mailgun@${MAILGUN_DOMAIN}`;

// Endpoint to receive forwarded email
app.post('/incoming-email', async (req, res) => {
    const emailData = req.body;
    const sender = emailData.sender;
    const subject = emailData.subject;
    const body = emailData['stripped-text']; // The email body in plain text

    // Process the email data (validate sender, check URLs, etc.)
    console.log('Received email from:', sender);
    console.log('Subject:', subject);
    console.log('Body:', body);

    const replyText = `Hi! We received your forwarded message.\n\nSubject: ${subject}\n\nOur system is analyzing this message. We'll get back with a scam score soon.`;

    const form = new FormData();
    form.append('from', FROM_EMAIL);
    form.append('to', sender);
    form.append('subject', 'Re: ' + subject);
    form.append('text', replyText);

    try {
        const mgRes = await axios.post(
            `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
            form,
            {
                auth: {
                    username: 'api',
                    password: MAILGUN_API_KEY,
                },
                headers: form.getHeaders()
            }
        );

        console.log('Reply sent to:', sender);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Failed to send reply:', error.response?.data || error.message);
        res.status(500).send('Error sending reply');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
