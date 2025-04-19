console.log("✅ index.js is running");
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

// 📨 Email Risk Check
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const apiUrl = `https://www.ipqualityscore.com/api/json/email/${apiKey}/${encodeURIComponent(email)}`;
    const { data } = await axios.get(apiUrl);
    res.json({ result: data });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// 💬 Email/Text Content Risk Check
app.post('/api/check-content', async (req, res) => {
  const { content } = req.body;
  const apiKey = process.env.IP_QUALITY_SCORE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const apiUrl = 'https://www.ipqualityscore.com/api/json/contentAnalysis/' + apiKey;
    const { data } = await axios.post(apiUrl, {
      text: content,
      language: 'en',
      strictness: 1,
      timeout: 30
    });
    res.json({ result: data });
  } catch (error) {
    console.error('Error analyzing message content:', error);
    res.status(500).json({ error: 'Failed to analyze message content' });
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
    let apiUrl = `https://www.ipqualityscore.com/api/json/phone/${apiKey}/${encodeURIComponent(phoneNumber)}`;
    if (country) {
      apiUrl += `?country=${encodeURIComponent(country)}`;
    }
    const { data } = await axios.get(apiUrl);
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
    let apiUrl = `https://www.ipqualityscore.com/api/json/url/${apiKey}/` + encodeURIComponent(url);
    const { data } = await axios.get(apiUrl);
    res.json({ result: data });
  } catch (error) {
    console.error('Error checking URL:', error);
    res.status(500).json({ error: 'Failed to verify URL' });
  }
});

// 🧠 Groq Summary
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
    let prompt = `Based on the following ${analysisType} analysis data, provide:\n`;
    prompt += `1. 3-5 bullet points explaining why this ${analysisType} is or is not safe\n`;
    prompt += `2. A safety score out of 100 (where 100 is completely safe)\n`;
    prompt += `3. A single phrase categorizing the safety level (e.g., \"Highly Safe\", \"Likely Safe\", \"Suspicious\", \"Likely Unsafe\", \"Dangerous\")\n\n`;
    prompt += `Analysis data: ${JSON.stringify(analysisResult)}\n`;

    if (analysisType === 'email') {
      prompt += `\nConsider factors like: disposable domain, deliverability, domain age, fraud score, and any other relevant attributes.\n`;
    } else if (analysisType === 'email_content') {
      prompt += `\nFocus on: spam indicators, malicious links, suspicious phrasing, urgency tactics, and content quality.\n`;
    } else if (analysisType === 'phone') {
      prompt += `\nEvaluate: carrier information, line type, recent abuse, active service, fraud risk score, and any suspicious patterns.\n`;
    } else if (analysisType === 'url') {
      prompt += `\nExamine: domain age, suspicious patterns, phishing indicators, malware risk, spam score, and overall safety metrics.\n`;
    }

    prompt += `\nFormat your response as a JSON object with these properties: { \"safety_points\": [\"point1\", \"point2\", ...], \"safety_score\": number, \"safety_category\": \"category phrase\" }`;

    const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a security analysis assistant. Provide concise, accurate assessments of security data.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = groqResponse.data.choices[0].message.content;
    let safetyAnalysis;
    try {
      safetyAnalysis = JSON.parse(responseText);
    } catch (parseError) {
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

    res.json({
      original_analysis: analysisResult,
      safety_summary: safetyAnalysis
    });
  } catch (error) {
    console.error('Error generating safety summary:', error);
    res.status(500).json({ error: 'Failed to generate safety summary', details: error.message });
  }
});

console.log('🚧 Reached end of index.js');

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});