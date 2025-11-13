import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  id: number;
  student_id: string;
  student_name: string;
  course_name: string;
  instructor_name: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  is_locked: boolean;
}

const AdminAttendanceManagement: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
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

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate, filters]);

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
        setAttendanceRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceRecord = async (recordId: number, newStatus: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth') || '{}').access_token;
      
      const response = await fetch(`http://localhost:8000/api/academics/admin/attendance/${recordId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
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
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminAttendanceManagement;