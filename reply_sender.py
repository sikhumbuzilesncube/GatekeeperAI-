import webbrowser
import subprocess

def send_sms(phone, message):
    """Open SMS app with pre-filled message"""
    try:
        # Android intent for SMS
        subprocess.run([
            'termux-open',
            f'sms:{phone}?body={message}'
        ])
        return True
    except:
        return False

def send_whatsapp(phone, message):
    """Open WhatsApp with pre-filled message"""
    try:
        # WhatsApp intent
        subprocess.run([
            'termux-open',
            f'https://wa.me/{phone}?text={message}'
        ])
        return True
    except:
        return False

def send_email(email, subject, message):
    """Open Gmail with pre-filled email"""
    try:
        subprocess.run([
            'termux-open',
            f'mailto:{email}?subject={subject}&body={message}'
        ])
        return True
    except:
        return False

if __name__ == '__main__':
    # Test
    print("Testing reply sender...")
    print("1. SMS: send_sms('0712345678', 'Hello')")
    print("2. WhatsApp: send_whatsapp('0712345678', 'Hello')")
    print("3. Email: send_email('test@gmail.com', 'Subject', 'Hello')")
