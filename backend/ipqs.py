import json
import os
import requests
from typing import Union

# Should be treated like an environment variable and secret.
API_URL = "https://www.ipqualityscore.com/api/json/"

def email_validation_api(email: str, timeout: int = 7, fast: str = 'false', abuse_strictness: int = 0) -> str:

    url = f"{API_URL}email/{os.environ.get('IP_QUALITY_SCORE_API_KEY')}/{email}"

    params = {
        "timeout": timeout,
        "fast": fast,
        "abuse_strictness": abuse_strictness
    }

    response = requests.get(url, params=params)
    data = response.json()

    info = {}

    info['valid'] = data['valid']
    info['fraud_score'] = data['fraud_score']

    print("INFO", info)

    return info

def phone_number_validation_api(phone_number: str, country: Union[str, list], strictness: int = 0) -> str:

    url = f"{API_URL}phone/{os.environ.get('IP_QUALITY_SCORE_API_KEY')}/{phone_number}"

    params = {
        "country": country,
        "strictness": strictness
    }

    response = requests.get(url, params=params)
    data = response.json()

    info = {}

    info['valid'] = data['valid']
    info['fraud_score'] = data['fraud_score']

    print("INFO", info)

    return info



email = 'support@ipqualityscore.com'
phone_number = '18007132618'
print(email_validation_api(email))
print(phone_number_validation_api(phone_number, 'US'))