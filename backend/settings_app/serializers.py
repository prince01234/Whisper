from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserSettings
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for the complete UserSettings model"""
    class Meta:
        model = UserSettings
        exclude = ['user', 'created_at']
        read_only_fields = ['two_factor_enabled', 'updated_at']


class AppearanceSettingsSerializer(serializers.ModelSerializer):
    """Serializer for appearance settings only"""
    class Meta:
        model = UserSettings
        fields = ['dark_mode']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings only"""
    class Meta:
        model = UserSettings
        fields = ['push_notifications', 'email_notifications', 'message_preview', 'notification_sounds']


class PrivacySettingsSerializer(serializers.ModelSerializer):
    """Serializer for privacy settings only"""
    class Meta:
        model = UserSettings
        fields = ['online_status', 'read_receipts', 'last_seen', 'profile_visibility']


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        """Validate that the passwords match and meet requirements"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Validate password strength
        validate_password(data['new_password'])
        
        return data


class DeleteAccountSerializer(serializers.Serializer):
    """Serializer for account deletion confirmation"""
    password = serializers.CharField(required=True)