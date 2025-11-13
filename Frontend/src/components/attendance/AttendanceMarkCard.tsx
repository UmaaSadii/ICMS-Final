import React, { useState, useEffect } from 'react';
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
  status: 'Present' | 'Absent' | 'Late';
  timetable_id?: number | undefined;
}

interface AttendanceMarkCardProps {
  filters: { departmentId: string; semesterId: string };
}

const AttendanceMarkCard: React.FC<AttendanceMarkCardProps> = ({ filters }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [semesterName, setSemesterName] = useState('');
  const [activeSlot, setActiveSlot] = useState<any>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [slotStatus, setSlotStatus] = useState('');

  // Dynamic week generation based on current date
  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Get Monday of current week
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isFuture = date > today;
      
      weekDays.push({
        day: dayNames[i],
        date: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        key: `${dayNames[i]}-${date.getDate()}`,
        isToday,
        isPast,
        isFuture,
        isEditable: isToday // Only today is editable
      });
    }
    
    return weekDays;
  };
  
  const [weekDays, setWeekDays] = useState(generateWeekDays());
  
  // Update week days every minute to handle date changes
  useEffect(() => {
    const interval = setInterval(() => {
      setWeekDays(generateWeekDays());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (filters.departmentId && filters.semesterId) {
      fetchDepartmentAndSemesterInfo();
      fetchStudents();
    }
  }, [filters.departmentId, filters.semesterId]);

  const fetchDepartmentAndSemesterInfo = async () => {
    try {
      // Fetch department info
      const deptResponse = await fetch(`http://localhost:8000/api/academics/departments/${filters.departmentId}/`);
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartmentName(deptData.name);
      }

      // Fetch semester info
      const semResponse = await fetch(`http://localhost:8000/api/academics/semesters/${filters.semesterId}/`);
      if (semResponse.ok) {
        const semData = await semResponse.json();
        setSemesterName(semData.name);
      }
    } catch (error) {
      console.error('Error fetching department/semester info:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // First fetch instructor's active slots
      const slotsResponse = await fetch('http://localhost:8000/api/academics/attendance/instructor/slots/', {
        headers: {
          'Authorization': `Token ${JSON.parse(localStorage.getItem('auth') || '{}').access_token}`,
        }
      });

      let activeTimetableId: number | null = null;
      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        console.log('Instructor slots:', slotsData);

        // Find active slot for today
        const currentSlot = slotsData.slots?.find((slot: any) => slot.is_active);
        if (currentSlot) {
          activeTimetableId = currentSlot.timetable_id;
          setActiveSlot(currentSlot);
          
          // Check if slot is ongoing and can submit
          const now = new Date();
          const slotStart = new Date(`${currentSlot.date}T${currentSlot.start_time}`);
          const slotEnd = new Date(`${currentSlot.date}T${currentSlot.end_time}`);
          
          if (now >= slotStart && now <= slotEnd) {
            setCanSubmit(true);
            setSlotStatus('Ongoing - You can submit attendance');
          } else if (now > slotEnd) {
            setCanSubmit(false);
            setSlotStatus('Slot ended - Contact admin for updates');
          } else {
            setCanSubmit(false);
            setSlotStatus('Slot not started yet');
          }
          
          console.log('Active slot found:', currentSlot);
        } else {
          setActiveSlot(null);
          setCanSubmit(false);
          setSlotStatus('No active slot assigned');
          console.log('No active slot found for today');
        }
      }

      const url = `http://localhost:8000/api/students/?department_id=${filters.departmentId}&semester_id=${filters.semesterId}`;
      console.log('Fetching students from:', url);
      console.log('Department ID:', filters.departmentId, 'Semester ID:', filters.semesterId);

      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);

        if (Array.isArray(data) && data.length > 0) {
          const formattedStudents = data.map((student: any) => ({
            id: student.student_id,
            name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
            email: student.email || 'No email',
            weeklyAttendance: {
              'Mon-27': 'P' as const,
              'Tue-28': 'P' as const,
              'Wed-29': 'P' as const,
              'Thu-30': 'P' as const,
              'Fri-31': 'P' as const,
              'Sat-1': 'H' as const,
              'Sun-2': 'H' as const
            },
            semesterPercentage: student.attendance_percentage || 85,
            semesterStats: '0/0',
            status: 'Present' as const,
            timetable_id: activeTimetableId || undefined
          }));
          console.log('Formatted students:', formattedStudents);
          setStudents(formattedStudents);
        } else {
          console.log('No real students found, showing demo students');
          setStudents([
            {
              id: `demo-${filters.departmentId}-${filters.semesterId}-1`,
              name: `Student from Dept ${filters.departmentId} Sem ${filters.semesterId}`,
              email: 'demo@example.com',
              weeklyAttendance: {
                'Mon-27': 'P' as const,
                'Tue-28': 'P' as const,
                'Wed-29': 'P' as const,
                'Thu-30': 'P' as const,
                'Fri-31': 'P' as const,
                'Sat-1': 'H' as const,
                'Sun-2': 'H' as const
              },
              semesterPercentage: 85,
              semesterStats: '0/0',
              status: 'Present' as const,
              timetable_id: activeTimetableId || undefined
            }
          ]);
        }
      } else {
        console.error('Response not ok:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (studentId: string, dayKey: string, status: 'P' | 'A' | 'L') => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            weeklyAttendance: { ...student.weeklyAttendance, [dayKey]: status },
            status: status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Late'
          }
        : student
    ));
  };

  const markAllPresent = () => {
    const editableDay = weekDays.find(d => d.isToday);
    if (editableDay) {
      setStudents(prev => prev.map(student => ({
        ...student,
        weeklyAttendance: { ...student.weeklyAttendance, [editableDay.key]: 'P' },
        status: 'Present' as const
      })));
    }
  };

  const markAllAbsent = () => {
    const editableDay = weekDays.find(d => d.isToday);
    if (editableDay) {
      setStudents(prev => prev.map(student => ({
        ...student,
        weeklyAttendance: { ...student.weeklyAttendance, [editableDay.key]: 'A' },
        status: 'Absent' as const
      })));
    }
  };

  const submitAttendance = async () => {
    if (students.length === 0) return;

    try {
      const timetableId = students[0]?.timetable_id;

      if (!timetableId) {
        alert('No active slot found');
        return;
      }

      const attendanceData = students.map(student => ({
        student_id: student.id,
        status: student.status
      }));

      const response = await fetch('http://localhost:8000/api/academics/attendance/slot/mark/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${JSON.parse(localStorage.getItem('auth') || '{}').access_token}`,
        },
        body: JSON.stringify({
          timetable_id: timetableId,
          attendance_data: attendanceData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance');
    }
  };
  
  const finalizeAttendance = async () => {
    if (students.length === 0) return;

    try {
      const timetableId = students[0]?.timetable_id;

      const response = await fetch('http://localhost:8000/api/academics/attendance/slot/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${JSON.parse(localStorage.getItem('auth') || '{}').access_token}`,
        },
        body: JSON.stringify({
          timetable_id: timetableId
        })
      });

      if (response.ok) {
        alert('Attendance finalized! Admin permission required for further edits.');
        setStudents([]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error finalizing attendance:', error);
    }
  };

  if (!filters.departmentId || !filters.semesterId) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Department & Semester</h3>
        <p className="text-gray-600">Choose a department and semester to view students</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Weekly Attendance Register</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">{departmentName} – {semesterName}</p>
              <p className="text-sm text-purple-200">Current Week ({students.length} students)</p>
              {activeSlot && (
                <p className="text-sm text-purple-200">
                  Slot: {activeSlot.start_time} - {activeSlot.end_time} | Status: {slotStatus}
                </p>
              )}
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
                onClick={finalizeAttendance}
                disabled={!canSubmit}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  canSubmit 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={slotStatus}
              >
                Submit and Lock
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 min-w-[250px]">Student Details</th>
                  {weekDays.map(day => (
                    <th key={day.key} className="text-center py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                      <div className="text-sm">{day.day}</div>
                      <div className="text-xs text-gray-500">{day.month} {day.date}</div>
                      {day.isToday && <div className="text-xs text-blue-600 font-bold">TODAY</div>}
                      {day.isPast && <div className="text-xs text-gray-400">Past</div>}
                      {day.isFuture && <div className="text-xs text-orange-500">Future</div>}
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
                            className="w-12 h-8 text-xs font-bold border rounded focus:ring-2 focus:border-transparent border-blue-500 bg-blue-50 focus:ring-blue-500"
                          >
                            <option value="P">P</option>
                            <option value="A">A</option>
                            <option value="L">L</option>
                          </select>
                        ) : (
                          <span className={`${getStatusBadge(student.weeklyAttendance[day.key])} ${
                            day.isFuture ? 'opacity-50' : ''
                          }`}>
                            {day.isFuture ? '-' : (student.weeklyAttendance[day.key] || 'P')}
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
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceMarkCard;