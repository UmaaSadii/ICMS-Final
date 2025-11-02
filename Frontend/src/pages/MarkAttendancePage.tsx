import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  email: string;
  weeklyAttendance: {
    [key: string]: 'P' | 'A' | 'L' | 'H';
  };
  semesterPercentage: number;
  semesterStats: string;
}

const MarkAttendancePage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'CW-112',
      name: 'sadia naz',
      email: 'sadia.naz@university.edu',
      weeklyAttendance: {
        'Mon-27': 'P',
        'Tue-28': 'P',
        'Wed-29': 'A',
        'Thu-30': 'P',
        'Fri-31': 'P',
        'Sat-1': 'H',
        'Sun-2': 'H'
      },
      semesterPercentage: 97,
      semesterStats: '36/69'
    }
  ]);

  const weekDays = [
    { day: 'Mon', date: '27', key: 'Mon-27' },
    { day: 'Tue', date: '28', key: 'Tue-28' },
    { day: 'Wed', date: '29', key: 'Wed-29' },
    { day: 'Thu', date: '30', key: 'Thu-30', isToday: true },
    { day: 'Fri', date: '31', key: 'Fri-31' },
    { day: 'Sat', date: '1', key: 'Sat-1' },
    { day: 'Sun', date: '2', key: 'Sun-2' }
  ];

  const updateAttendance = (studentId: string, dayKey: string, status: 'P' | 'A' | 'L') => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            weeklyAttendance: { ...student.weeklyAttendance, [dayKey]: status }
          }
        : student
    ));
  };

  const markAllPresent = () => {
    const todayKey = weekDays.find(d => d.isToday)?.key;
    if (todayKey) {
      setStudents(prev => prev.map(student => ({
        ...student,
        weeklyAttendance: { ...student.weeklyAttendance, [todayKey]: 'P' }
      })));
    }
  };

  const markAllAbsent = () => {
    const todayKey = weekDays.find(d => d.isToday)?.key;
    if (todayKey) {
      setStudents(prev => prev.map(student => ({
        ...student,
        weeklyAttendance: { ...student.weeklyAttendance, [todayKey]: 'A' }
      })));
    }
  };

  const submitAttendance = () => {
    alert('Today\'s attendance submitted successfully!');
  };

  const getStatusBadge = (status: 'P' | 'A' | 'L' | 'H') => {
    const baseClass = 'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded ';
    switch (status) {
      case 'P': return baseClass + 'bg-green-100 text-green-700';
      case 'A': return baseClass + 'bg-red-100 text-red-700';
      case 'L': return baseClass + 'bg-yellow-100 text-yellow-700';
      case 'H': return baseClass + 'bg-gray-100 text-gray-500';
      default: return baseClass + 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Feature Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Mark Attendance</h3>
            <p className="text-sm text-gray-600 mb-3">Manual attendance marking for students</p>
            <p className="text-xs text-blue-600">Click to access →</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">QR Attendance</h3>
            <p className="text-sm text-gray-600 mb-3">Quick QR code scanner for attendance</p>
            <p className="text-xs text-purple-600">Click to access →</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-green-600">10 Month</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Attendance Reports</h3>
            <p className="text-sm text-gray-600 mb-3">Generate detailed attendance reports</p>
            <p className="text-xs text-green-600">Click to access →</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-orange-600">0% Average</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-3">View attendance analytics and trends</p>
            <p className="text-xs text-orange-600">Click to access →</p>
          </motion.div>
        </div>

        {/* Weekly Attendance Register Panel */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Weekly Attendance Register</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">Information Technology – Semester 1</p>
                <p className="text-sm text-purple-200">Current Week (1 students) – Only today's attendance is editable</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Mark All Present
                </button>
                <button
                  onClick={markAllAbsent}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Mark All Absent
                </button>
                <button
                  onClick={submitAttendance}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Submit Today's Attendance
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 min-w-[250px]">Student Details</th>
                    {weekDays.map(day => (
                      <th key={day.key} className="text-center py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                        <div className="text-sm">{day.day}</div>
                        <div className="text-xs text-gray-500">Oct {day.date}</div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 min-w-[100px]">Semester %</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">ID: {student.id}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </td>
                      {weekDays.map(day => (
                        <td key={day.key} className="py-4 px-2 text-center">
                          {day.isToday ? (
                            <select
                              value={student.weeklyAttendance[day.key] || 'P'}
                              onChange={(e) => updateAttendance(student.id, day.key, e.target.value as 'P' | 'A' | 'L')}
                              className="w-12 h-8 text-xs font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="P">P</option>
                              <option value="A">A</option>
                              <option value="L">L</option>
                            </select>
                          ) : (
                            <span className={getStatusBadge(student.weeklyAttendance[day.key])}>
                              {student.weeklyAttendance[day.key]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {student.semesterPercentage}% ({student.semesterStats})
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-green-100 text-green-700">P</span>
                  <span className="text-gray-600">Present (P)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-red-100 text-red-700">A</span>
                  <span className="text-gray-600">Absent (A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-yellow-100 text-yellow-700">L</span>
                  <span className="text-gray-600">Late (L)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">🔒</span>
                  <span className="text-gray-600">Admin allowed updates</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarkAttendancePage;