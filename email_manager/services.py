import re
import openai
from django.conf import settings
from datetime import datetime

class EmailProcessor:
    def __init__(self):
        self.filter_keywords = ['support', 'query', 'request', 'help']
        self.urgent_keywords = [
            'urgent', 'immediate', 'immediately', 'critical', 
            'cannot access', 'blocked', 'down', 'never arrived',
            'reset link doesn\'t work', 'charged twice', 'error', 
            'inaccessible', 'billing error'
        ]
    
    def filter_support_emails(self, emails):
        filtered = []
        for email in emails:
            subject_lower = email.get('subject', '').lower()
            if any(keyword in subject_lower for keyword in self.filter_keywords):
                filtered.append(email)
        return filtered
    
    def analyze_sentiment(self, text):
        if not text:
            return 'Neutral'
            
        negative_words = [
            'error', 'problem', 'can\'t', 'cannot', 'unable', 
            'frustrated', 'down', 'critical', 'charged twice',
            'billing error', 'inaccessible', 'blocked'
        ]
        positive_words = [
            'thank', 'thanks', 'appreciate', 'great', 
            'happy', 'good', 'excellent', 'wonderful'
        ]
        
        text_lower = text.lower()
        negative_count = sum(1 for word in negative_words if word in text_lower)
        positive_count = sum(1 for word in positive_words if word in text_lower)
        
        if negative_count > positive_count:
            return 'Negative'
        elif positive_count > negative_count:
            return 'Positive'
        else:
            return 'Neutral'
    
    def determine_priority(self, text):
        if not text:
            return 'Not urgent'
            
        text_lower = text.lower()
        if any(keyword in text_lower for keyword in self.urgent_keywords):
            return 'Urgent'
        return 'Not urgent'
    
    def extract_contact_info(self, text):
        if not text:
            return ''
            
        emails = re.findall(r'\b[\w.-]+@[\w.-]+\.\w{2,4}\b', text)
        phones = re.findall(r'\b\d{10,12}\b', text)
        
        contact_info = []
        if emails:
            contact_info.extend(emails)
        if phones:
            contact_info.extend(phones)
            
        return ', '.join(contact_info) if contact_info else ''
    
    def summarize_request(self, text):
        if not text:
            return ''
            
        sentences = text.strip().split('.')
        if sentences:
            summary = sentences[0].strip()
            return summary[:120] + "..." if len(summary) > 120 else summary
        return text[:120] + "..." if len(text) > 120 else text

class AIResponder:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
    
    def generate_response(self, email_obj):
        if not settings.OPENAI_API_KEY:
            return self.generate_template_response(email_obj)
        
        prompt = f"""
        Generate a professional, empathetic customer support response to this email:
        
        From: {email_obj.sender}
        Subject: {email_obj.subject}
        Message: {email_obj.body}
        
        Customer sentiment: {email_obj.sentiment}
        Priority: {email_obj.priority}
        
        Guidelines:
        - Be professional and friendly
        - Acknowledge their concern empathetically
        - Provide helpful next steps
        - If urgent, show understanding of their situation
        - Keep response concise but complete
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful customer support assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self.generate_template_response(email_obj)
    
    def generate_template_response(self, email_obj):
        if email_obj.priority == 'Urgent':
            if email_obj.sentiment == 'Negative':
                return f"Thank you for reaching out regarding '{email_obj.subject}'. We understand your frustration and this is our top priority. Our technical team is investigating immediately and we'll provide an update within 2 hours."
            else:
                return f"Thank you for your urgent message about '{email_obj.subject}'. We've escalated this to our priority queue and will address it immediately. You can expect a detailed response within 2 hours."
        else:
            if email_obj.sentiment == 'Negative':
                return f"Thank you for contacting us about '{email_obj.subject}'. We sincerely apologize for any inconvenience. Our team will review your case carefully and provide a resolution within 24 hours."
            else:
                return f"Thank you for reaching out regarding '{email_obj.subject}'. We've received your message and our team will respond with the information you need within 24 hours."
