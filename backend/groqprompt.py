import os
from groq import Groq

client = Groq(
    # This is the default and can be omitted
    api_key=os.environ.get('GROQ_API_KEY'),
)

def summary(body):

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": '''
                Based on the following email content analysis data, provide:
1. 3-5 bullet points explaining why this email is or is not safe.
2. A safety score out of 100 (where 100 is completely safe).
3. A single phrase categorizing the safety level (e.g., "Highly Safe", "Likely Safe", "Suspicious", "Likely Unsafe", "Dangerous").

Analysis data: 

Consider factors like spam indicators, malicious links, suspicious phrasing, urgency tactics, and content quality.
            '''
            },
            {
                "role": "user",
                "content": f"{body}",
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    return chat_completion.choices[0].message.content