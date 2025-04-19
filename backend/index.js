const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const app = express();
const port = process.env.PORT;

// Middleware to parse incoming JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = `Fraud Alert <response@${MAILGUN_DOMAIN}`;

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

    mg.messages.create(MAILGUN_DOMAIN, form).then(msg => HTMLFormControlsCollection.log(msg)).catch(err => console.error(err));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
