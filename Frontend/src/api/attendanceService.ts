import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const attendanceService = {
  // Teacher Dashboard
  getTeacherDashboard: () => api.get('/academics/teacher/dashboard/'),

  // Attendance Mark Card
  getMarkCardData: () => api.get('/academics/attendance/cards/mark/'),
  getAttendanceSheet: (sessionId: number) => 
    api.get(`/academics/attendance/sessions/${sessionId}/mark/`),
  updateAttendance: (sessionId: number, attendances: any[]) =>
    api.post(`/academics/attendance/sessions/${sessionId}/mark/`, { attendances }),

  // Attendance Report Card
  getReportCardData: () => api.get('/academics/attendance/cards/report/'),
  getCourseReport: (courseId: number) => 
    api.get(`/academics/attendance/cards/report/?course_id=${courseId}`),
  exportExcel: (courseId: number) => {
    const url = `${API_BASE_URL}/academics/attendance/cards/report/?course_id=${courseId}&export_excel=true`;
    window.open(url, '_blank');
  },

  // Attendance Monitoring Card
  getMonitoringData: () => api.get('/academics/attendance/cards/monitoring/'),

  // Session Management
  getSessions: (params?: any) => api.get('/academics/attendance/sessions/', { params }),
  createSession: (sessionData: any) => api.post('/academics/attendance/sessions/', sessionData),
  finalizeSession: (sessionId: number) => 
    api.post(`/academics/attendance/sessions/${sessionId}/finalize/`),

  // Reports
  getAttendanceReport: (params: any) => 
    api.get('/academics/attendance/reports/', { params }),

  // Instructor Courses
  getInstructorCourses: () => api.get('/academics/instructor/courses/'),
};

export default attendanceService;