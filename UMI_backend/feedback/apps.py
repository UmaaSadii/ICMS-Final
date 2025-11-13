from django.apps import AppConfig

<<<<<<<< HEAD:UMI_backend/admin_management/apps.py
class AdminManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_management'
========

class FeedbackConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'feedback'
>>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119:UMI_backend/feedback/apps.py
