import requests
import json

# AI Server URL
AI_URL = "http://127.0.0.1:5000/classify"

def get_smart_reply(message, sender, category):
    """
    Generate a smart reply based on message content and category
    """
    
    # Pre-defined replies for different categories
    if category == "URGENT":
        replies = [
            "Thank you for alerting me. I am looking into this immediately.",
            "I have received your message. I will take action right away.",
            "This is critical. I am on it.",
            "Noted. I will respond to this urgently.",
            "Thank you. I will contact the relevant authority now."
        ]
    elif category == "IMPORTANT":
        replies = [
            "Thank you. I will review this and get back to you today.",
            "Noted. I will follow up on this.",
            "I have received your message. Will respond shortly.",
            "Thanks. I will look into this.",
            "Noted with thanks."
        ]
    else:
        replies = [
            "Thank you for your message.",
            "Noted.",
            "I will get back to you.",
            "Thanks for the update.",
            "Received."
        ]
    
    # Pick the most relevant reply based on message content
    # For now, return the first one
    return replies[0]

def get_ai_reply(message, sender):
    """
    Use AI to generate a more personalized reply
    """
    try:
        prompt = f"""
You are Gatekeeper AI, a personal assistant for a busy professional.

Message from {sender}: {message}

Write a short, professional reply (1-2 sentences) that:
- Acknowledges the message
- Shows that action will be taken

Reply:
"""
        response = requests.post(
            AI_URL,
            json={'subject': sender, 'body': prompt},
            timeout=5
        )
        # Since we're using the same AI, we'll format a reply
        return f"Thank you for your message. I will get back to you shortly."
    except:
        return "Thank you for your message. I will get back to you shortly."

if __name__ == '__main__':
    # Test
    print("Testing Smart Reply:")
    print("URGENT message reply:", get_smart_reply("Borehole broken", "Constituent", "URGENT"))
    print("IMPORTANT message reply:", get_smart_reply("Meeting at 2pm", "Parliament", "IMPORTANT"))
    print("NORMAL message reply:", get_smart_reply("Hello", "Friend", "NORMAL"))
