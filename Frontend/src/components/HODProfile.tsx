import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface HODProfileData {
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  designation: string;
  specialization: string;
  experience_years: number;
  image: string | null;
  hire_date: string | null;
  date_of_birth: string | null;
  gender: string | null;
  is_active: boolean;
}

const HODProfile: React.FC = () => {
  const [profile, setProfile] = useState<HODProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    date_of_birth: '',
    gender: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (!storedAuth) {
        throw new Error('No authentication data found');
      }
      const authData = JSON.parse(storedAuth);
      const token = authData.access_token;

      const response = await axios.get('http://localhost:8000/api/register/hod/profile/', {
        headers: { Authorization: `Token ${token}` }
      });

      setProfile(response.data.profile);
      setFormData({
        name: response.data.profile.name || '',
        phone: response.data.profile.phone || '',
        specialization: response.data.profile.specialization || '',
        date_of_birth: response.data.profile.date_of_birth || '',
        gender: response.data.profile.gender || ''
      });
      setImagePreview(response.data.profile.image);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const storedAuth = localStorage.getItem('auth');
      if (!storedAuth) {
        throw new Error('No authentication data found');
      }
      const authData = JSON.parse(storedAuth);
      const token = authData.access_token;

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('specialization', formData.specialization);
      if (formData.date_of_birth) {
        formDataToSend.append('date_of_birth', formData.date_of_birth);
      }
      if (formData.gender) {
        formDataToSend.append('gender', formData.gender);
      }
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await axios.put('http://localhost:8000/api/register/hod/profile/', formDataToSend, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(response.data.profile);
      setIsEditing(false);
      setImageFile(null);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      const storedAuth = localStorage.getItem('auth');
      if (!storedAuth) {
        throw new Error('No authentication data found');
      }
      const authData = JSON.parse(storedAuth);
      const token = authData.access_token;

      await axios.delete('http://localhost:8000/api/register/hod/profile/', {
        headers: { Authorization: `Token ${token}` }
      });

      setImagePreview(null);
      if (profile) {
        setProfile({ ...profile, image: null });
      }
      alert('Profile picture deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setError(error.response?.data?.error || 'Failed to delete profile picture');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        specialization: profile.specialization || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || ''
      });
      setImagePreview(profile.image);
    }
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-white font-medium">
                      {profile.name?.charAt(0) || 'H'}
                    </span>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-blue-100">{profile.designation}</p>
                  <p className="text-blue-100">{profile.department}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl text-gray-400 font-medium">
                        {profile.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="space-y-2">
                      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-block transition-colors">
                        Upload New Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      {imagePreview && (
                        <button
                          onClick={handleDeleteImage}
                          className="block mx-auto text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{profile.phone || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="font-medium">{profile.employee_id}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Specialization</p>
                        <p className="font-medium">{profile.specialization || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{profile.experience_years} years</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">
                          {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : profile.gender === 'O' ? 'Other' : 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Hire Date</p>
                        <p className="font-medium">
                          {profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODProfile;