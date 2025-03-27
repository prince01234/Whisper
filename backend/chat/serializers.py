from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user information in chat context
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        
class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for messages
    """
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']
        
class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for conversations
    """
    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'name', 'participants', 'created_at', 'updated_at', 'is_group', 'last_message', 'unread_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def get_unread_count(self, obj):
        """
        Get the number of unread messages for the requesting user
        """
        user = self.context.get('request').user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
        
class ConversationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new conversation
    """
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Conversation
        fields = ['id', 'name', 'is_group', 'participant_ids']
        read_only_fields = ['id']
        
    def validate_participant_ids(self, value):
        # Make sure we have at least one other participant
        if len(value) < 1:
            raise serializers.ValidationError("At least one participant is required")
            
        # Check if all users exist
        user_count = User.objects.filter(id__in=value).count()
        if user_count != len(value):
            raise serializers.ValidationError("One or more users do not exist")
            
        return value
        
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids')
        user = self.context['request'].user
        
        # Add requesting user to participants
        if user.id not in participant_ids:
            participant_ids.append(user.id)
            
        is_group = validated_data.get('is_group', False) or len(participant_ids) > 2
        validated_data['is_group'] = is_group
        
        # For direct messages, check if conversation already exists
        if not is_group and len(participant_ids) == 2:
            conversations = Conversation.objects.filter(is_group=False)
            for conversation in conversations:
                participants = conversation.participants.all()
                if participants.count() == 2:
                    participant_ids_set = set(participant_ids)
                    conversation_participant_ids = set(str(p.id) for p in participants)
                    if participant_ids_set == conversation_participant_ids:
                        return conversation
        
        # Create the conversation
        conversation = Conversation.objects.create(**validated_data)
        
        # Add participants
        conversation.participants.add(*participant_ids)
        
        return conversation