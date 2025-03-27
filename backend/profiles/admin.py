from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__email', 'full_name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'username', 'full_name', 'profile_picture')
        }),
        ('Contact Info', {
            'fields': ('phone_number', 'alternative_email', 'location')
        }),
        ('Personal Details', {
            'fields': ('bio', 'birthday', 'status_message', 'interests', 'time_zone')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )