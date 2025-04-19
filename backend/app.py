from flask import Flask, request, jsonify
import os
import requests
from email_utils import parse_forwarded_email_mailgun
from ipqs import email_validation_api, phone_number_validation_api
from groqprompt import summary

# Load environment variables from the .env file

app = Flask(__name__)

@app.route('/')
def home():
    return 'Flask backend is running!'

@app.route('/incoming-sms', methods=['POST'])
def incoming_sms():
    text_info = request.get_xml()
    print("Parsed SMS data:", text_info)

@app.route('/incoming-email', methods=['POST'])
def incoming_email():

    email_info = parse_forwarded_email_mailgun(request.form)
    print("Parsed email data:", email_info)
    '''
    {
        "forwarder_email": forwarder_email,
        "original_email": original_email,
        "body": body.strip()
    }'''

    scammer_email = email_validation_api(email_info['original_email'])
    summy = summary(email_info['body'])

    # send_simple_message(email_info)
    send_simple_message(email_info, scammer_email, summy)
    # Respond with a success message
    return jsonify({"message": "Incoming email processed and reply sent!"}), 200

def send_simple_message(info, scam, verdict):
    # Send the email request to Mailgun API
    response = requests.post(
        "https://api.mailgun.net/v3/fraudalerthub.info/messages",
        auth=("api", f"{os.environ.get('MAILGUN_API_KEY')}"),  # Use the environment variable for API key
        data={
            "from": "isthisfraud <alerts@fraudalerthub.info>",
            "to": f"Valued Customer <{info['forwarder_email']}>",
            "subject": "Email Results",
            "text": f'''Email: {info['original_email']}
            IsValid?:{scam['valid']}
            Summary: {verdict}
                    '''
        }
    )

    # Check if the request was successful
    if response.status_code == 200:
        print("Email sent successfully!")
        print("Response:", response.text)  # Print the response text (message or error)
    else:
        print(f"Failed to send email. Status code: {response.status_code}")
        print("Response:", response.text)  # Print error message

    # Return the response object for further handling if needed
    return response

if __name__ == '__main__':
    app.run(debug=True)
