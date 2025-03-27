import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import logging
from asgiref.sync import sync_to_async
from .models import Conversation, Message  
logger = logging.getLogger('channels')
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connect to a WebSocket for a specific chat conversation
        """
        self.user = self.scope["user"]
        logger.debug(f"WebSocket connect attempt by user: {self.user}")
        
        # Reject the connection if the user is not authenticated
        if self.user.is_anonymous:
            logger.warning(f"WebSocket connection rejected: Anonymous user")
            await self.close(code=4001)  # Custom code for authentication failure
            return
            
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        logger.info(f"User {self.user.username} attempting to join conversation {self.conversation_id}")
        
        # Check if the user is allowed to join this conversation
        try:
            has_access = await self.user_in_conversation(self.user.id, self.conversation_id)
            if not has_access:
                logger.warning(f"WebSocket connection rejected: User {self.user.username} not in conversation {self.conversation_id}")
                await self.close(code=4003)  # Custom code for permission denied
                return
        except Exception as e:
            logger.error(f"Error checking user access: {str(e)}")
            await self.close(code=4000)
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"User {self.user.username} joined conversation {self.conversation_id}")
        
        # Notify others that user has joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': self.user.id,
                'username': self.user.username,
            }
        )
    
    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnect
        """
        # Leave room group
        if hasattr(self, 'room_group_name') and hasattr(self, 'user') and not self.user.is_anonymous:
            logger.info(f"User {self.user.username} disconnected from conversation {getattr(self, 'conversation_id', 'unknown')}")
            
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            # Notify others that user has left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_leave',
                    'user_id': self.user.id,
                    'username': self.user.username,
                }
            )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        """
        Receive message from WebSocket and forward to group
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'chat_message')
            
            if message_type == 'chat_message':
                message = data.get('message', '')
                if not message:
                    logger.warning(f"Empty message received from user {self.user.username}")
                    return
                    
                logger.info(f"Received message from {self.user.username} in conversation {self.conversation_id}")
                
                # Save message to database
                try:
                    message_obj = await self.save_message(message)
                    
                    # Send message to room group
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': message,
                            'user_id': self.user.id,
                            'username': self.user.username,
                            'message_id': str(message_obj.id),
                            'timestamp': message_obj.timestamp.isoformat(),
                        }
                    )
                except Exception as e:
                    logger.error(f"Error saving message: {str(e)}")
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Failed to save message',
                    }))
                    
            elif message_type == 'typing':
                # Broadcast typing status
                logger.debug(f"User {self.user.username} typing status update in conversation {self.conversation_id}")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'is_typing': data.get('is_typing', False)
                    }
                )
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from user {self.user.username}")
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
    
    # Event handler for chat messages
    async def chat_message(self, event):
        """
        Send message to WebSocket
        """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user_id': event['user_id'],
            'username': event['username'],
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
        }))
    
    # Event handler for user join notifications
    async def user_join(self, event):
        """
        Send user join notification to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
    
    # Event handler for user leave notifications
    async def user_leave(self, event):
        """
        Send user leave notification to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
    
    # Event handler for typing status
    async def user_typing(self, event):
        """
        Send typing status to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing'],
        }))
    
    # Database operations
    @database_sync_to_async
    def save_message(self, content):
        """
        Save message to database
        """
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                is_read=False
            )
            return message
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            raise
    
    @database_sync_to_async
    def user_in_conversation(self, user_id, conversation_id):
        """
        Check if user is a participant in the conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.participants.filter(id=user_id).exists()
        except Conversation.DoesNotExist:
            logger.warning(f"Conversation {conversation_id} does not exist")
            return False
        except Exception as e:
            logger.error(f"Error checking if user is in conversation: {str(e)}")
            return False


class OnlineStatusConsumer(AsyncWebsocketConsumer):
    """
    Consumer for tracking online status of users
    """
    async def connect(self):
        self.user = self.scope["user"]
        
        # Reject the connection if the user is not authenticated
        if self.user.is_anonymous:
            logger.warning("Online status WebSocket connection rejected: Anonymous user")
            await self.close(code=4001)
            return
            
        self.room_group_name = 'online_status'
        logger.info(f"User {self.user.username} connecting to online status")
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Broadcast user's online status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'username': self.user.username,
                'status': 'online',
            }
        )
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and hasattr(self, 'user') and not self.user.is_anonymous:
            logger.info(f"User {self.user.username} disconnected from online status")
            
            # Broadcast user's offline status
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'status': 'offline',
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    # Event handler for user status updates
    async def user_status(self, event):
        """
        Send status to WebSocket
        """
        # Send status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'username': event['username'],
            'status': event['status'],
        }))