from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

class UserSettings(models.Model):
    """Model to store user settings and preferences"""
    
    # User relationship - one-to-one with User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Appearance Settings
    dark_mode = models.BooleanField(default=False)
    
    # Notification Settings
    push_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=False)
    message_preview = models.BooleanField(default=True)
    notification_sounds = models.BooleanField(default=True)
    
    # Privacy Settings
    VISIBILITY_CHOICES = [
        ('everyone', 'Everyone'),
        ('contacts', 'Contacts Only'),
        ('none', 'Nobody'),
    ]
    
    online_status = models.BooleanField(default=True)
    read_receipts = models.BooleanField(default=True)
    last_seen = models.BooleanField(default=True)
    profile_visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='everyone')
    
    # Security Settings
    two_factor_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s settings"


# Signal to create settings for new users
@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Create UserSettings when a new User is created"""
    if created:
        UserSettings.objects.create(user=instance)