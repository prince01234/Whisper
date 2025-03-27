from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max, OuterRef, Subquery
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ConversationCreateSerializer
import logging

logger = logging.getLogger('django.request')

class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing conversations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Get conversations for the current user
        """
        user = self.request.user
        return Conversation.objects.filter(
            participants=user
        ).prefetch_related('participants')
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def get_serializer_context(self):
        """
        Pass request to serializer context
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Get all messages for a conversation
        """
        try:
            conversation = self.get_object()
            messages = conversation.messages.all().select_related('sender')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            return Response(
                {"error": "Failed to get messages"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark all messages in a conversation as read
        """
        try:
            conversation = self.get_object()
            messages = conversation.messages.filter(
                is_read=False
            ).exclude(sender=request.user)
            
            count = 0
            for message in messages:
                message.is_read = True
                message.save(update_fields=['is_read'])
                count += 1
                
            return Response({"marked_read": count})
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
            return Response(
                {"error": "Failed to mark messages as read"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing messages
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Get messages for a specific conversation
        """
        conversation_id = self.request.query_params.get('conversation')
        if not conversation_id:
            return Message.objects.none()
            
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.request.user
        ).select_related('sender')
    
    def perform_create(self, serializer):
        """
        Set the sender to the current user when creating a message
        """
        serializer.save(sender=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark a message as read
        """
        try:
            message = self.get_object()
            result = message.mark_as_read(request.user)
            return Response({"marked_read": result})
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return Response(
                {"error": "Failed to mark message as read"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )