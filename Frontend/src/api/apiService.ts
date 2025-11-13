import { api } from './api';

// Student Service
export const studentService = {
  getAllStudents: (filters?: { department?: number; semester?: number; search?: string; ordering?: string }) => {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department.toString());
    if (filters?.semester) params.append('semester', filters.semester.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    const queryString = params.toString();
    return api.get(`students/${queryString ? '?' + queryString : ''}`);
  },
  getStudentById: (id: number) => api.get(`students/${id}/`),
  createStudent: (data: any) => api.post('students/', data),
  updateStudent: (id: number, data: any) => api.put(`students/${id}/`, data),
  deleteStudent: (id: number) => api.delete(`students/${id}/`),
  getStudentProfile: (id: number) => api.get(`students/${id}/`),
  getCurrentStudentProfile: () => api.get('students/profile/'), // New profile endpoint
  uploadStudentImage: (id: number, formData: FormData) => api.post(`students/${id}/upload-image/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  updateStudentMetrics: (id: number) => api.post(`students/${id}/update-metrics/`),
  generatePerformanceNotes: (id: number, save: boolean = true) => api.post(`students/${id}/generate-notes/?save=${save}`),
  getDepartmentStatistics: () => api.get('students/department-stats/'),
  getStudentsByDepartment: (departmentId?: number) => {
    const params = departmentId ? `?department_id=${departmentId}` : '';
    return api.get(`students/department-filter/${params}`);
  },
};



// Result Service
export const resultService = {
  getAllResults: () => api.get('results/'),
  getResultById: (id: number) => api.get(`results/${id}/`),
  createResult: (data: any) => api.post('results/', data),
  updateResult: (id: number, data: any) => api.put(`results/${id}/`, data),
  deleteResult: (id: number) => api.delete(`results/${id}/`),
  getStudentResults: (studentId: number) => api.get(`students/${studentId}/results/`),
};

// Event Service
export const eventService = {
  getAll: () => api.get("events/"),        // ✅ get all (auto filtered by backend)
  create: (data: any) => api.post("events/", data),  // ✅ only admin can create
  approve: (id: number) => api.post(`events/${id}/approve/`),  // ✅ principal only
  reject: (id: number) => api.post(`events/${id}/reject/`),    // ✅ principal only
};

// Department Service
export const departmentService = {
  getAllDepartments: () => api.get('academics/departments/'),
  getDepartmentById: (id: number) => api.get(`academics/departments/${id}/`),
  createDepartment: (data: any) => api.post('academics/departments/', data),
  updateDepartment: (id: number, data: any) => api.put(`academics/departments/${id}/`, data),
  deleteDepartment: (id: number) => api.delete(`academics/departments/${id}/`),
  
  // Semester methods
  getAllSemesters: () => api.get('academics/semesters/'),
  getSemesterById: (id: number) => api.get(`academics/semesters/${id}/`),
  getSemestersByDepartment: (departmentId: number) => api.get(`academics/departments/${departmentId}/semesters/`),
  createSemester: (data: any) => api.post('academics/semesters/', data),
  updateSemester: (id: number, data: any) => api.put(`academics/semesters/${id}/`, data),
  deleteSemester: (id: number) => api.delete(`academics/semesters/${id}/`),
};

// Semester Service
export const semesterService = {
  getAllSemesters: () => api.get('academics/semesters/'),
  getSemesterById: (id: number) => api.get(`academics/semesters/${id}/`),
  createSemester: (data: any) => api.post('academics/semesters/', data),
  updateSemester: (id: number, data: any) => api.put(`academics/semesters/${id}/`, data),
  deleteSemester: (id: number) => api.delete(`academics/semesters/${id}/`),
  getSemestersByDepartment: (departmentId: number) => api.get(`academics/departments/${departmentId}/semesters/`),
};

// Course Service
export const courseService = {
  getAllCourses: () => api.get('academics/courses/'),
  getCourseById: (id: number) => api.get(`academics/courses/${id}/`),
  createCourse: (data: any) => api.post('academics/courses/', data),
  updateCourse: (id: number, data: any) => api.put(`academics/courses/${id}/`, data),
  deleteCourse: (id: number) => api.delete(`academics/courses/${id}/`),
  getCoursesBySemester: (semesterId: number) => api.get(`academics/semesters/${semesterId}/courses/`),
};





// Announcement Service
export const announcementService = {
  getAllAnnouncements: () => api.get('announcements/'),
  getAnnouncementById: (id: number) => api.get(`announcements/${id}/`),
  createAnnouncement: (data: any) => api.post('announcements/', data),
  updateAnnouncement: (id: number, data: any) => api.put(`announcements/${id}/`, data),
  deleteAnnouncement: (id: number) => api.delete(`announcements/${id}/`),
};





// Re-export authService from api.ts
export { authService } from './api';
