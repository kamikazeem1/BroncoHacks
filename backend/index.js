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

//Email Content Risk Check
app.post('/api/check-email-content', async (req, res) => {
  const { emailContent } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  if (!emailContent) {
    return res.status(400).json({ error: 'Email content is required' });
  }
  
  try {
    // IP Quality Score content analysis endpoint
    const apiUrl = 'https://www.ipqualityscore.com/api/json/contentAnalysis/' + apiKey;
    
    // Using POST method for content analysis as the text can be large
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: emailContent,
        language: 'en', // You can make this a parameter if needed
        strictness: 1,  // Medium strictness (0-2)
        timeout: 30     // Timeout in seconds
      })
    });
    
    const data = await apiResponse.json();
    
    res.json({ result: data });
  } catch (error) {
    console.error('Error analyzing email content:', error);
    res.status(500).json({ error: 'Failed to analyze email content' });
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

//Groq Summary
app.post('/api/generate-safety-summary', async (req, res) => {
  const { analysisType, analysisData, analysisResult } = req.body;
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    return res.status(500).json({ error: 'Groq API key not configured' });
  }
  
  if (!analysisType || !analysisResult) {
    return res.status(400).json({ error: 'Analysis type and result are required' });
  }
  
  try {
    // Prepare the prompt based on analysis type and data
    let prompt = `Based on the following ${analysisType} analysis data, provide:\n`;
    prompt += `1. 3-5 bullet points explaining why this ${analysisType} is or is not safe\n`;
    prompt += `2. A safety score out of 100 (where 100 is completely safe)\n`;
    prompt += `3. A single phrase categorizing the safety level (e.g., "Highly Safe", "Likely Safe", "Suspicious", "Likely Unsafe", "Dangerous")\n\n`;
    prompt += `Analysis data: ${JSON.stringify(analysisResult)}\n`;
    
    // Add specific context based on the type of analysis
    if (analysisType === 'email') {
      prompt += `\nConsider factors like: disposable domain, deliverability, domain age, fraud score, and any other relevant attributes.\n`;
    } else if (analysisType === 'email_content') {
      prompt += `\nFocus on: spam indicators, malicious links, suspicious phrasing, urgency tactics, and content quality.\n`;
    } else if (analysisType === 'phone') {
      prompt += `\nEvaluate: carrier information, line type, recent abuse, active service, fraud risk score, and any suspicious patterns.\n`;
    } else if (analysisType === 'url') {
      prompt += `\nExamine: domain age, suspicious patterns, phishing indicators, malware risk, spam score, and overall safety metrics.\n`;
    }
    
    prompt += `\nFormat your response as a JSON object with these properties: 
      {
        "safety_points": ["point1", "point2", ...], 
        "safety_score": number,
        "safety_category": "category phrase"
      }`;
    
    // Call Groq API for analysis
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Using a capable model, adjust as needed
        messages: [
          { role: 'system', content: 'You are a security analysis assistant. Provide concise, accurate assessments of security data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent outputs
        max_tokens: 500
      })
    });
    
    const groqData = await groqResponse.json();
    
    if (!groqData.choices || !groqData.choices[0]) {
      throw new Error('Invalid response from Groq API');
    }
    
    // Extract the JSON from the response
    const responseText = groqData.choices[0].message.content;
    let safetyAnalysis;
    
    try {
      // Try to parse the response as JSON
      safetyAnalysis = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails, attempt to extract JSON from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          safetyAnalysis = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          throw new Error('Could not parse Groq API response');
        }
      } else {
        throw new Error('Could not extract JSON from Groq API response');
      }
    }
    
    // Return the combined analysis
    res.json({
      original_analysis: analysisResult,
      safety_summary: safetyAnalysis
    });
    
  } catch (error) {
    console.error('Error generating safety summary:', error);
    res.status(500).json({ error: 'Failed to generate safety summary', details: error.message });
  }
});