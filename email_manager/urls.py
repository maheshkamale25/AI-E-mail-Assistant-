from django.urls import path
from . import views

urlpatterns = [
    path('emails/', views.EmailListView.as_view(), name='email_list'),
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    path('process-sample/', views.ProcessSampleDataView.as_view(), name='process_sample'),
    path('update-status/', views.UpdateEmailStatusView.as_view(), name='update_status'),
    path('send-responses/', views.SendResponsesView.as_view(), name='send_responses'),
    path('send-single-response/', views.SendSingleResponseView.as_view(), name='send_single_response'),
]
