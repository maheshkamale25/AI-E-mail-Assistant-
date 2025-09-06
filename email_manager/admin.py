from django.contrib import admin
from .models import Email, EmailAnalytics

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ['sender', 'subject', 'sentiment', 'priority', 'status', 'created_at']
    list_filter = ['sentiment', 'priority', 'status', 'created_at']
    search_fields = ['sender', 'subject', 'body']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(EmailAnalytics)
class EmailAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_emails', 'urgent_emails', 'resolved_emails']
    list_filter = ['date']
