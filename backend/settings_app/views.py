from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .models import UserSettings
from .serializers import (
    UserSettingsSerializer,
    AppearanceSettingsSerializer,
    NotificationSettingsSerializer,
    PrivacySettingsSerializer,
    PasswordChangeSerializer,
    DeleteAccountSerializer
)

User = get_user_model()

class UserSettingsView(RetrieveUpdateAPIView):
    """View to get and update all user settings"""
    serializer_class = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get the settings for the current user"""
        # Settings should already exist due to the post_save signal
        return self.request.user.settings


class AppearanceSettingsView(RetrieveUpdateAPIView):
    """View to get and update appearance settings"""
    serializer_class = AppearanceSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.settings


class NotificationSettingsView(RetrieveUpdateAPIView):
    """View to get and update notification settings"""
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.settings


class PrivacySettingsView(RetrieveUpdateAPIView):
    """View to get and update privacy settings"""
    serializer_class = PrivacySettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.settings


class ChangePasswordView(APIView):
    """View to change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if current password is correct
            user = request.user
            if not check_password(serializer.validated_data['current_password'], user.password):
                return Response(
                    {"current_password": "Current password is incorrect"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set the new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"message": "Password updated successfully"}, 
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    """View to delete user account"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if password is correct
            user = request.user
            if not check_password(serializer.validated_data['password'], user.password):
                return Response(
                    {"password": "Password is incorrect"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete the user
            user.delete()
            
            return Response(
                {"message": "Account deleted successfully"}, 
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)