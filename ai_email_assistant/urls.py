from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        'message': 'AI Email Assistant API is running',
        'version': '1.0',
        'endpoints': {
            'Admin Panel': '/admin/',
            'Email List': '/api/emails/',
            'Dashboard Stats': '/api/stats/',
            'Process Sample Data': '/api/process-sample/',
            'Update Email Status': '/api/update-status/'
        },
        'status': 'active'
    })

def api_index(request):
    return JsonResponse({
        'api_name': 'AI Email Assistant API',
        'available_endpoints': [
            {'url': '/api/emails/', 'method': 'GET', 'description': 'Get all processed emails'},
            {'url': '/api/stats/', 'method': 'GET', 'description': 'Get dashboard analytics'},
            {'url': '/api/process-sample/', 'method': 'POST', 'description': 'Process sample CSV data'},
            {'url': '/api/update-status/', 'method': 'POST', 'description': 'Update email status'}
        ]
    })

urlpatterns = [
    path('', home_view, name='home'),           # Home page at /
    path('api/', api_index, name='api_index'), # API index at /api/
    path('admin/', admin.site.urls),
    path('api/', include('email_manager.urls')),
]
