const baseUrl = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  setupFormHandlers();
});

function formatPhoneNumber(phone) {
  let formatted = phone.replace(/[^\d+]/g, '');
  if (!formatted.startsWith('+')) {
    formatted = '+1' + formatted;
  }
  return formatted;
}

function setupFormHandlers() {
  // Email Checker
  document.getElementById('submit-email').addEventListener('click', async () => {
    const content = document.getElementById('emailContent').value;
    const email = document.querySelector('#email-section input').value;

    if (!content || !email) {
      alert('Please fill in both email address and message content.');
      return;
    }

    try {
      const emailCheck = await fetch(`${baseUrl}/api/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const emailResult = await emailCheck.json();

      const contentCheck = await fetch(`${baseUrl}/api/check-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const contentResult = await contentCheck.json();

      const summaryResponse = await fetch(`${baseUrl}/api/generate-safety-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: 'email',
          analysisData: {
            email: emailResult.result,
            content: contentResult.result
          },
          analysisResult: {
            email: emailResult.result,
            content: contentResult.result
          }
        })
      });

      const summaryData = await summaryResponse.json();
      displaySummary(summaryData);
    } catch (err) {
      console.error('Error during email check + summary:', err);
      displaySummary({ error: err.message });
    }
  });

  // Text Message Checker
  document.getElementById('submit-text').addEventListener('click', async () => {
    const content = document.getElementById('messageContent').value;
    const phoneInput = document.querySelector('#text-number input').value;
    const phoneNumber = formatPhoneNumber(phoneInput);

    if (!content || !phoneNumber) {
      alert('Please fill in both phone number and message content.');
      return;
    }

    try {
      const textCheck = await fetch(`${baseUrl}/api/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const textResult = await textCheck.json();

      const contentCheck = await fetch(`${baseUrl}/api/check-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const contentResult = await contentCheck.json();

      const summaryResponse = await fetch(`${baseUrl}/api/generate-safety-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: 'phone',
          analysisData: {
            phoneNumber: textResult.result,
            content: contentResult.result
          },
          analysisResult: {
            phoneNumber: textResult.result,
            content: contentResult.result
          }
        })
      });

      const summaryData = await summaryResponse.json();
      displaySummary(summaryData);
    } catch (err) {
      console.error('Error during phone check + summary:', err);
      displaySummary({ error: err.message });
    }
  });

  // Link Checker
  document.getElementById('submit-link').addEventListener('click', async () => {
    const url = document.querySelector('#link-section input').value;

    if (!url) {
      alert('Please enter a URL to check.');
      return;
    }

    try {
      const urlCheck = await fetch(`${baseUrl}/api/check-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const urlResult = await urlCheck.json();

      const summaryResponse = await fetch(`${baseUrl}/api/generate-safety-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: 'url',
          analysisData: { url: urlResult.result },
          analysisResult: { ...urlResult.result }
        })
      });

      const summaryData = await summaryResponse.json();
      displaySummary(summaryData);
    } catch (err) {
      console.error('Error during link check + summary:', err);
      displaySummary({ error: err.message });
    }
  });
}

function displaySummary(data) {
  const resultsSection = document.getElementById('results-section');
  const resultsContent = document.getElementById('results-content');

  resultsSection.style.display = 'block';

  if (data.error) {
    resultsContent.innerHTML = `<p>❌ Error: ${data.error}</p>`;
    return;
  }

  const summary = data.safety_summary;

  resultsContent.innerHTML = `
    <h3>So how fraudulent is this? Here's your summary:</h3>
    <ul>
      ${summary.safety_points.map(point => `<li>${point}</li>`).join('')}
    </ul>
    <p><strong>Safety Score:</strong> ${summary.safety_score}/100</p>
    <p><strong>Category:</strong> ${summary.safety_category}</p>
  `;
}

function displayForm() {
  document.getElementById('email-section').style.display = "none";
  document.getElementById('text-section').style.display = "none";
  document.getElementById('link-section').style.display = "none";

  switch (document.getElementById('feature-select').value) {
    case "select":
      alert("Please select a feature from the dropdown menu");
      break;
    case "email":
      document.getElementById('email-section').style.display = "block";
      break;
    case "text":
      document.getElementById('text-section').style.display = "block";
      break;
    case "link":
      document.getElementById('link-section').style.display = "block";
      break;
  }

  document.getElementById('results-section').style.display = 'none';
}
