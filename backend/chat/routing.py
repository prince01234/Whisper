from django.urls import re_path
from . import consumers  # We'll create this next

websocket_urlpatterns = [
    # Chat conversation WebSocket
    re_path(r'ws/chat/(?P<conversation_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
    
    # Online status WebSocket
    re_path(r'ws/online/$', consumers.OnlineStatusConsumer.as_asgi()),
]