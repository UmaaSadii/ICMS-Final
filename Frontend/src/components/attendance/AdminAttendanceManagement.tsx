import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  id: number;
  student_id: string;
  student_name: string;
<<<<<<< HEAD
  instructor_name: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  is_submitted: boolean;
  can_edit: boolean;
  marked_at: string;
  updated_at: string;
}

interface AttendanceData {
  organized_data: { [dept: string]: { [sem: string]: StudentRecord[] } };
  statistics: {
    total_students: number;
    total_records: number;
    present: number;
    absent: number;
    late: number;
  };
}

interface StudentRecord {
  student_id: string;
  student_name: string;
  email: string;
  phone?: string;
  attendance?: {
    id: number;
    status: string;
    instructor: string;
    course: {
      name: string;
      code: string;
    };
    time_slot: string;
    room: string;
    marked_at: string;
    is_submitted: boolean;
    can_edit: boolean;
  };
}

interface EditPermissionRequest {
  id: number;
  instructor: {
    id: number;
    name: string;
    email: string;
  };
  student: {
    id: string;
    name: string;
  };
  course: {
    id: number;
    name: string;
    code: string;
  };
  timetable: {
    day: string;
    time: string;
    room: string;
  };
  date: string;
  current_status: string;
  proposed_status: string;
  reason: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

const AdminAttendanceManagement: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [editRequests, setEditRequests] = useState<EditPermissionRequest[]>([]);
=======
  course_name: string;
  instructor_name: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  is_locked: boolean;
}

const AdminAttendanceManagement: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    departmentId: '',
    semesterId: '',
    instructorId: ''
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'attendance' | 'requests'>('attendance');
  const [selectedRequest, setSelectedRequest] = useState<EditPermissionRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchFilterData();
    fetchEditRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceRecords();
    }
  }, [selectedDate, filters, activeTab]);
=======

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate, filters]);
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119

  const fetchFilterData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const [deptRes, semRes, instRes] = await Promise.all([
        fetch('http://localhost:8000/api/academics/departments/', {
          headers: { Authorization: `Token ${token}` }
        }),
        fetch('http://localhost:8000/api/academics/semesters/', {
          headers: { Authorization: `Token ${token}` }
        }),
        fetch('http://localhost:8000/api/instructors/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(Array.isArray(deptData) ? deptData : deptData.data || []);
      }
      if (semRes.ok) {
        const semData = await semRes.json();
        setSemesters(Array.isArray(semData) ? semData : semData.data || []);
      }
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstructors(Array.isArray(instData) ? instData : instData.data || []);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      const params = new URLSearchParams();
      
      if (selectedDate) params.append('date', selectedDate);
      if (filters.departmentId) params.append('department_id', filters.departmentId);
      if (filters.semesterId) params.append('semester_id', filters.semesterId);
      if (filters.instructorId) params.append('instructor_id', filters.instructorId);

      const response = await fetch(`http://localhost:8000/api/academics/admin/attendance/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
<<<<<<< HEAD
        setAttendanceData(data);
=======
        setAttendanceRecords(data.records || []);
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const fetchEditRequests = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const response = await fetch('http://127.0.0.1:8000/api/academics/admin/attendance/permissions/', {
        headers: { Authorization: `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin edit requests data:', data);
        setEditRequests(data.pending_requests || data.requests || []);
      } else {
        console.error('Failed to fetch edit requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching edit requests:', error);
    }
  };

  const handleEditRequest = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const response = await fetch('http://localhost:8000/api/academics/admin/attendance/permissions/', {
        method: 'POST',
=======
  const updateAttendanceRecord = async (recordId: number, newStatus: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const response = await fetch(`http://localhost:8000/api/academics/admin/attendance/${recordId}/`, {
        method: 'PATCH',
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
<<<<<<< HEAD
        body: JSON.stringify({
          permission_id: requestId,
          action: action,
          admin_notes: adminNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchEditRequests();
        if (action === 'approve') {
          fetchAttendanceRecords();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error handling edit request:', error);
      alert('Failed to process request');
=======
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAttendanceRecords();
        alert('Attendance updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update attendance'}`);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const unlockAttendanceRecord = async (recordId: number) => {
    if (!window.confirm('Are you sure you want to unlock this attendance record for editing?')) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const response = await fetch(`http://localhost:8000/api/academics/admin/attendance/${recordId}/unlock/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchAttendanceRecords();
        alert('Attendance record unlocked successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to unlock attendance'}`);
      }
    } catch (error) {
      console.error('Error unlocking attendance:', error);
      alert('Failed to unlock attendance');
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
<<<<<<< HEAD
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Attendance Management</h2>
        <p className="text-gray-600 mb-6">Manage attendance records and approve edit requests from instructors.</p>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'attendance'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance Records
          </button>
          <button
            onClick={() => {
              setActiveTab('requests');
              fetchEditRequests(); // Refresh when switching to requests tab
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit Requests ({editRequests.length})
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchEditRequests();
              }}
              className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
            >
              Refresh
            </button>
          </button>
        </div>

        {/* Filters - Only show for attendance tab */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.departmentId}
                onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={filters.semesterId}
                onChange={(e) => setFilters({...filters, semesterId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
              <select
                value={filters.instructorId}
                onChange={(e) => setFilters({...filters, instructorId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Instructors</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'attendance' ? (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading attendance records...</p>
              </div>
            ) : attendanceData ? (
              <div className="space-y-6">
                {/* Professional Statistics Dashboard */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-blue-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-blue-600">Total Students</h4>
                      <p className="text-2xl font-bold text-blue-900">{attendanceData.statistics.total_students}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-gray-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mx-auto mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-gray-600">Records</h4>
                      <p className="text-2xl font-bold text-gray-900">{attendanceData.statistics.total_records}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-green-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-green-600">Present</h4>
                      <p className="text-2xl font-bold text-green-900">{attendanceData.statistics.present}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-red-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-2">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-red-600">Absent</h4>
                      <p className="text-2xl font-bold text-red-900">{attendanceData.statistics.absent}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-yellow-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-2">
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-yellow-600">Late</h4>
                      <p className="text-2xl font-bold text-yellow-900">{attendanceData.statistics.late}</p>
                    </div>
                  </div>
                  {attendanceData.statistics.total_records > 0 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Attendance Rate: <span className="font-semibold text-green-600">
                          {Math.round((attendanceData.statistics.present / attendanceData.statistics.total_records) * 100)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Professional Student Records */}
                {Object.entries(attendanceData.organized_data).map(([deptName, semesters]) => (
                  <div key={deptName} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{deptName}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {Object.entries(semesters).map(([semName, students]) => (
                        <div key={semName} className="mb-8 last:mb-0">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full mr-2">
                                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h4 className="text-md font-semibold text-gray-800">{semName}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {students.length} students
                              </span>
                              {selectedDate && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {students.filter(s => s.attendance?.status === 'Present').length} present
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                  {selectedDate && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked At</th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                  <tr key={student.student_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">
                                              {student.student_name.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                                          <div className="text-sm text-gray-500">{student.student_id}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{student.email}</div>
                                      <div className="text-sm text-gray-500">{student.phone || 'N/A'}</div>
                                    </td>
                                    {selectedDate && student.attendance && (
                                      <>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              student.attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                                              student.attendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                              student.attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {student.attendance.status}
                                            </span>
                                            {student.attendance.is_submitted && (
                                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Locked
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                          <div className="text-sm font-medium text-gray-900">{student.attendance.course.name}</div>
                                          <div className="text-sm text-gray-500">{student.attendance.course.code}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-900">{student.attendance.time_slot}</div>
                                          <div className="text-sm text-gray-500">Room: {student.attendance.room}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{student.attendance.instructor}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {student.attendance.marked_at ? new Date(student.attendance.marked_at).toLocaleString() : 'N/A'}
                                        </td>
                                      </>
                                    )}
                                    {selectedDate && !student.attendance && (
                                      <>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Not Marked
                                          </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No attendance records found for the selected filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Requests</h3>
              <button
                onClick={fetchEditRequests}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Refresh Requests
              </button>
            </div>
            {editRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">No pending edit requests</p>
                <p className="text-sm mt-1">Requests from instructors will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {editRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-gray-900">{request.student.name}</h3>
                          <span className="text-sm text-gray-500">({request.student.id})</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Course:</span> {request.course.name} ({request.course.code})
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Instructor:</span> {request.instructor.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Date:</span> {new Date(request.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Status Change:</span> 
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {request.current_status}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {request.proposed_status}
                            </span>
                          </p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Reason:</span> {request.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
=======
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h2>
        <p className="text-gray-600 mb-6">View and update attendance records. Locked records can be unlocked for editing.</p>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={filters.semesterId}
              onChange={(e) => setFilters({...filters, semesterId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
            <select
              value={filters.instructorId}
              onChange={(e) => setFilters({...filters, instructorId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Instructors</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Records Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading attendance records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.student_name}</div>
                      <div className="text-sm text-gray-500">{record.student_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.course_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.instructor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                        {record.is_locked && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={record.status}
                        onChange={(e) => updateAttendanceRecord(record.id, e.target.value)}
                        disabled={record.is_locked}
                        className={`text-sm border border-gray-300 rounded px-2 py-1 ${
                          record.is_locked ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                      {record.is_locked && (
                        <button
                          onClick={() => unlockAttendanceRecord(record.id)}
                          className="ml-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                          title="Unlock for editing"
                        >
                          Unlock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="mt-2">No attendance records found for the selected criteria.</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or selecting a different date.</p>
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
              </div>
            )}
          </div>
        )}
      </div>
<<<<<<< HEAD
      
      {/* Review Request Modal */}
      {selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Review Edit Request</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Student Information</h4>
                  <p className="text-sm text-gray-600">Name: {selectedRequest.student.name}</p>
                  <p className="text-sm text-gray-600">ID: {selectedRequest.student.id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                  <p className="text-sm text-gray-600">Course: {selectedRequest.course.name}</p>
                  <p className="text-sm text-gray-600">Code: {selectedRequest.course.code}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requested Change</h4>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    {selectedRequest.current_status}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedRequest.proposed_status}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Reason</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditRequest(selectedRequest.id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleEditRequest(selectedRequest.id, 'approve')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    </motion.div>
  );
};

export default AdminAttendanceManagement;