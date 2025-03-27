import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Phone, FileText, Edit2, Camera, CheckCircle, X, AlertTriangle, 
  MapPin, Calendar, Clock, MessageSquare, Hash, AtSign
} from 'lucide-react';
import { fetchProfile, updateProfile, getAuthToken } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { TagInput } from '../components/TagInput';
import AlertMessage from '../components/AlertMessage';

const ProfileView = () => {
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
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for edited profile data
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    username: '',
    alternativeEmail: '',
    location: '',
    birthday: '',
    statusMessage: '',
    interests: [],
    timeZone: ''
  });
  
  // State for new profile picture
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // State for alerts/feedback
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Get authentication context
  const { isAuthenticated } = useAuth();
  
  // Fetch user profile from API - using useCallback to memoize the function
  const fetchUserProfile = useCallback(async () => {
    console.log('Fetching user profile...');
    setIsLoading(true);
    
    try {
      if (!getAuthToken()) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Use the fetchProfile utility function from api.js
      const response = await fetchProfile();
      
      console.log('Profile data received:', response.data);
      
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
      
      setEditedProfile({
        fullName: response.data.full_name || '',
        phoneNumber: response.data.phone_number || '',
        bio: response.data.bio || '',
        username: response.data.username || '',
        alternativeEmail: response.data.alternative_email || '',
        location: response.data.location || '',
        birthday: response.data.birthday || '',
        statusMessage: response.data.status_message || '',
        interests: response.data.interests || [],
        timeZone: response.data.time_zone || ''
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Improved error handling
      if (error.response) {
        if (error.response.status === 401) {
          showAlert('error', 'Your session has expired. Please log in again.');
        } else {
          showAlert('error', `Failed to load profile: ${error.response.data.detail || 'Server error'}`);
        }
      } else if (error.request) {
        showAlert('error', 'Network error. Please check your connection.');
      } else {
        showAlert('error', error.message || 'Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array because it doesn't depend on any props or state
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);
  
  // Reset form when canceling edit
  useEffect(() => {
    if (!isEditing) {
      setEditedProfile({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
        username: profile.username,
        alternativeEmail: profile.alternativeEmail,
        location: profile.location,
        birthday: profile.birthday,
        statusMessage: profile.statusMessage,
        interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
        timeZone: profile.timeZone
      });
      setNewProfilePicture(null);
      setPreviewUrl(null);
    }
  }, [isEditing, profile]);
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Profile picture must be less than 5MB');
        return;
      }
      
      setNewProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  // Handle interests change
  const handleInterestsChange = (tags) => {
    setEditedProfile({
      ...editedProfile,
      interests: tags
    });
  };
  
  // Validate profile data
  const validateProfile = () => {
    if (!editedProfile.fullName.trim()) {
      showAlert('error', 'Full name is required');
      return false;
    }
    
    // Add more validations if needed
    // For example, email format, phone number format, etc.
    
    return true;
  };
  
  // Save profile changes
  const saveProfile = async () => {
    console.log('Saving profile changes...');
    console.log('Data to save:', editedProfile);
    
    // Check for network connection
    if (!navigator.onLine) {
      showAlert('error', 'You appear to be offline. Please check your internet connection.');
      return;
    }
    
    // Validate profile data
    if (!validateProfile()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!getAuthToken()) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Add all fields to FormData
      formData.append('full_name', editedProfile.fullName.trim());
      
      // Optional fields - only add if they exist
      if (editedProfile.phoneNumber) formData.append('phone_number', editedProfile.phoneNumber);
      if (editedProfile.bio) formData.append('bio', editedProfile.bio);
      if (editedProfile.username) formData.append('username', editedProfile.username);
      if (editedProfile.alternativeEmail) formData.append('alternative_email', editedProfile.alternativeEmail);
      if (editedProfile.location) formData.append('location', editedProfile.location);
      if (editedProfile.birthday) formData.append('birthday', editedProfile.birthday);
      if (editedProfile.statusMessage) formData.append('status_message', editedProfile.statusMessage);
      if (editedProfile.timeZone) formData.append('time_zone', editedProfile.timeZone);
      
      // Handle interests array - convert to JSON string
      if (Array.isArray(editedProfile.interests) && editedProfile.interests.length > 0) {
        formData.append('interests', JSON.stringify(editedProfile.interests));
      } else {
        formData.append('interests', JSON.stringify([]));
      }
      
      // Add profile picture if selected
      if (newProfilePicture) {
        formData.append('profile_picture', newProfilePicture);
      }
      
      // Debug log what we're sending
      console.log('Sending update request with form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`);
      }
      
      // Use the updateProfile utility function from api.js
      const response = await updateProfile(formData);
      
      console.log('Profile updated successfully:', response.data);
      
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
      
      setIsEditing(false);
      showAlert('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 401) {
          showAlert('error', 'Authentication failed. Please log in again.');
        } else if (error.response.data.detail) {
          showAlert('error', error.response.data.detail);
        } else if (typeof error.response.data === 'object') {
          // Format field errors
          const errorMessages = [];
          Object.entries(error.response.data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors}`);
            }
          });
          showAlert('error', errorMessages.join('; '));
        } else {
          showAlert('error', `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        showAlert('error', 'No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        showAlert('error', error.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to show alerts
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    
    // Auto hide alert after 5 seconds
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };
  
  // Start editing profile
  const startEdit = () => {
    setEditedProfile({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      bio: profile.bio,
      username: profile.username,
      alternativeEmail: profile.alternativeEmail,
      location: profile.location,
      birthday: profile.birthday,
      statusMessage: profile.statusMessage,
      interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
      timeZone: profile.timeZone
    });
    setIsEditing(true);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setNewProfilePicture(null);
    setPreviewUrl(null);
  };
  
  return (
    <main className="flex-1 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
      {/* Alert banner */}
      <AlertMessage 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />
      
      {isLoading && !profile.email ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
            
            {!isEditing ? (
              <button 
                onClick={startEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button 
                  onClick={cancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
          
          {/* Rest of your JSX remains the same */}
          {/* User Identity Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 mb-6">
            {/* Same content */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                  {isEditing && previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt={profile.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label htmlFor="profile-picture" className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      id="profile-picture"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 w-full">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Full Name</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editedProfile.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Your full name"
                        required
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.fullName || 'Not set'}</p>
                    )}
                  </div>
                  
                  {/* Username */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                      <AtSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Username</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={editedProfile.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Your username"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.username || 'Not set'}</p>
                    )}
                  </div>
                  
                  {/* Status Message */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="statusMessage"
                        value={editedProfile.statusMessage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="What's on your mind?"
                        maxLength={100}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium italic">
                        {profile.statusMessage || 'No status set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              {/* Email (Primary) */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Primary Email</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{profile.email || 'Not set'}</p>
              </div>
              
              {/* Alternative Email */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Alternative Email</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    name="alternativeEmail"
                    value={editedProfile.alternativeEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Your alternative email"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{profile.alternativeEmail || 'Not set'}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editedProfile.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{profile.phoneNumber || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Personal Details */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Details</h2>
            
            <div className="space-y-4">
              {/* Bio */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">About Me</span>
                </div>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>
              
              {/* Location */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editedProfile.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.location || 'Not set'}
                  </p>
                )}
              </div>
              
              {/* Birthday */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Birthday</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthday"
                    value={editedProfile.birthday}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
              
              {/* Time Zone */}
              <div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Time Zone</span>
                </div>
                {isEditing ? (
                  <select
                    name="timeZone"
                    value={editedProfile.timeZone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="">Select a time zone</option>
                    <option value="UTC-12:00">UTC-12:00</option>
                    <option value="UTC-11:00">UTC-11:00</option>
                    <option value="UTC-10:00">UTC-10:00</option>
                    <option value="UTC-09:00">UTC-09:00</option>
                    <option value="UTC-08:00">UTC-08:00 (Pacific)</option>
                    <option value="UTC-07:00">UTC-07:00 (Mountain)</option>
                    <option value="UTC-06:00">UTC-06:00 (Central)</option>
                    <option value="UTC-05:00">UTC-05:00 (Eastern)</option>
                    <option value="UTC-04:00">UTC-04:00 (Atlantic)</option>
                    <option value="UTC-03:00">UTC-03:00</option>
                    <option value="UTC-02:00">UTC-02:00</option>
                    <option value="UTC-01:00">UTC-01:00</option>
                    <option value="UTC+00:00">UTC+00:00 (London)</option>
                    <option value="UTC+01:00">UTC+01:00 (Central Europe)</option>
                    <option value="UTC+02:00">UTC+02:00 (Eastern Europe)</option>
                    <option value="UTC+03:00">UTC+03:00 (Moscow)</option>
                    <option value="UTC+04:00">UTC+04:00</option>
                    <option value="UTC+05:00">UTC+05:00</option>
                    <option value="UTC+05:30">UTC+05:30 (India)</option>
                    <option value="UTC+05:45">UTC+05:45 (Nepal)</option>
                    <option value="UTC+06:00">UTC+06:00</option>
                    <option value="UTC+07:00">UTC+07:00</option>
                    <option value="UTC+08:00">UTC+08:00 (China)</option>
                    <option value="UTC+09:00">UTC+09:00 (Japan)</option>
                    <option value="UTC+10:00">UTC+10:00</option>
                    <option value="UTC+11:00">UTC+11:00</option>
                    <option value="UTC+12:00">UTC+12:00</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.timeZone || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Interests */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-3">
              <Hash className="w-4 h-4" />
              <span className="text-sm font-medium">Interests</span>
            </div>
            
            {isEditing ? (
              <TagInput
                tags={editedProfile.interests}
                onChange={handleInterestsChange}
                placeholder="Add interests (press Enter after each)"
                maxTags={10}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No interests added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfileView;