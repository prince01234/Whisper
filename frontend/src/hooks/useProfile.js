import { useState } from 'react';
import axios from 'axios';

export const useProfile = () => {
  // State for user profile data
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profilePicture: null,
    username: '',
    alternativeEmail: '',
    location: '',
    birthday: '',
    statusMessage: '',
    interests: [],
    timeZone: ''
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for error
  const [error, setError] = useState(null);

  // Fetch user profile from API
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      // Map the Django field names to the React component field names
      setProfile({
        fullName: response.data.full_name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phone_number || '',
        bio: response.data.bio || '',
        profilePicture: response.data.profile_picture || null,
        username: response.data.username || '',
        alternativeEmail: response.data.alternative_email || '',
        location: response.data.location || '',
        birthday: response.data.birthday || '',
        statusMessage: response.data.status_message || '',
        interests: response.data.interests || [],
        timeZone: response.data.time_zone || ''
      });
      
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  // Save profile changes
  const updateProfile = async (profileData, profilePicture = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('full_name', profileData.fullName);
      formData.append('phone_number', profileData.phoneNumber);
      formData.append('bio', profileData.bio);
      formData.append('username', profileData.username);
      formData.append('alternative_email', profileData.alternativeEmail);
      formData.append('location', profileData.location);
      formData.append('birthday', profileData.birthday);
      formData.append('status_message', profileData.statusMessage);
      formData.append('interests', JSON.stringify(profileData.interests));
      formData.append('time_zone', profileData.timeZone);
      
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      
      const response = await axios.patch('/api/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      });
      
      // Map the response data back to our component's format
      setProfile({
        fullName: response.data.full_name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phone_number || '',
        bio: response.data.bio || '',
        profilePicture: response.data.profile_picture || null,
        username: response.data.username || '',
        alternativeEmail: response.data.alternative_email || '',
        location: response.data.location || '',
        birthday: response.data.birthday || '',
        statusMessage: response.data.status_message || '',
        interests: response.data.interests || [],
        timeZone: response.data.time_zone || ''
      });
      
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile
  };
};