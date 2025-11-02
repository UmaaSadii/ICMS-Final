import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InstructorTimetable: React.FC = () => {
  const [timetableData, setTimetableData] = useState<any>({});
  const [instructorInfo, setInstructorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    fetchInstructorTimetable();
  }, []);

  const fetchInstructorTimetable = async () => {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (!storedAuth) {
        throw new Error('No authentication data found');
      }
      const authData = JSON.parse(storedAuth);
      const token = authData.access_token;

      const response = await axios.get('http://localhost:8000/api/instructors/timetable/', {
        headers: { Authorization: `Token ${token}` }
      });

      console.log('Instructor timetable data:', response.data);

      // Format timetable data for grid display
      const formattedData: any = {};
      response.data.timetables?.forEach((entry: any) => {
        const dayCapitalized = entry.day.charAt(0).toUpperCase() + entry.day.slice(1);
        const key = `${dayCapitalized}-${entry.start_time}`;
        formattedData[key] = {
          subject: entry.course.name,
          courseCode: entry.course.course_code,
          room: entry.room,
          time: `${entry.start_time}-${entry.end_time}`,
          semester: entry.semester.name,
          id: entry.id
        };
      });

      setTimetableData(formattedData);
      setInstructorInfo(response.data.instructor);
    } catch (error) {
      console.error('Error fetching instructor timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Teaching Schedule</h1>
          {instructorInfo && (
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Instructor:</span> {instructorInfo.name}</p>
              <p><span className="font-medium">Employee ID:</span> {instructorInfo.employee_id}</p>
              {instructorInfo.department && (
                <p><span className="font-medium">Department:</span> {instructorInfo.department}</p>
              )}
            </div>
          )}
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-8 gap-0">
            {/* Header Row */}
            <div className="bg-blue-600 p-4 font-semibold text-white border-b border-r border-gray-300">
              Time
            </div>
            {days.map(day => (
              <div
                key={day}
                className={`p-4 font-semibold text-center border-b border-r border-gray-300 ${
                  day === currentDay 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-blue-600 text-white'
                }`}
              >
                {day}
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map(time => (
              <React.Fragment key={time}>
                <div className="p-4 bg-gray-200 font-semibold text-gray-800 border-b border-r text-center">
                  {time}
                </div>
                {days.map(day => {
                  const classData = timetableData[`${day}-${time}`];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`p-3 border-b border-r border-gray-300 min-h-[80px] ${
                        classData 
                          ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {classData ? (
                        <div className="text-xs">
                          <div className="font-semibold text-blue-800 mb-1">
                            {classData.subject}
                          </div>
                          <div className="text-gray-600 mb-1">
                            {classData.courseCode}
                          </div>
                          <div className="text-gray-500 mb-1">
                            Room: {classData.room}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {classData.semester}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            {classData.time}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs text-center pt-6">
                          Free
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(timetableData).length}
              </div>
              <div className="text-sm text-gray-600">Total Classes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(Object.values(timetableData).map((item: any) => item.subject)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(Object.values(timetableData).map((item: any) => item.semester)).size}
              </div>
              <div className="text-sm text-gray-600">Semesters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorTimetable;