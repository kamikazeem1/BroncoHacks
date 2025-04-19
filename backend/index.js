const express = require('express');
const app = express();
const port = process.env.PORT;

// Middleware to parse incoming JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint to receive forwarded email
app.post('/incoming-email', (req, res) => {
    const emailData = req.body;
    
    // Extract information from email
    const sender = emailData.sender;
    const subject = emailData.subject;
    const body = emailData['stripped-text']; // The email body in plain text

    // Process the email data (validate sender, check URLs, etc.)
    console.log('Received email from:', sender);
    console.log('Subject:', subject);
    console.log('Body:', body);

    // Respond to Mailgun
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
