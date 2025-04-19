const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const axios = require('axios');
require('dotenv').config();
const path = require('path');


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files if needed
app.use(express.static(path.join(__dirname, '../frontend')));

// Example API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

//Groq API route
app.post('/api/groq', async (req, res) => {
  const { emailText } = req.body;
});

// 📨 Email Risk Check
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    // IP Quality Score API endpoint for email validation
    const apiUrl = `https://www.ipqualityscore.com/api/json/email/${apiKey}/${encodeURIComponent(email)}`;
    
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    
    res.json({ result: data });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// 📱 Phone Risk Check
app.post('/api/check-phone', async (req, res) => {
  const { phoneNumber, country = '' } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    // Build URL with optional parameters
    let apiUrl = `https://www.ipqualityscore.com/api/json/phone/${apiKey}/${encodeURIComponent(phoneNumber)}`;
    
    // Add optional country parameter if provided
    if (country) {
      apiUrl += `?country=${encodeURIComponent(country)}`;
    }
    
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    
    res.json({ result: data });
  } catch (error) {
    console.error('Error checking phone number:', error);
    res.status(500).json({ error: 'Failed to verify phone number' });
  }
});

// 🔗 URL Risk Check
app.post('/api/check-url', async (req, res) => {
  const { url } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    // Base URL for the IP Quality Score URL validation endpoint
    let apiUrl = `https://www.ipqualityscore.com/api/json/url/${apiKey}/`;
    
    // Append the encoded URL to validate
    // URLs need special handling as they already contain query parameters
    apiUrl += encodeURIComponent(url);
    
    
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    
    res.json({ result: data });
  } catch (error) {
    console.error('Error checking URL:', error);
    res.status(500).json({ error: 'Failed to verify URL' });
  }
});