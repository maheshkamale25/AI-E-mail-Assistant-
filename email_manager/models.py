from django.db import models
from django.utils import timezone

class Email(models.Model):
    SENTIMENT_CHOICES = [
        ('Positive', 'Positive'),
        ('Negative', 'Negative'),
        ('Neutral', 'Neutral'),
    ]
    
    PRIORITY_CHOICES = [
        ('Urgent', 'Urgent'),
        ('Not urgent', 'Not urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('responded', 'Responded'),
        ('resolved', 'Resolved'),
    ]
    
    sender = models.EmailField()
    subject = models.CharField(max_length=500)
    body = models.TextField()
    sent_date = models.DateTimeField()
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='Neutral')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Not urgent')
    contact_info = models.TextField(blank=True)
    request_summary = models.TextField(blank=True)
    ai_response = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.sender} - {self.subject[:50]}"

class EmailAnalytics(models.Model):
    date = models.DateField(default=timezone.now)
    total_emails = models.IntegerField(default=0)
    urgent_emails = models.IntegerField(default=0)
    positive_sentiment = models.IntegerField(default=0)
    negative_sentiment = models.IntegerField(default=0)
    neutral_sentiment = models.IntegerField(default=0)
    resolved_emails = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['date']
        
    def __str__(self):
        return f"Analytics for {self.date}"
