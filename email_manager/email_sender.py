import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.from_email = getattr(settings, 'EMAIL_HOST_USER', 'noreply@ai-assistant.com')
    
    def send_ai_response(self, to_email, subject, response_text, original_body=""):
        """Send AI-generated response to customer"""
        try:
            # Create response email subject
            response_subject = f"Re: {subject}"
            
            # Create professional email body
            email_body = f"""Dear Valued Customer,

{response_text}

If you have any further questions, please don't hesitate to reach out to us.

Best regards,
AI Support Team

---
Original Message:
{original_body[:200]}...
            """
            
            print(f"\n📧 SENDING EMAIL RESPONSE:")
            print(f"To: {to_email}")
            print(f"Subject: {response_subject}")
            print(f"Body: {email_body[:200]}...")
            print("-" * 50)
            
            # Send email using Django's built-in send_mail
            try:
                success = send_mail(
                    subject=response_subject,
                    message=email_body,
                    from_email=self.from_email,
                    recipient_list=[to_email],
                    fail_silently=False
                )
                
                if success:
                    print(f"✅ Email sent successfully to {to_email}")
                    return True
                else:
                    print(f"❌ Failed to send email to {to_email}")
                    return False
                    
            except Exception as email_error:
                print(f"❌ Email send error: {email_error}")
                # For development, we'll consider console output as success
                if 'console' in str(settings.EMAIL_BACKEND).lower():
                    print("📝 Email printed to console (development mode)")
                    return True
                return False
                
        except Exception as e:
            print(f"❌ General error: {e}")
            return False
    
    def send_bulk_responses(self, email_list):
        """Send responses to multiple emails"""
        sent_count = 0
        failed_count = 0
        
        print(f"\n📧 PROCESSING {len(email_list)} EMAILS FOR BULK SEND:")
        
        for i, email_data in enumerate(email_list, 1):
            print(f"\n{i}. Processing email from {email_data['sender']}")
            success = self.send_ai_response(
                to_email=email_data['sender'],
                subject=email_data['subject'], 
                response_text=email_data['ai_response'],
                original_body=email_data['body']
            )
            
            if success:
                sent_count += 1
                print(f"   ✅ Success")
            else:
                failed_count += 1
                print(f"   ❌ Failed")
        
        print(f"\n📊 BULK SEND SUMMARY:")
        print(f"✅ Sent: {sent_count}")
        print(f"❌ Failed: {failed_count}")
        print(f"📋 Total: {sent_count + failed_count}")
        
        return {
            'sent': sent_count,
            'failed': failed_count,
            'total': sent_count + failed_count
        }
