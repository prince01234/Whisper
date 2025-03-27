from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Basic profile fields
    full_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    # Additional profile fields
    username = models.CharField(max_length=30, blank=True)  # Denormalized from User for flexibility
    alternative_email = models.EmailField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    birthday = models.DateField(null=True, blank=True)
    status_message = models.CharField(max_length=150, blank=True)
    interests = models.JSONField(default=list, blank=True)
    time_zone = models.CharField(max_length=50, blank=True)
    
    # Meta fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"

    def save(self, *args, **kwargs):
        # If username is not set, use the user's username
        if not self.username:
            self.username = self.user.username
        super().save(*args, **kwargs)

# Create Profile when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance, 
            username=instance.username
        )

# Save Profile when User is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(
            user=instance,
            username=instance.username
        )