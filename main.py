from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput

URGENT_KEYWORDS = ["borehole", "water", "broken", "emergency", "urgent", "hospital", "death", "accident", "no water", "school fees"]
IMPORTANT_KEYWORDS = ["meeting", "today", "deadline", "report", "parliament", "minister", "constituent", "visit"]

def classify_message(subject, body):
    text = f"{subject} {body}".lower()
    for word in URGENT_KEYWORDS:
        if word in text:
            return "URGENT"
    for word in IMPORTANT_KEYWORDS:
        if word in text:
            return "IMPORTANT"
    return "NORMAL"

class GatekeeperAIApp(App):
    def build(self):
        layout = BoxLayout(orientation="vertical", padding=10, spacing=10)
        self.subject = TextInput(hint_text="Subject", multiline=False)
        layout.add_widget(self.subject)
        self.body = TextInput(hint_text="Message body", multiline=True)
        layout.add_widget(self.body)
        btn = Button(text="CLASSIFY", size_hint=(1, 0.2))
        btn.bind(on_press=self.classify)
        layout.add_widget(btn)
        self.result = Label(text="", font_size="32sp")
        layout.add_widget(self.result)
        return layout
    
    def classify(self, instance):
        label = classify_message(self.subject.text, self.body.text)
        if label == "URGENT":
            self.result.text = "🔴 URGENT"
        elif label == "IMPORTANT":
            self.result.text = "🟠 IMPORTANT"
        else:
            self.result.text = "⚪ NORMAL"

if __name__ == "__main__":
    GatekeeperAIApp().run()
