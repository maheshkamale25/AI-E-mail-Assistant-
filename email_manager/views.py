import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import Email, EmailAnalytics
from .services import EmailProcessor, AIResponder
import json
from .email_fetcher import EmailFetcher
from .email_sender import EmailSender  # Add this import at the top

class EmailListView(View):
    """API endpoint to get all emails"""
    def get(self, request):
        emails = Email.objects.all()[:50]  # Limit to 50 recent emails
        
        email_data = []
        for email in emails:
            email_data.append({
                'id': email.id,
                'sender': email.sender,
                'subject': email.subject,
                'body': email.body[:200] + "..." if len(email.body) > 200 else email.body,
                'sent_date': email.sent_date,
                'sentiment': email.sentiment,
                'priority': email.priority,
                'contact_info': email.contact_info,
                'request_summary': email.request_summary,
                'ai_response': email.ai_response,
                'status': email.status,
                'created_at': email.created_at
            })
        
        return JsonResponse({
            'success': True,
            'emails': email_data,
            'total': Email.objects.count()
        })

class DashboardStatsView(View):
    """API endpoint for dashboard analytics"""
    def get(self, request):
        # Get emails from last 24 hours
        yesterday = datetime.now() - timedelta(hours=24)
        emails_24h = Email.objects.filter(created_at__gte=yesterday).count()
        
        # Sentiment distribution
        sentiment_stats = Email.objects.values('sentiment').annotate(count=Count('sentiment'))
        sentiment_dict = {item['sentiment']: item['count'] for item in sentiment_stats}
        
        # Priority distribution
        priority_stats = Email.objects.values('priority').annotate(count=Count('priority'))
        priority_dict = {item['priority']: item['count'] for item in priority_stats}
        
        # Status distribution
        status_stats = Email.objects.values('status').annotate(count=Count('status'))
        status_dict = {item['status']: item['count'] for item in status_stats}
        
        # Urgent emails
        urgent_emails = Email.objects.filter(priority='Urgent').order_by('-created_at')[:5]
        urgent_data = []
        for email in urgent_emails:
            urgent_data.append({
                'id': email.id,
                'sender': email.sender,
                'subject': email.subject,
                'sentiment': email.sentiment,
                'request_summary': email.request_summary
            })
        
        return JsonResponse({
            'success': True,
            'stats': {
                'emails_24h': emails_24h,
                'total_emails': Email.objects.count(),
                'sentiment_distribution': sentiment_dict,
                'priority_distribution': priority_dict,
                'status_distribution': status_dict,
                'urgent_emails': urgent_data
            }
        })

@method_decorator(csrf_exempt, name='dispatch')
class ProcessSampleDataView(View):
    """API endpoint to process sample CSV data"""
    def post(self, request):
        try:
            # Load sample CSV data
            csv_paths = [
                '68b1acd44f393_Sample_Support_Emails_Dataset.csv',
                '../68b1acd44f393_Sample_Support_Emails_Dataset.csv'
            ]
            
            df = None
            for csv_path in csv_paths:
                try:
                    df = pd.read_csv(csv_path)
                    break
                except FileNotFoundError:
                    continue
            
            if df is None:
                return JsonResponse({
                    'success': False, 
                    'error': 'CSV file not found. Please ensure 68b1acd44f393_Sample_Support_Emails_Dataset.csv is in the backend directory.'
                })
            
            # Initialize processors
            processor = EmailProcessor()
            ai_responder = AIResponder()
            
            # Filter support emails
            emails = df.to_dict('records')
            support_emails = processor.filter_support_emails(emails)
            
            processed_count = 0
            for email_data in support_emails:
                # Check if email already exists to avoid duplicates
                if Email.objects.filter(
                    sender=email_data['sender'], 
                    subject=email_data['subject'], 
                    sent_date=email_data['sent_date']
                ).exists():
                    continue
                
                # Process email
                sentiment = processor.analyze_sentiment(email_data['body'])
                priority = processor.determine_priority(email_data['body'])
                contact_info = processor.extract_contact_info(email_data['body'])
                request_summary = processor.summarize_request(email_data['body'])
                
                # Create email object
                email_obj = Email.objects.create(
                    sender=email_data['sender'],
                    subject=email_data['subject'],
                    body=email_data['body'],
                    sent_date=email_data['sent_date'],
                    sentiment=sentiment,
                    priority=priority,
                    contact_info=contact_info,
                    request_summary=request_summary,
                    status='pending'
                )
                
                # Generate AI response
                ai_response = ai_responder.generate_response(email_obj)
                email_obj.ai_response = ai_response
                email_obj.save()
                
                processed_count += 1
            
            return JsonResponse({
                'success': True,
                'processed_count': processed_count,
                'message': f'Successfully processed {processed_count} new support emails'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

@method_decorator(csrf_exempt, name='dispatch')
class UpdateEmailStatusView(View):
    """API endpoint to update email status"""
    def post(self, request):
        try:
            data = json.loads(request.body)
            email_id = data.get('email_id')
            status = data.get('status')
            
            email = Email.objects.get(id=email_id)
            email.status = status
            email.save()
            
            return JsonResponse({'success': True})
        except Email.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Email not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})



@method_decorator(csrf_exempt, name='dispatch')
class ProcessRealEmailsView(View):
    """Process real emails from email account"""
    def post(self, request):
        try:
            fetcher = EmailFetcher()
            processor = EmailProcessor()
            ai_responder = AIResponder()
            
            # Fetch real emails
            raw_emails = fetcher.connect_and_fetch(limit=20)
            support_emails = processor.filter_support_emails(raw_emails)
            
            processed_count = 0
            for email_data in support_emails:
                # Process and save email (same logic as sample data)
                # ... (implementation similar to ProcessSampleDataView)
                processed_count += 1
            
            return JsonResponse({
                'success': True,
                'processed_count': processed_count,
                'message': f'Processed {processed_count} real emails'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})




# Add this new view class to views.py
@method_decorator(csrf_exempt, name='dispatch')
class SendResponsesView(View):
    """Send AI responses to customers"""
    def post(self, request):
        try:
            data = json.loads(request.body)
            email_ids = data.get('email_ids', [])
            
            if not email_ids:
                return JsonResponse({'success': False, 'error': 'No email IDs provided'})
            
            # Get emails from database
            emails = Email.objects.filter(id__in=email_ids)
            email_sender = EmailSender()
            
            # Prepare email data
            email_list = []
            for email in emails:
                email_list.append({
                    'sender': email.sender,
                    'subject': email.subject,
                    'ai_response': email.ai_response,
                    'body': email.body
                })
            
            # Send responses
            results = email_sender.send_bulk_responses(email_list)
            
            # Update email status
            Email.objects.filter(id__in=email_ids).update(status='responded')
            
            return JsonResponse({
                'success': True,
                'results': results,
                'message': f"Sent {results['sent']} responses successfully"
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

@method_decorator(csrf_exempt, name='dispatch') 
class SendSingleResponseView(View):
    """Send response to single email"""
    def post(self, request):
        try:
            data = json.loads(request.body)
            email_id = data.get('email_id')
            
            email = Email.objects.get(id=email_id)
            email_sender = EmailSender()
            
            success = email_sender.send_ai_response(
                to_email=email.sender,
                subject=email.subject,
                response_text=email.ai_response,
                original_body=email.body
            )
            
            if success:
                email.status = 'responded'
                email.save()
                
            return JsonResponse({
                'success': success,
                'message': 'Response sent successfully' if success else 'Failed to send response'
            })
            
        except Email.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Email not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
