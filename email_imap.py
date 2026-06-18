import imaplib
import email
from email.header import decode_header

EMAIL = "sikhumbuzilesncube@gmail.com"
PASSWORD = "ptpxitjxespjxbqq"

def read_emails():
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(EMAIL, PASSWORD)
        mail.select("inbox")
        
        status, messages = mail.search(None, "UNSEEN")
        email_ids = messages[0].split()
        
        if not email_ids:
            print("No unread emails.")
            mail.close()
            mail.logout()
            return
        
        print(f"\n📧 Found {len(email_ids[:5])} recent emails:\n")
        
        for e_id in email_ids[:5]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = decode_header(msg["Subject"])[0][0]
                    if isinstance(subject, bytes):
                        subject = subject.decode()
                    if not subject:
                        subject = "No Subject"
                    print(f"📩 From: {msg.get('From', 'Unknown')}")
                    print(f"📝 Subject: {subject}")
                    print("-" * 40)
        
        mail.close()
        mail.logout()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    read_emails()
