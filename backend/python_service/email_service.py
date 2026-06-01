import os
import smtplib
from urllib.parse import urlparse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_legal_notice(recipient_email, website_url, original_image_url, copied_image_url, client_brand_name=None, custom_subject=None, custom_body=None):
    if not client_brand_name:
        client_brand_name = os.getenv("CLIENT_BRAND_NAME", "DesignProof Protected Brand")

    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    
    if not sender_email or not sender_password:
        return False, "EMAIL_USER or EMAIL_PASS not set in environment."

    subject = custom_subject if custom_subject else f"URGENT: Legal Notice of Copyright Infringement - {urlparse(website_url).netloc}"
    
    if custom_body:
        body = custom_body
    else:
        body = f"""Dear Website Administrator,

This is an official notice of copyright infringement regarding digital assets belonging to our client that are currently being utilized without authorization on your platform.

Infringing URL: {website_url}
Original Asset: {original_image_url}

Our automated brand protection system has verified that the content at the above-mentioned link is a direct reproduction of our proprietary designs. We request the immediate removal of all infringing digital assets from your servers within the next 48 hours to avoid further escalation.

Please confirm when the content has been removed.

Sincerely,
DesignProof Intellectual Property Protection Team
"""

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Determine if using Ethereal (Mock) or Gmail
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"[SUCCESS] EMAIL SENT SUCCESSFULLY!")
        print(f"  | To: {recipient_email}")
        print(f"  | Brand: {client_brand_name}")
        print(f"  | Subject: {subject}")
        if "ethereal.email" in smtp_host:
            print(f"  | View Mock Email Inbox at: https://ethereal.email/login")
            
        return True, "Email sent successfully."
    except Exception as e:
        return False, str(e)
