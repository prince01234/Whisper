from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group', 'created_at', 'updated_at')
    list_filter = ('is_group', 'created_at')
    search_fields = ('name',)
    filter_horizontal = ('participants',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'conversation', 'short_content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp', 'sender')
    search_fields = ('content',)
    raw_id_fields = ('conversation', 'sender')
    readonly_fields = ('id', 'timestamp')
    
    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'