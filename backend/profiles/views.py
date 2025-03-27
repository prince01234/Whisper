import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Profile
from .serializers import ProfileSerializer

logger = logging.getLogger(__name__)

class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request):
        """Get the current user's profile"""
        try:
            profile, created = Profile.objects.get_or_create(
                user=request.user,
                defaults={'username': request.user.username}
            )
            
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.exception(f"Error retrieving profile: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Update the current user's profile"""
        try:
            # Debug logging
            logger.debug(f"User: {request.user.username}")
            logger.debug(f"Request data: {request.data}")
            
            # Get or create profile
            profile, created = Profile.objects.get_or_create(
                user=request.user,
                defaults={'username': request.user.username}
            )
            logger.debug(f"Profile found: {not created}, Created new: {created}")
            
            # Create a mutable copy of request.data if needed
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Handle interests field - convert from string to list if needed
            if 'interests' in data and isinstance(data['interests'], str):
                try:
                    # Parse JSON string to list
                    data['interests'] = json.loads(data['interests'])
                    logger.debug(f"Parsed interests: {data['interests']}")
                except json.JSONDecodeError:
                    logger.error("Invalid JSON format for interests")
                    return Response(
                        {"interests": ["Invalid JSON format"]},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Handle empty string fields that should be null
            date_fields = ['birthday']
            for field in date_fields:
                if field in data and data[field] == '':
                    data[field] = None
            
            # Create serializer
            serializer = ProfileSerializer(
                profile, 
                data=data, 
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                logger.debug(f"Profile updated successfully: {serializer.data}")
                return Response(serializer.data)
            else:
                logger.error(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.exception(f"Error updating profile: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )