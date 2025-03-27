from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
import jwt
from django.conf import settings
import logging

logger = logging.getLogger('channels')
User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        # Validate the token and get the user ID
        # Using the same secret key as your JWT settings
        decoded_data = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256"]
        )
        user_id = decoded_data.get('user_id')
        
        if not user_id:
            # Try another common field name
            user_id = decoded_data.get('id') or decoded_data.get('sub')
            
        if not user_id:
            logger.warning(f"Could not find user_id in JWT token: {decoded_data}")
            return AnonymousUser()
            
        # Get the user from the database
        user = User.objects.get(id=user_id)
        return user
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return AnonymousUser()
    except jwt.ExpiredSignatureError:
        logger.warning("Expired JWT token")
        return AnonymousUser() 
    except User.DoesNotExist:
        logger.warning(f"User with ID {user_id} not found")
        return AnonymousUser()
    except Exception as e:
        logger.error(f"Error authenticating WebSocket: {str(e)}")
        return AnonymousUser()

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get the token from the query string
        query_string = scope.get("query_string", b"").decode()
        query_params = {}
        
        # Parse query parameters
        for param in query_string.split('&'):
            if param:
                key, value = param.split('=', 1) if '=' in param else (param, '')
                query_params[key] = value
        
        token = query_params.get("token", None)
        
        if token:
            # Get the user from the token
            scope["user"] = await get_user_from_token(token)
            logger.debug(f"WebSocket authenticated as {scope['user']}")
        else:
            logger.warning("No token provided for WebSocket authentication")
            scope["user"] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))