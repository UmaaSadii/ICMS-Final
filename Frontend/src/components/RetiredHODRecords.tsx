import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

interface RetiredHOD {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  phone: string;
  department_name: string;
  designation: string;
  experience_years: number;
  specialization: string;
  status: string;
  retired_at: string;
  retirement_reason?: string;
  image?: string;
}

const RetiredHODRecords: React.FC = () => {
  const navigate = useNavigate();
  const [retiredHods, setRetiredHods] = useState<RetiredHOD[]>([]);
  const [selectedHod, setSelectedHod] = useState<RetiredHOD | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch retired HODs from backend
  const fetchRetiredHODs = async () => {
    try {
      setLoading(true);
      console.log('Fetching retired HODs...');
      const response = await api.get('register/admin/retired-hods/');
      console.log('Retired HODs API response:', response.data);
      
      if (response.data.success) {
        setRetiredHods(response.data.data || []);
        console.log('Set retired HODs:', response.data.data?.length || 0, 'records');
      } else {
        console.error('API returned success=false:', response.data);
        setRetiredHods([]);
      }
    } catch (error: any) {
      console.error('Error fetching retired HODs:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('Access denied. You do not have permission to view retired HOD records.');
        navigate('/admin');
      } else {
        alert(error.message || 'Failed to load retired HOD records. Please try again.');
      }
      setRetiredHods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetiredHODs();
  }, []);

  const handleView = (hod: RetiredHOD) => {
    setSelectedHod(hod);
    setShowViewModal(true);
  };

  const refreshRecords = () => {
    fetchRetiredHODs();
  };

  const filteredHods = retiredHods.filter(hod => {
    const matchesSearch = hod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hod.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hod.department_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Retired HOD Records</h2>
            <p className="text-gray-600 mt-1">View and manage retired Head of Department records</p>
          </div>
        </div>
        <button
          onClick={refreshRecords}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {filteredHods.length} retired HOD{filteredHods.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading retired HOD records...</p>
        </div>
      ) : (
        /* HOD Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHods.map((hod) => (
            <motion.div
              key={hod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xl">
                    {hod.image ? (
                      <img src={hod.image} alt={hod.name} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      hod.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{hod.name}</h3>
                    <p className="text-sm text-gray-600">{hod.designation}</p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Retired
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{hod.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{hod.department_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Retired on {new Date(hod.retired_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{hod.specialization}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(hod)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredHods.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Retired HOD Records Found</h3>
          <p className="mt-1 text-sm text-gray-500 mb-4">
            {searchTerm ? 'No retired HOD records match your search criteria.' : 'There are currently no retired HOD records in the system.'}
          </p>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedHod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Retired HOD Profile Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-3xl">
                      {selectedHod.image ? (
                        <img src={selectedHod.image} alt={selectedHod.name} className="h-24 w-24 rounded-full object-cover" />
                      ) : (
                        selectedHod.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{selectedHod.name}</h4>
                      <p className="text-lg text-gray-600">{selectedHod.designation}</p>
                      <div className="flex items-center mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          ✓ Retired Status
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.department_name}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Specialization</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.specialization}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.experience_years} years</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedHod.employee_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Retirement Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">Retirement Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Retirement Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedHod.retired_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Retirement Reason</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedHod.retirement_reason || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetiredHODRecords;