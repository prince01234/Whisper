from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
import json

from .models import Profile
from .serializers import ProfileSerializer

class ProfileView(APIView):
    """
    API view for retrieving and updating user profiles.
    GET: Retrieve the authenticated user's profile
    PATCH: Update the authenticated user's profile
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Get the user's profile"""
        profile = get_object_or_404(Profile, user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update the user's profile"""
        profile = get_object_or_404(Profile, user=request.user)
        
        # Handle JSON fields (for interests array)
        if 'interests' in request.data:
            try:
                # Try to make the QueryDict mutable
                try:
                    request.data._mutable = True
                except AttributeError:
                    pass  # Data is already mutable
                
                # Convert interests string to JSON
                request.data['interests'] = json.loads(request.data['interests'])
                
                # Try to make it immutable again
                try:
                    request.data._mutable = False
                except AttributeError:
                    pass
            except json.JSONDecodeError:
                return Response({"error": "Invalid interests format"}, status=400)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)