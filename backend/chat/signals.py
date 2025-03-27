from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import logging
from .models import Message, Conversation

logger = logging.getLogger('channels')

@receiver(post_save, sender=Message)
def message_post_save(sender, instance, created, **kwargs):
    """
    When a new message is created, send a notification to the channel layer
    """
    if created:
        try:
            # Get the channel layer
            channel_layer = get_channel_layer()
            conversation_id = str(instance.conversation.id)
            
            # Notify all users in this conversation about the new message
            async_to_sync(channel_layer.group_send)(
                f'chat_{conversation_id}',
                {
                    'type': 'chat_message',
                    'message': instance.content,
                    'user_id': str(instance.sender.id),
                    'username': instance.sender.username,
                    'message_id': str(instance.id),
                    'timestamp': instance.timestamp.isoformat(),
                }
            )
            
            # Update the conversation's updated_at timestamp
            instance.conversation.save(update_fields=['updated_at'])
            
            logger.info(f"Message notification sent to conversation {conversation_id}")
        except Exception as e:
            logger.error(f"Error sending message notification: {str(e)}")