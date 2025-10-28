from django.apps import AppConfig


class DocumentRequestsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.document_requests'
    
    def ready(self):
        # Import signal handlers
        import backend.document_requests.signals

