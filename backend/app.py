from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv()

app = Flask(__name__)

@app.route('/')
def home():
    return 'Flask backend is running!'

@app.route('/send-email', methods=['POST'])
def send_email():
    # Fetch environment variables
    domain = os.getenv('MAILGUN_DOMAIN')
    api_key = os.getenv('MAILGUN_API_KEY')

    # Get data from the request
    data = {
        "from": os.getenv("MAILGUN_FROM"),
        "to": request.json.get('to'),
        "subject": request.json.get('subject'),
        "text": request.json.get('text')
    }

    # Send email using Mailgun API
    resp = requests.post(
        f"https://api.mailgun.net/v3/{domain}/messages",
        auth=("api", api_key),
        data=data
    )

    return resp.text, resp.status_code

if __name__ == '__main__':
    app.run(debug=True)
