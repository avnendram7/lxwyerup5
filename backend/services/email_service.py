import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_waitlist_notification(name: str, email: str, message: str = ""):
    """
    Sends an automated email notification when someone joins the waitlist.
    Sends to avnendram.7@gmail.com.
    """
    SMTP_EMAIL = os.getenv("SMTP_EMAIL")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning("SMTP_EMAIL or SMTP_PASSWORD not set in .env. Skipping waitlist email notification.")
        return

    sender_email = SMTP_EMAIL
    receiver_email = "avnendram.7@gmail.com"
    
    subject = f"🚀 New Early Access Signup: {name}"
    
    body = f"""
    <h2>New Early Access Signup</h2>
    <p>A new user has submitted the early access form for LxwyerUp!</p>
    <ul>
        <li><strong>Name:</strong> {name}</li>
        <li><strong>Email:</strong> {email}</li>
        <li><strong>Message:</strong> {message if message else "<em>No message provided</em>"}</li>
    </ul>
    """
    
    msg = MIMEMultipart()
    msg['From'] = f"LxwyerUp Notifications <{sender_email}>"
    msg['To'] = receiver_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"Waitlist notification email sent successfully for {email}")
    except Exception as e:
        logger.error(f"Failed to send waitlist email notification: {e}")
