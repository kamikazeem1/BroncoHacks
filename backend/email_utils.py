import re
from flask import request

def parse_forwarded_email_mailgun(request_form):
    """
    Parses a forwarded email from Mailgun webhook data.

    Args:
        request_form: Flask request.form containing Mailgun's POSTed data.

    Returns:
        dict with:
            - forwarder_email: who forwarded the email
            - forwarder_name: name of the forwarder
            - original_email: original sender inside the forwarded message
            - body: the plain body text of the original message
    """
    # 1. Forwarder (the person who sent the forwarded email to Mailgun)
    forwarder_raw = request_form.get("from", "")
    forwarder_name, forwarder_email = extract_name_and_email(forwarder_raw)

    # 2. Raw body of the forwarded message
    body = request_form.get("stripped-text") or request_form.get("body-plain", "")

    # 3. Try to extract the original sender from common forwarded formats in the body
    original_email = extract_forwarded_sender_email(body)

    return {
        "forwarder_email": forwarder_email,
        "forwarder_name": forwarder_name,
        "original_email": original_email,
        "body": body.strip()
    }

def extract_name_and_email(text):
    """Extracts first valid email from a string."""
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if match:
        name = match.group(1).strip().strip('"') or None
        email = match.group(2).strip()
    return name, email

def extract_forwarded_sender_email(body):
    """
    Scans body for the original sender in forwarded email formats.
    Typical format: 'From: John Doe <john@example.com>'
    """
    match = re.search(r"From:\s.*?([\w\.-]+@[\w\.-]+)", body, re.IGNORECASE)
    return match.group(1) if match else None
