import imaplib
import email
from email.header import decode_header
import os
from django.conf import settings

class EmailFetcher:
    def __init__(self):
        self.host = os.getenv('EMAIL_HOST', 'imap.gmail.com')
        self.port = int(os.getenv('EMAIL_PORT', 993))
        self.username = os.getenv('EMAIL_USER')
        self.password = os.getenv('EMAIL_PASS')
    
    def connect_and_fetch(self, limit=50):
        """Fetch recent emails from email account"""
        if not all([self.username, self.password]):
            return []
        
        try:
            mail = imaplib.IMAP4_SSL(self.host, self.port)
            mail.login(self.username, self.password)
            mail.select("inbox")
            
            status, messages = mail.search(None, "ALL")
            email_ids = messages[0].split()
            
            emails = []
            for email_id in email_ids[-limit:]:
                res, msg = mail.fetch(email_id, "(RFC822)")
                email_body = msg[0][1]
                email_message = email.message_from_bytes(email_body)
                
                emails.append({
                    'sender': email_message.get("From", ""),
                    'subject': email_message.get("Subject", ""),
                    'body': self.get_email_body(email_message),
                    'sent_date': email_message.get("Date", "")
                })
            
            mail.logout()
            return emails
        except Exception as e:
            print(f"Email fetch error: {e}")
            return []
    
    def get_email_body(self, email_message):
        """Extract email body text"""
        body = ""
        if email_message.is_multipart():
            for part in email_message.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode()
                    break
        else:
            body = email_message.get_payload(decode=True).decode()
        return body
