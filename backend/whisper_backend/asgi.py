"""
ASGI config for whisper_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whisper_backend.settings')

# Initialize the Django ASGI application first
django_asgi_app = get_asgi_application()

# Only import the rest after Django is fully loaded
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack

# For now, use a simple placeholder until we create the actual files
# This will allow the server to start without errors
application = ProtocolTypeRouter({
    "http": django_asgi_app,
})

# We'll update this with the actual WebSocket configuration once we create the required files