import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Semester {
  semester_id: number;
  name: string;
}

interface TimetableEntry {
  id: number;
  course: { name: string; code: string };
  instructor: { name: string };
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}

const HODTimetable: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:8000/api/academics';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/hod/dashboard/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setSemesters(response.data.semesters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchTimetable = async (semesterId: number | null) => {
    try {
      const token = localStorage.getItem('token');
      const url = semesterId 
        ? `${API_BASE}/hod/timetable/?semester_id=${semesterId}`
        : `${API_BASE}/hod/timetable/`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` }
      });
      setTimetable(response.data.timetables);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleSemesterChange = (semesterId: string) => {
    const id = semesterId ? Number(semesterId) : null;
    setSelectedSemester(id);
    fetchTimetable(id);
  };

  const deleteEntry = async (entryId: number) => {
    if (!window.confirm('Delete this entry?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/hod/timetable/${entryId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchTimetable(selectedSemester);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">HOD Timetable Management</h1>
      
      {/* Semester Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-2">Select Semester:</label>
        <select
          value={selectedSemester || ''}
          onChange={(e) => handleSemesterChange(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md"
        >
          <option value="">All Semesters</option>
          {semesters.map(semester => (
            <option key={semester.semester_id} value={semester.semester_id}>
              {semester.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timetable Display */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Timetable {selectedSemester ? `- ${semesters.find(s => s.semester_id === selectedSemester)?.name}` : ''}
        </h2>
        
        {timetable.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No timetable entries found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left">Day</th>
                  <th className="border p-3 text-left">Time</th>
                  <th className="border p-3 text-left">Course</th>
                  <th className="border p-3 text-left">Instructor</th>
                  <th className="border p-3 text-left">Room</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border p-3 capitalize">{entry.day}</td>
                    <td className="border p-3">{entry.start_time} - {entry.end_time}</td>
                    <td className="border p-3">{entry.course.name} ({entry.course.code})</td>
                    <td className="border p-3">{entry.instructor.name}</td>
                    <td className="border p-3">{entry.room || 'N/A'}</td>
                    <td className="border p-3">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HODTimetable;