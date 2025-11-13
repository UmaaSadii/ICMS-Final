import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { instructorService } from '../api/studentInstructorService';
import TimetableManagement from '../components/TimetableManagement';
<<<<<<< HEAD

type TabId = 'dashboard' | 'instructors' | 'attendance' | 'timetable' | 'my-attendance';
=======
import InstructorProfile from '../components/InstructorProfile';
import HODProfile from '../components/HODProfile';
import HODFeedbackModal from "../components/HODFeedbackModal";


type TabId = 'dashboard' | 'instructors' | 'attendance' | 'timetable' | 'my-attendance' | 'profile';
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119

const HODDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalInstructors: 0, presentToday: 0, classesToday: 0 });
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hodProfile, setHodProfile] = useState<any>(null);
<<<<<<< HEAD
=======
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);

>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119

  // Load real data
  useEffect(() => {
    loadInstructors();
    loadHODProfile();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getAllInstructors();
      setInstructors(response.data);
      setStats(prev => ({ ...prev, totalInstructors: response.data.length }));
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHODProfile = async () => {
    try {
<<<<<<< HEAD
      const token = JSON.parse(sessionStorage.getItem("auth") || localStorage.getItem("auth") || "{}")?.access_token;
      if (token) {
        const response = await fetch('http://127.0.0.1:8000/api/hods/profile/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHodProfile(data);
        } else {
          console.error('Failed to fetch HOD profile:', response.status);
=======
      // Get HOD profile using current user info
      const token = localStorage.getItem('token');
      if (token) {
        const profileResponse = await fetch('http://localhost:8000/api/instructors/profile/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('HOD profile data:', profileData);
          setHodProfile(profileData);
        } else {
          console.error('Profile fetch failed:', profileResponse.status, profileResponse.statusText);
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        }
      }
    } catch (error) {
      console.error('Error loading HOD profile:', error);
    }
  };

  const markInstructorAttendance = async (instructorId: number, status: string) => {
    try {
<<<<<<< HEAD
      const token = JSON.parse(sessionStorage.getItem("auth") || localStorage.getItem("auth") || "{}")?.access_token || sessionStorage.getItem('token') || localStorage.getItem('token');
      await fetch('http://127.0.0.1:8000/api/academics/hod/attendance/', {
=======
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/academics/hod/attendance/', {
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instructor_id: instructorId, status, date: new Date().toISOString().split('T')[0] })
      });
      loadInstructors();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'instructors', label: 'Instructors', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 016 0z' },
    { id: 'attendance', label: 'Instructor Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6m-3-7h.01' },
    { id: 'my-attendance', label: 'My Attendance', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'timetable', label: 'Timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
  ];

<<<<<<< HEAD
=======
  const profileTab = { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' };

>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
  const renderSidebar = () => (
    <div className="w-64 bg-gradient-to-b from-purple-800 to-indigo-900 text-white p-4 space-y-2 min-h-screen shadow-xl">
      <div className="mb-8 text-center">
        <div className="h-16 w-16 rounded-full bg-white mx-auto mb-2 flex items-center justify-center">
          <svg className="h-10 w-10 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>
        </div>
        <h3 className="text-base font-medium">HOD Portal</h3>
        <p className="text-xs text-purple-200">{currentUser?.name || 'Head of Department'}</p>
        {hodProfile?.department && (
          <p className="text-xs text-purple-100 mt-1">
            HOD of {hodProfile.department.name}
          </p>
        )}

      </div>

      <nav>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-purple-700 text-white' : 'text-purple-100 hover:bg-purple-700'
                }`}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
<<<<<<< HEAD
=======
          <li>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-purple-700 text-white' : 'text-purple-100 hover:bg-purple-700'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profileTab.icon} />
              </svg>
              <span>{profileTab.label}</span>
            </button>
          </li>
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        </ul>
        <div className="mt-8">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Instructors</p>
              <p className="text-xl font-semibold text-purple-600">{stats.totalInstructors}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Present Today</p>
              <p className="text-xl font-semibold text-green-600">10</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Classes Today</p>
              <p className="text-xl font-semibold text-blue-600">8</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Department Rating</p>
              <p className="text-xl font-semibold text-yellow-600">4.8/5</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-base font-medium mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">New instructor added to Computer Science</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Timetable updated for Semester 3</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const deleteInstructor = async (instructorId: number, instructorName: string) => {
    if (window.confirm(`Are you sure you want to delete ${instructorName}? This action cannot be undone.`)) {
      try {
<<<<<<< HEAD
        const token = JSON.parse(sessionStorage.getItem("auth") || localStorage.getItem("auth") || "{}")?.access_token || sessionStorage.getItem('token') || localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/instructors/${instructorId}/`, {
=======
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/instructors/${instructorId}/`, {
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          loadInstructors(); // Refresh the list
          alert(`${instructorName} has been deleted successfully.`);
        } else {
          alert('Failed to delete instructor.');
        }
      } catch (error) {
        console.error('Error deleting instructor:', error);
        alert('Error deleting instructor.');
      }
    }
  };

  const renderInstructors = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-medium">Department Instructors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor.employee_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor.specialization || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => markInstructorAttendance(instructor.id, 'Present')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markInstructorAttendance(instructor.id, 'Absent')}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => deleteInstructor(instructor.id, instructor.name)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'instructors':
        return renderInstructors();
      case 'timetable':
        return <TimetableManagement />;
      case 'attendance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h3 className="text-base font-medium mb-4">Instructor Attendance</h3>
            <p className="text-gray-600">Instructor attendance management coming soon...</p>
          </motion.div>
        );
      case 'my-attendance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h3 className="text-base font-medium mb-4">My Attendance</h3>
            <p className="text-gray-600">Your attendance record will be displayed here...</p>
          </motion.div>
        );
<<<<<<< HEAD
=======
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HODProfile />
          </motion.div>
        );
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg border-b border-purple-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
<<<<<<< HEAD
              {/* Profile Picture */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                title="View Profile"
              >
                {hodProfile?.image ? (
                  <img
                    src={hodProfile.image}
=======
              <button
             onClick={() => setOpenFeedbackModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-md"
             >
             View Feedbacks
             </button>
             <HODFeedbackModal
  isOpen={openFeedbackModal}
  onClose={() => setOpenFeedbackModal(false)}
/>


              {/* Profile Picture */}
              <button
                onClick={() => {
                  console.log('Profile clicked - opening editable profile modal');
                  setShowProfileModal(true);
                }}
                className="relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                title="Edit Profile"
              >
                {hodProfile?.image ? (
                  <img
                    src={hodProfile.image.startsWith('http') ? hodProfile.image : `http://localhost:8000${hodProfile.image}`}
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
                    alt="Profile"
                    className="h-12 w-12 rounded-full border-2 border-white shadow-lg hover:border-purple-200 transition-colors duration-200 object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', hodProfile.image);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="h-12 w-12 rounded-full bg-white bg-opacity-20 border-2 border-white flex items-center justify-center hover:border-purple-200 transition-colors duration-200"
                  style={{ display: hodProfile?.image ? 'none' : 'flex' }}
                >
                  {hodProfile?.name ? (
                    <span className="text-lg font-semibold text-white">
                      {hodProfile.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </button>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-purple-100 mt-1 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Welcome back, {hodProfile?.name || currentUser?.name || 'Head of Department'}
                  {hodProfile?.department && (
                    <span className="ml-2 text-purple-200">
                      • HOD of {hodProfile.department.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">

            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">HOD Dashboard</h1>
            <p className="text-gray-600">Manage your department efficiently</p>
          </div>
          {renderContent()}
        </main>
      </div>
      {/* Editable Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-semibold text-gray-800">HOD Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
<<<<<<< HEAD
              {hodProfile ? (
                <div className="space-y-6">
                  {/* Main Profile Card */}
                  <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                      <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Image */}
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                            {hodProfile.image ? (
                              <img
                                src={hodProfile.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                <span className="text-4xl font-bold text-purple-600">
                                  {hodProfile.name?.charAt(0) || 'H'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-green-400 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="text-center md:text-left flex-1">
                          <h1 className="text-3xl font-bold mb-2">{hodProfile.name}</h1>
                          <p className="text-xl opacity-90 mb-1">{hodProfile.designation}</p>
                          <p className="text-lg opacity-80 mb-3">{hodProfile.department?.name || 'Department'}</p>
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                              ID: {hodProfile.employee_id}
                            </span>
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                              {hodProfile.experience_years}+ Years Experience
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Information Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h2>
                      
                      <div className="space-y-4">
                        {[
                          ["Email", hodProfile.email],
                          ["Phone", hodProfile.phone],
                          ["Employee ID", hodProfile.employee_id],
                          ["Hire Date", hodProfile.hire_date ? new Date(hodProfile.hire_date).toLocaleDateString() : "N/A"]
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-gray-600">{label}</span>
                            <span className="text-gray-800 text-right max-w-xs truncate">{value || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        Professional Details
                      </h2>
                      
                      <div className="space-y-4">
                        {[
                          ["Department", hodProfile.department?.name],
                          ["Designation", hodProfile.designation],
                          ["Specialization", hodProfile.specialization],
                          ["Experience", `${hodProfile.experience_years} years`],
                          ["Status", "Active"]
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-gray-600">{label}</span>
                            <span className="text-gray-800 font-semibold">{value || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Profile last updated on <span className="font-medium text-purple-600">{new Date().toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              )}
=======
              <HODProfile />
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;