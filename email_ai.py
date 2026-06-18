import imaplib
import email
from email.header import decode_header
import requests

# Gmail IMAP settings
EMAIL = "sikhumbuzilesncube@gmail.com"
PASSWORD = "orotaefrlrtopitd"  # Replace with your App Password
AI_URL = "http://127.0.0.1:5000/classify"

def classify_email(sender, subject, body=""):
    """Send email to AI for classification"""
    try:
        response = requests.post(
            AI_URL,
            json={'subject': subject, 'body': f"{sender} {body}"},
            timeout=3
        )
        return response.json().get('label', 'NORMAL')
    except:
        return 'NORMAL'

def read_and_classify_emails(limit=10):
    try:
        # Connect to Gmail
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(EMAIL, PASSWORD)
        mail.select("inbox")
        
        # Get recent emails
        status, messages = mail.search(None, "UNSEEN")
        email_ids = messages[0].split()
        
        if not email_ids:
            print("No new emails.")
            mail.close()
            mail.logout()
            return
        
        print(f"\n📧 Classifying {len(email_ids[:limit])} emails...\n")
        
        urgent_count = 0
        important_count = 0
        normal_count = 0
        
        for e_id in email_ids[:limit]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    # Get subject
                    subject = decode_header(msg["Subject"])[0][0]
                    if isinstance(subject, bytes):
                        subject = subject.decode()
                    if not subject:
                        subject = "No Subject"
                    
                    # Get sender
                    sender = msg.get("From", "Unknown")
                    
                    # Get body (first 200 chars)
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                body = part.get_payload(decode=True).decode('utf-8', errors='ignore')[:200]
                                break
                    else:
                        body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')[:200]
                    
                    # Classify
                    label = classify_email(sender, subject, body)
                    
                    # Count
                    if label == "URGENT":
                        urgent_count += 1
                    elif label == "IMPORTANT":
                        important_count += 1
                    else:
                        normal_count += 1
                    
                    # Display
                    icon = "🔴" if label == "URGENT" else "🟠" if label == "IMPORTANT" else "⚪"
                    print(f"{icon} [{label}] From: {sender[:40]}")
                    print(f"   Subject: {subject[:60]}")
                    print("-" * 50)
        
        # Summary
        print("\n📊 EMAIL SUMMARY:")
        print(f"   🔴 URGENT: {urgent_count}")
        print(f"   🟠 IMPORTANT: {important_count}")
        print(f"   ⚪ NORMAL: {normal_count}")
        
        mail.close()
        mail.logout()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    read_and_classify_emails(10)
