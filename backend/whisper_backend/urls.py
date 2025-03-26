"""
URL configuration for whisper_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),  
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    path('accounts/', include('allauth.urls')),

    
    path(
        'password-reset-confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='account/password_reset_from_key.html'
        ),
        name='password_reset_confirm',
    ),

    # Password reset done
    path(
        'password-reset-complete/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='account/password_reset_from_key_done.html'
        ),
        name='password_reset_complete',
    ),

    # Password reset email sent
    path(
        'password-reset/done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='account/password_reset_done.html'
        ),
        name='password_reset_done',
    ),
    
    # Password reset form
    path(
        'email-confirmation-success/',
        TemplateView.as_view(template_name='account/email_confirmation_success.html'),
        name='account_email_confirmation_success',
    ),    

    #for settings
    path('api/settings/', include('settings_app.urls')),

    #for profiles
    path('api/', include('profiles.urls')),
    ]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)