from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Conversation(models.Model):
    """
    Represents a conversation between users.
    Can be a direct message (2 participants) or a group chat (more than 2 participants).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=True, null=True)
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name or f"Conversation {self.id}"
    
    @property
    def last_message(self):
        """Get the last message of this conversation"""
        return self.messages.order_by('-timestamp').first()

class Message(models.Model):
    """
    Represents a message in a conversation
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"

    def mark_as_read(self, user):
        """Mark this message as read by a user"""
        if user != self.sender and not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])
            return True
        return False