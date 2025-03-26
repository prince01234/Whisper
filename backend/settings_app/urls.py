from django.urls import path
from .views import (
    UserSettingsView,
    AppearanceSettingsView,
    NotificationSettingsView,
    PrivacySettingsView,
    ChangePasswordView,
    DeleteAccountView
)

urlpatterns = [
    path('', UserSettingsView.as_view(), name='settings'),
    path('appearance/', AppearanceSettingsView.as_view(), name='appearance-settings'),
    path('notifications/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('privacy/', PrivacySettingsView.as_view(), name='privacy-settings'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
]