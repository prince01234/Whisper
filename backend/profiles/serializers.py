from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'full_name', 'phone_number', 
            'bio', 'profile_picture', 'alternative_email', 'location', 'birthday', 
            'status_message', 'interests', 'time_zone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']
    
    def validate_interests(self, value):
        """Ensure interests is a list"""
        if value is not None and not isinstance(value, list):
            raise serializers.ValidationError("Interests must be a list")
        return value
    
    def validate_birthday(self, value):
        """Allow null birthday values"""
        if value == '':
            return None
        return value
    
    def to_representation(self, instance):
        """Add absolute URL for profile picture"""
        ret = super().to_representation(instance)
        if ret['profile_picture']:
            request = self.context.get('request')
            if request is not None:
                ret['profile_picture'] = request.build_absolute_uri(ret['profile_picture'])
        return ret