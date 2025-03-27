import React, { useState } from 'react';
import { 
  User, Calendar, Phone, FileText, Image
} from 'lucide-react';
import { updateProfile, getAuthToken } from '../utils/api';
import AlertMessage from './AlertMessage';

const ProfileSetup = ({ onSkip, onComplete }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    birthday: '',
    profilePicture: null
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      
      // File size validation (optional)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert('error', 'Profile picture must be less than 5MB');
        setImageLoading(false);
        return;
      }
      
      setProfile({
        ...profile,
        profilePicture: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setImageLoading(false);
      };
      reader.onerror = () => {
        showAlert('error', 'Failed to load image preview');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!profile.fullName.trim()) {
      showAlert('error', 'Full name is required');
      return false;
    }
    
    // Phone number format validation (optional)
    if (profile.phoneNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(profile.phoneNumber)) {
      showAlert('error', 'Please enter a valid phone number');
      return false;
    }
    
    return true;
  };
  
  const saveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if user is online
    if (!navigator.onLine) {
      showAlert('error', 'You appear to be offline. Please check your internet connection.');
      setIsLoading(false);
      return;
    }

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      
      if (!token) {
        showAlert('error', 'No authentication token found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Create form data
      const formData = new FormData();
      
      formData.append('full_name', profile.fullName.trim());
      
      // Optional fields - only add if they have values
      if (profile.phoneNumber) formData.append('phone_number', profile.phoneNumber);
      if (profile.bio) formData.append('bio', profile.bio);
      if (profile.birthday) formData.append('birthday', profile.birthday);
      
      // Profile picture
      if (profile.profilePicture) {
        formData.append('profile_picture', profile.profilePicture);
      }
      
      // For debugging - log what we're sending
      console.log('Saving profile with data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }
      
      // Use the updateProfile utility function
      const response = await updateProfile(formData);
      
      console.log('Profile saved successfully:', response.data);
      showAlert('success', 'Profile updated successfully!');
      
      // Reset form
      setProfile({
        fullName: '',
        phoneNumber: '',
        bio: '',
        birthday: '',
        profilePicture: null
      });
      setPreviewUrl(null);
      
      // After a short delay, call the onComplete function to proceed
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        
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
        console.error('No response received:', error.request);
        showAlert('error', 'No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        showAlert('error', `Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    
    // Auto hide alert after 5 seconds (increased from 3)
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Alert banner */}
      <AlertMessage 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Tell us a little about yourself to get started
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={saveProfile} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 mb-4">
                {imageLoading ? (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="animate-spin h-10 w-10 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                
                <label htmlFor="profile-picture" className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                  <Image className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    id="profile-picture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={imageLoading}
                  />
                </label>
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Add a profile picture (optional)
              </label>
            </div>
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number (optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+1 (234) 567-8900"
                />
              </div>
            </div>
            
            {/* Birthday */}
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Birthday (optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                About Me (optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isLoading || !profile.fullName}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save & Continue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;