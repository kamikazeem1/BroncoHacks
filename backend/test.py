import os
from dotenv import load_dotenv
load_dotenv(dotenv_path='.env')  # Load environment variables from .env file

print(os.environ.get('IP_QUALITY_SCORE_API_KEY'))
print(os.environ.get('MAILGUN_API_KEY'))
print(os.environ.get('GROQ_API_KEY'))
print(os.environ.get('MAILGUN_DOMAIN'))