from django.apps import AppConfig

class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'
    
    def ready(self):
        """
        Initialize signals and other components when the app is ready
        """
        # Import signals to register them
        try:
            import chat.signals
        except ImportError:
            pass