import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { departmentService, courseService, studentService as apiStudentService, announcementService } from '../api/apiService';
import { instructorService, studentService } from '../api/studentInstructorService';
import { academicsService } from '../api/academicsService_enhanced';
import StudentManagement from '../components/pages/StudentManagement';
import DepartmentManagement from '../components/pages/DepartmentManagement';
import CourseManagement from '../components/pages/CourseManagement';
import TeacherManagement from '../components/pages/TeacherManagement';
import EventManagement from '../components/pages/EventManagement';
import HODManagement from '../components/pages/HODManagement';

import SystemHealthWidget from '../components/dashboard/SystemHealthWidget';
import NotificationPanel from '../components/dashboard/NotificationPanel';
import QuickActions from '../components/dashboard/QuickActions';
import AIInsights from '../components/dashboard/AIInsights';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import PrincipalManagement from '../components/pages/PrincipalManagement';
import AdminAttendanceManagement from '../components/attendance/AdminAttendanceManagement';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import { jsPDF } from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Custom scrollbar styles
const globalScrollbarStyle = `
  /* Custom scrollbar for webkit browsers */
  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  *::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  /* Enable scrolling in all directions */
  body, html {
    overflow: auto;
  }
`;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type TabId = 'dashboard' | 'students' |'principal'| 'instructors' | 'departments' | 'courses' | 'results' | 'attendance' | 'events' | 'announcements'| 'hod';
interface HODRequest {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  phone: string;
  department_name: string;
  designation: string;
  experience_years: number;
  specialization: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}
const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Results tab state
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showResultDetailsModal, setShowResultDetailsModal] = useState(false);
  const [selectedResultForDetails, setSelectedResultForDetails] = useState<any>(null);
  const [resultDetailsActiveTab, setResultDetailsActiveTab] = useState<'course' | 'all'>('course');

  // Add header animation effect
  useEffect(() => {
    const header = document.querySelector('.admin-header');
    if (header) {
      header.classList.add('animate-fadeIn');
    }
  }, []);



  // Admin data state
  const [adminData, setAdminData] = useState({
    users: [] as any[],
    departments: [] as any[],
    stats: {
      totalUsers: 1200,
      activeUsers: 850,
      totalDepartments: 25,
      totalCourses: 40,
      totalStudents: 1000,
      totalStaff: 200,
    },
  });
  
  // Admin profile state
  const [adminProfile, setAdminProfile] = useState<any>(null);

  // Get auth token
  const authData = localStorage.getItem('auth');
  const token = authData ? JSON.parse(authData).access_token || JSON.parse(authData).token : null;

// HOD requests state
  const [hodRequests, setHodRequests] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [hodRequestsList, setHodRequestsList] = useState<HODRequest[]>([]);
  const [hodRequestsLoading, setHodRequestsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [hodRecords, setHodRecords] = useState<any[]>([]);
  const [hodRecordsLoading, setHodRecordsLoading] = useState(false);
  const [retiredHods, setRetiredHods] = useState<any[]>([]);
  const [retiredHodsLoading, setRetiredHodsLoading] = useState(false);
  const [hodView, setHodView] = useState<'requests' | 'records' | 'retired'>('requests');
  const [selectedHodForView, setSelectedHodForView] = useState<any>(null);
  const [selectedHodForEdit, setSelectedHodForEdit] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Department counts for pie chart
  const [departmentCounts, setDepartmentCounts] = useState<Record<number, number>>({});

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const authData = sessionStorage.getItem('auth') || localStorage.getItem('auth');
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || 
                     (authData ? JSON.parse(authData).access_token : null);
        
        if (token) {
          const profileResponse = await fetch('http://127.0.0.1:8000/api/admin/profile/', {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Admin profile data:', profileData);
            setAdminProfile(profileData);
          } else {
            console.error('Admin profile fetch failed:', profileResponse.status, profileResponse.statusText);
            setAdminProfile({ name: 'Admin' });
          }
        }
      } catch (error) {
        console.error('Admin profile fetch error:', error);
      }
    };

    fetchAdminProfile();
  }, [currentUser]);

  // Fetch real data for dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get auth token for HOD requests API
        const authData = localStorage.getItem('auth');
        const token = authData ? JSON.parse(authData).access_token : null;

        const [studentsRes, departmentsRes, coursesRes, instructorsRes, hodRequestsRes] = await Promise.all([
          apiStudentService.getAllStudents(),
          departmentService.getAllDepartments(),
          courseService.getAllCourses(),
          instructorService.getAllInstructors(),
          fetch('http://localhost:8000/api/register/admin/hod-requests/', {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json()).catch(() => ({ stats: { pending: 0, approved: 0, rejected: 0, total: 0 }, requests: [] })),
        ]);

        const totalUsers = studentsRes.data.length + instructorsRes.data.length;
        const activeUsers = Math.floor(totalUsers * 0.7); // Assuming 70% are active

        // Calculate counts per department with better error handling
        const counts: Record<number, number> = {};
        studentsRes.data.forEach((student: any) => {
          let departmentId: number | null = null;

          // Handle different possible department structures
          if (student.department) {
            if (typeof student.department === 'object' && student.department !== null) {
              // If department is an object, try different ID fields
              if (student.department.id) {
                departmentId = student.department.id;
              } else if (student.department.department_id) {
                departmentId = student.department.department_id;
              } else if (student.department.departmentId) {
                departmentId = student.department.departmentId;
              }
            } else if (typeof student.department === 'number') {
              // If department is just an ID number
              departmentId = student.department;
            }
          }

          // Also check if department is stored as a direct property
          if (!departmentId && (student as any).department_id) {
            departmentId = (student as any).department_id;
          }

          if (departmentId) {
            counts[departmentId] = (counts[departmentId] || 0) + 1;
          }
        });

        setDepartmentCounts(counts);

        // Set HOD requests data
        if (hodRequestsRes.stats) {
          setHodRequests({
            pending: hodRequestsRes.stats.pending,
            approved: hodRequestsRes.stats.approved,
            rejected: hodRequestsRes.stats.rejected,
            total: hodRequestsRes.stats.total
          });
        }
        setAdminData({
          users: [...studentsRes.data, ...instructorsRes.data],
          departments: departmentsRes.data,
          stats: {
            totalUsers,
            activeUsers,
            totalDepartments: departmentsRes.data.length,
            totalCourses: coursesRes.data.length,
            totalStudents: studentsRes.data.length,
            totalStaff: instructorsRes.data.length,
          },
        });
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
        // Keep default values if fetch fails
      }
    };

    fetchDashboardData();
  }, []);

  // 📢 Announcement state
const [announcements, setAnnouncements] = useState<any[]>([]);
const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

// Fetch all announcements
useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementService.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };
  fetchAnnouncements();
}, []);

// Create new announcement
const handleCreateAnnouncement = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await announcementService.createAnnouncement(newAnnouncement);
    setNewAnnouncement({ title: '', message: '' });
    const { data } = await announcementService.getAllAnnouncements();
    setAnnouncements(data);
    alert('✅ Announcement added successfully!');
  } catch (error) {
    console.error('Error creating announcement:', error);
  }
};

  // Fetch departments for results tab
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setResultsLoading(true);
        const response = await academicsService.getDepartments();
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartments([]);
      } finally {
        setResultsLoading(false);
      }
    };

    if (activeTab === 'results') {
      fetchDepartments();
    }
  }, [activeTab]);

  // Fetch semesters when department is selected
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!selectedDepartment) {
        setSemesters([]);
        setSelectedSemester(null);
        return;
      }

      try {
        const response = await academicsService.getSemestersByDepartment(selectedDepartment);
        // Filter to only semesters that have students
        try {
          const studentsResponse = await apiStudentService.getAllStudents({ department: selectedDepartment });
          const students = studentsResponse.data;
          const semesterIds = Array.from(new Set(
            students
              .map((student: any) => student.semester?.id || student.semester)
              .filter((id: any) => id != null)
          ));
          const semestersWithStudents = response.data.filter((sem: any) => semesterIds.includes(sem.id));
          setSemesters(semestersWithStudents);
        } catch (error) {
          console.error('Failed to filter semesters:', error);
          // Keep all semesters if filtering fails
          setSemesters(response.data);
        }
        setSelectedSemester(null); // Reset semester selection
        setSelectedStudent(null); // Reset student selection
        setStudentResults([]);
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
        setSemesters([]);
      }
    };

    if (selectedDepartment) {
      fetchSemesters();
    }
  }, [selectedDepartment]);

  // Fetch students when semester is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedDepartment || !selectedSemester) {
        setStudents([]);
        setSelectedStudent(null);
        setStudentResults([]);
        return;
      }

      try {
        setLoading(true);
        // Use server-side filtering instead of client-side filtering
        const response = await apiStudentService.getAllStudents({
          department: selectedDepartment,
          semester: selectedSemester
        });
        setStudents(response.data);
        setSelectedStudent(null); // Reset student selection
        setStudentResults([]);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDepartment && selectedSemester) {
      fetchStudents();
    }
  }, [selectedDepartment, selectedSemester]);

  // Fetch student results and courses when student is selected
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedStudent) return;

      try {
        setResultsLoading(true);

        // Fetch results and assigned courses for the student
        const [resultsResponse, coursesResponse] = await Promise.all([
          academicsService.getStudentResults(selectedStudent.toString()),
          studentService.getStudentCourses(selectedStudent.toString())
        ]);

        // Extract results array from the API response (handles both basic and enhanced endpoints)
        const resultsData = resultsResponse.data;
        const results = Array.isArray(resultsData) ? resultsData : (resultsData.results || []);
        setStudentResults(results);
        setStudentCourses(coursesResponse.data);
      } catch (error) {
        console.error('Failed to fetch student results:', error);
        setStudentResults([]);
        setStudentCourses([]);
      } finally {
        setResultsLoading(false);
      }
    };

    if (selectedStudent) {
      fetchStudentData();
    }
  }, [selectedStudent, selectedSemester]);

  // Helper function to safely get course name
  const getCourseName = (courseData: any): string => {
    if (!courseData || courseData === null || courseData === undefined) return 'N/A';

    try {
      // If it's an object with a name property, extract the name
      if (typeof courseData === 'object' && courseData !== null && 'name' in courseData) {
        return courseData.name || 'N/A';
      }

      // If it's an object with course_name property, extract the course_name
      if (typeof courseData === 'object' && courseData !== null && 'course_name' in courseData) {
        return courseData.course_name || 'N/A';
      }

      // If it's an object with title property
      if (typeof courseData === 'object' && courseData !== null && 'title' in courseData) {
        return courseData.title || 'N/A';
      }

      // If it's an object with code property
      if (typeof courseData === 'object' && courseData !== null && 'code' in courseData) {
        return courseData.code || 'N/A';
      }

      // If it's an object with subject property
      if (typeof courseData === 'object' && courseData !== null && 'subject' in courseData) {
        return courseData.subject || 'N/A';
      }

      // Fallback for object with id
      if (typeof courseData === 'object' && courseData !== null && courseData.id) {
        return `Course ${courseData.id}`;
      }

      // If it's a string, return as is
      if (typeof courseData === 'string') {
        return courseData || 'N/A';
      }

      // Fallback
      return 'N/A';
    } catch (error) {
      console.error('Error extracting course name:', error, courseData);
      return 'N/A';
    }
  };


  // Helper function to safely get department name
  const getDepartmentName = (departmentData: any): string => {
    if (!departmentData || departmentData === null || departmentData === undefined) return 'N/A';

    try {
      // If it's an object with a name property, extract the name
      if (typeof departmentData === 'object' && departmentData !== null && 'name' in departmentData) {
        return departmentData.name || 'N/A';
      }

      // If it's an object with department_name property
      if (typeof departmentData === 'object' && departmentData !== null && 'department_name' in departmentData) {
        return departmentData.department_name || 'N/A';
      }

      // If it's an object with title property
      if (typeof departmentData === 'object' && departmentData !== null && 'title' in departmentData) {
        return departmentData.title || 'N/A';
      }

      // If it's an object with code property
      if (typeof departmentData === 'object' && departmentData !== null && 'code' in departmentData) {
        return departmentData.code || 'N/A';
      }

      // If it's a string, return as is
      if (typeof departmentData === 'string') {
        return departmentData || 'N/A';
      }

      // If it's an object with other properties, try to find a suitable name
      if (typeof departmentData === 'object' && departmentData !== null) {
        if (departmentData.id) return `Department ${departmentData.id}`;
      }

      return 'N/A';
    } catch (error) {
      console.error('Error extracting department name:', error, departmentData);
      return 'N/A';
    }
  };

  // Helper function to safely get semester name
  const getSemesterName = (semesterData: any): string => {
    if (!semesterData || semesterData === null || semesterData === undefined) return 'N/A';

    try {
      // If it's an object with a name property, extract the name
      if (typeof semesterData === 'object' && semesterData !== null && 'name' in semesterData) {
        return semesterData.name || 'N/A';
      }

      // If it's an object with semester_name property
      if (typeof semesterData === 'object' && semesterData !== null && 'semester_name' in semesterData) {
        return semesterData.semester_name || 'N/A';
      }

      // If it's an object with title property
      if (typeof semesterData === 'object' && semesterData !== null && 'title' in semesterData) {
        return semesterData.title || 'N/A';
      }

      // If it's an object with code property
      if (typeof semesterData === 'object' && semesterData !== null && 'code' in semesterData) {
        return semesterData.code || 'N/A';
      }

      // If it's an object with semester_code property
      if (typeof semesterData === 'object' && semesterData !== null && 'semester_code' in semesterData) {
        return semesterData.semester_code || 'N/A';
      }

      // If it's a string, return as is
      if (typeof semesterData === 'string') {
        return semesterData || 'N/A';
      }

      // If it's an object with other properties, try to find a suitable name
      if (typeof semesterData === 'object' && semesterData !== null) {
        if (semesterData.id) return `Semester ${semesterData.id}`;
      }

      return 'N/A';
    } catch (error) {
      console.error('Error extracting semester name:', error, semesterData);
      return 'N/A';
    }
  };

  // Helper function to safely get student name
  const getStudentName = (studentData: any): string => {
    if (!studentData || studentData === null || studentData === undefined) return 'N/A';

    try {
      // If it's an object with user property containing first_name and last_name
      if (typeof studentData === 'object' && studentData !== null && studentData.user) {
        const user = studentData.user;
        if (!user || user === null || user === undefined) return 'N/A';
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      }

      // If it's an object with name property
      if (typeof studentData === 'object' && studentData !== null && 'name' in studentData) {
        return studentData.name || 'N/A';
      }

      // If it's an object with student_name property
      if (typeof studentData === 'object' && studentData !== null && 'student_name' in studentData) {
        return studentData.student_name || 'N/A';
      }

      // If it's an object with first_name and last_name properties
      if (typeof studentData === 'object' && studentData !== null && 'first_name' in studentData && 'last_name' in studentData) {
        return `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() || 'N/A';
      }

      // If it's an object with full_name property
      if (typeof studentData === 'object' && studentData !== null && 'full_name' in studentData) {
        return studentData.full_name || 'N/A';
      }

      // If it's a string, return as is
      if (typeof studentData === 'string') {
        return studentData || 'N/A';
      }

      // If it's an object with other properties, try to find a suitable name
      if (typeof studentData === 'object' && studentData !== null) {
        if (studentData.student_id) return `Student ${studentData.student_id}`;
        if (studentData.id) return `Student ${studentData.id}`;
      }

      return 'N/A';
    } catch (error) {
      console.error('Error extracting student name:', error, studentData);
      return 'N/A';
    }
  };

  // Generate PDF Report Card
  const handleViewResultDetails = (result: any) => {
    setSelectedResultForDetails(result);
    setShowResultDetailsModal(true);
  };

  const generateReportCard = useCallback(() => {
    if (!selectedStudent || studentResults.length === 0) return;

    const doc = new jsPDF();
    const selectedStudentData = students.find(s => s.id === selectedStudent);

    // Header
    doc.setFontSize(20);
    doc.text('FGPG University', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Student Report Card', 105, 30, { align: 'center' });

    // Student Information
    doc.setFontSize(12);
    doc.text(`Student Name: ${selectedStudentData?.user?.first_name} ${selectedStudentData?.user?.last_name}`, 20, 50);
    doc.text(`Student ID: ${selectedStudentData?.student_id}`, 20, 60);
    doc.text(`Department: ${departments.find(d => d.id === selectedDepartment)?.name}`, 20, 70);
    doc.text(`Semester: ${getSemesterName(selectedStudentData?.semester)}`, 20, 80);

    // Results Table
    let yPosition = 100;
    doc.setFontSize(14);
    doc.text('Academic Results', 20, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(10);
    doc.text('Course', 20, yPosition);
    doc.text('Grade', 120, yPosition);
    doc.text('GPA', 160, yPosition);
    yPosition += 5;

    // Draw line
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // Results data
    if (studentResults && Array.isArray(studentResults)) {
      studentResults.forEach((result: any) => {
        doc.text(result.subject || 'N/A', 20, yPosition);
        doc.text(result.grade || 'N/A', 120, yPosition);
        doc.text(result.gpa?.toString() || 'N/A', 160, yPosition);
        yPosition += 10;
      });
    }

    // Footer
    yPosition += 20;
    doc.setFontSize(8);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, yPosition);
    doc.text('FGPG University Management System', 20, yPosition + 10);

    // Save the PDF
    doc.save(`report_card_${selectedStudentData?.student_id}.pdf`);
  }, [selectedStudent, studentResults, students, departments, selectedDepartment]);
  // HOD Requests Management Functions
  const loadHodRequests = async () => {
    setHodRequestsLoading(true);
    try {
      if (!token) {
        console.error('No auth token found');
        // Add mock data for testing
        setHodRequestsList([
          { id: 1, name: 'Dr. Test HOD 1', email: 'test1@university.edu', employee_id: 'EMP001', phone: '+1-555-0001', department_name: 'Computer Science', designation: 'HOD', experience_years: 10, specialization: 'AI/ML', status: 'pending', requested_at: '2024-01-15T10:00:00Z' },
          { id: 2, name: 'Dr. Test HOD 2', email: 'test2@university.edu', employee_id: 'EMP002', phone: '+1-555-0002', department_name: 'Mathematics', designation: 'HOD', experience_years: 8, specialization: 'Statistics', status: 'approved', requested_at: '2024-01-10T09:00:00Z', reviewed_at: '2024-01-12T14:00:00Z' }
        ]);
        setHodRequests({ pending: 1, approved: 1, rejected: 0, total: 2 });
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/register/admin/hod-requests/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('HOD requests API error:', response.status, response.statusText);
        // Fallback to mock data
        setHodRequestsList([
          { id: 1, name: 'Dr. Test HOD 1', email: 'test1@university.edu', employee_id: 'EMP001', phone: '+1-555-0001', department_name: 'Computer Science', designation: 'HOD', experience_years: 10, specialization: 'AI/ML', status: 'pending', requested_at: '2024-01-15T10:00:00Z' },
          { id: 2, name: 'Dr. Test HOD 2', email: 'test2@university.edu', employee_id: 'EMP002', phone: '+1-555-0002', department_name: 'Mathematics', designation: 'HOD', experience_years: 8, specialization: 'Statistics', status: 'approved', requested_at: '2024-01-10T09:00:00Z', reviewed_at: '2024-01-12T14:00:00Z' }
        ]);
        setHodRequests({ pending: 1, approved: 1, rejected: 0, total: 2 });
        return;
      }
      
      const data = await response.json();
      console.log('HOD requests response:', data);
      
      // Handle both possible response structures
      const requests = data.requests || data.data || [];
      const stats = data.stats || {
        pending: requests.filter((r: any) => r.status === 'pending').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        rejected: requests.filter((r: any) => r.status === 'rejected').length,
        total: requests.length
      };
      
      setHodRequestsList(requests);
      setHodRequests(stats);
    } catch (error) {
      console.error('Error loading HOD requests:', error);
      // Fallback to mock data on error
      setHodRequestsList([
        { id: 1, name: 'Dr. Test HOD 1', email: 'test1@university.edu', employee_id: 'EMP001', phone: '+1-555-0001', department_name: 'Computer Science', designation: 'HOD', experience_years: 10, specialization: 'AI/ML', status: 'pending', requested_at: '2024-01-15T10:00:00Z' },
        { id: 2, name: 'Dr. Test HOD 2', email: 'test2@university.edu', employee_id: 'EMP002', phone: '+1-555-0002', department_name: 'Mathematics', designation: 'HOD', experience_years: 8, specialization: 'Statistics', status: 'approved', requested_at: '2024-01-10T09:00:00Z', reviewed_at: '2024-01-12T14:00:00Z' }
      ]);
      setHodRequests({ pending: 1, approved: 1, rejected: 0, total: 2 });
    } finally {
      setHodRequestsLoading(false);
    }
  };

  const handleHodRequestAction = async (requestId: number, action: string) => {
    const reason = action === 'reject' ? prompt('Rejection reason (optional):') : undefined;
    try {
      const response = await fetch(`http://localhost:8000/api/register/admin/hod-requests/${requestId}/action/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      });
      if (response.ok) {
        await loadHodRequests();
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };



  // Navigation tabs
  const tabs = useMemo<{ id: TabId; label: string; icon: string }[]>(() => {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { id: 'instructors', label: 'Instructors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { id: 'principal', label: 'Principal', icon: 'M12 2l9 4v2H3V6l9-4zm0 6a9 9 0 00-9 9v5h18v-5a9 9 0 00-9-9z' },
      { id: 'hod', label: 'HOD', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'departments', label: 'Departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { id: 'results', label: 'Results', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { id: 'attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { id: 'announcements', label: 'Announcements', icon: 'M3 10v4a1 1 0 001 1h3l4 3V6l-4 3H4a1 1 0 00-1 1z' },
      { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
    ];
    }, []);
     
  // Render navigation tabs
  const renderTabs = () => {
    return (
      <div className="w-64 bg-gradient-to-b from-indigo-600 via-purple-700 to-pink-800 text-white p-4 space-y-2 min-h-screen shadow-xl">
        <div className="mb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-2 flex items-center justify-center border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">FGPG Admin</h3>
          <p className="text-xs text-blue-200">University Management</p>
        </div>

        <nav>
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
          <div className="absolute bottom-4 right-4 text-center text-xs text-indigo-300">
            <p>ICMS</p>
            <p>Version 1.0.0</p>
          </div>
        </nav>
      </div>
    );
  };
  
  // Render HOD Requests Tab
  const renderHodRequestsTab = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <motion.div
        key="hod-requests"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">HOD Registration Requests</h2>
          <button
            onClick={loadHodRequests}
            disabled={hodRequestsLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${hodRequestsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => setSelectedFilter('all')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{hodRequests?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('pending')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{hodRequests?.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('approved')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{hodRequests?.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('rejected')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">{hodRequests?.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Showing:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedFilter === 'all' ? 'bg-blue-100 text-blue-800' :
              selectedFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              selectedFilter === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedFilter === 'all' ? 'All Requests' : 
               selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1) + ' Requests'}
            </span>
          </div>
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filter
          </button>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hodRequestsLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading requests...</p>
            </div>
          ) : !hodRequestsList || hodRequestsList.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2">No HOD requests found.</p>
            </div>
          ) : (
            (hodRequestsList || [])
              .filter(request => selectedFilter === 'all' || request.status === selectedFilter)
              .map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(request.requested_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.designation}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{request.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{request.department_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{request.specialization}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  {request.status !== 'pending' && request.reviewed_at && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">
                        {request.status === 'approved' ? 'Approved on:' : 'Rejected on:'}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(request.reviewed_at).toLocaleDateString()} at {new Date(request.reviewed_at).toLocaleTimeString()}
                      </div>
                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Reason:</div>
                          <div className="text-sm text-gray-700">{request.rejection_reason}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleHodRequestAction(request.id, 'approve')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleHodRequestAction(request.id, 'reject')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  // Render Results Tab
  const renderResultsTab = () => {
    const selectedStudentData = students.find(s => s.id === selectedStudent);

    return (
      <motion.div
        key="results"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <motion.h2
            className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            Student Results Management
          </motion.h2>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Department
              </label>
              <select
                value={selectedDepartment || ''}
                onChange={(e) => setSelectedDepartment(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {getDepartmentName(dept)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Semester
              </label>
              <select
                value={selectedSemester || ''}
                onChange={(e) => setSelectedSemester(Number(e.target.value) || null)}
                disabled={!selectedDepartment || !semesters.length}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">
                  {selectedDepartment ? (semesters.length ? 'Choose a semester...' : 'No semesters available') : 'Select department first'}
                </option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {getSemesterName(sem)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(Number(e.target.value) || null)}
                disabled={!selectedDepartment || !selectedSemester || loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">
                  {loading ? 'Loading students...' : (selectedDepartment && selectedSemester) ? 'Choose a student...' : 'Select department and semester first'}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {getStudentName(student)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Information */}
          {selectedStudentData && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getStudentName(selectedStudentData)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedStudentData.student_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getDepartmentName(departments.find(d => d.id === selectedDepartment))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Semester</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getSemesterName(selectedStudentData?.semester)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Results Display */}
          {selectedStudent && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Results</h3>
                <button
                  onClick={generateReportCard}
                  disabled={studentResults.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:dark:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Generate Report Card</span>
                </button>
              </div>

              {resultsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading results...</p>
                </div>
              ) : (
                <div>
                  {/* Course Overview */}
                  {studentCourses.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Course Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {studentCourses.map((course, index) => {
                          const result = studentResults && Array.isArray(studentResults)
                            ? studentResults.find(r => r.subject === getCourseName(course))
                            : null;

                          return (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">{getCourseName(course)}</h5>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result ? (result.grade === 'A' || result.grade === 'A-' || result.grade === 'B+' || result.grade === 'B' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : result.grade === 'C' || result.grade === 'C-' || result.grade === 'D' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200') : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                  {result ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                              {result && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <p>Grade: <span className="font-medium">{result.grade || 'N/A'}</span></p>
                                  <p>GPA: <span className="font-medium">{result.gpa || 'N/A'}</span></p>
                                </div>
                              )}
                              {!result && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Result pending</p>
                              )}
                            </div>
                          );
                              })}
                      </div>
                    </div>
                  )}

                  {/* Detailed Results Table */}
                  {studentResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              GPA
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {studentResults.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {result.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {result.grade || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {result.gpa || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.grade === 'A' || result.grade === 'A-' || result.grade === 'B+' || result.grade === 'B' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : result.grade === 'C' || result.grade === 'C-' || result.grade === 'D' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                  {result.grade ? 'Completed' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewResultDetails(result)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2">No results found for this student.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Result Details Modal */}
        {showResultDetailsModal && selectedResultForDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Result Details</h3>
                  <button
                    onClick={() => setShowResultDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setResultDetailsActiveTab('course')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        resultDetailsActiveTab === 'course'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Course Details
                    </button>
                    <button
                      onClick={() => setResultDetailsActiveTab('all')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        resultDetailsActiveTab === 'all'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All Courses
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div>
                  {resultDetailsActiveTab === 'course' ? (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Course</p>
                            <p className="font-medium">{selectedResultForDetails.subject || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Exam Type</p>
                            <p className="font-medium">{selectedResultForDetails.exam_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Exam Date</p>
                            <p className="font-medium">
                              {selectedResultForDetails.exam_date
                                ? new Date(selectedResultForDetails.exam_date).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Grade</p>
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${selectedResultForDetails.grade === 'F' ? 'bg-red-100 text-red-800' : selectedResultForDetails.grade?.startsWith('A') ? 'bg-green-100 text-green-800' : selectedResultForDetails.grade?.startsWith('B') ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {selectedResultForDetails.grade || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Marks Breakdown */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Marks Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Obtained Marks</span>
                            <span className="font-medium">{selectedResultForDetails.obtained_marks || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Marks</span>
                            <span className="font-medium">{selectedResultForDetails.total_marks || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Percentage</span>
                            <span className="font-medium">{selectedResultForDetails.percentage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">GPA Points</span>
                            <span className="font-medium">{selectedResultForDetails.gpa || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Assessment Breakdown */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Complete Assessment Breakdown</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Detailed marks for all assessments in this course
                        </p>

                        {/* Get all results for this course */}
                        {(() => {
                          const courseResults = studentResults.filter(r => r.subject === selectedResultForDetails.subject);
                          const quiz1 = courseResults.find(r => r.exam_type.toLowerCase().includes('quiz 1'));
                          const quiz2 = courseResults.find(r => r.exam_type.toLowerCase().includes('quiz 2'));
                          const assignment1 = courseResults.find(r => r.exam_type.toLowerCase().includes('assignment 1'));
                          const assignment2 = courseResults.find(r => r.exam_type.toLowerCase().includes('assignment 2'));
                          const midTerm = courseResults.find(r => r.exam_type.toLowerCase().includes('mid'));
                          const finalExam = courseResults.find(r => r.exam_type.toLowerCase().includes('final'));

                          return (
                            <div className="space-y-3">
                              {/* Quizzes */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Quiz 1</span>
                                    <span className={`text-sm font-bold ${quiz1 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {quiz1 ? `${quiz1.obtained_marks}/5` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {quiz1 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(quiz1.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Quiz 2</span>
                                    <span className={`text-sm font-bold ${quiz2 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {quiz2 ? `${quiz2.obtained_marks}/5` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {quiz2 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(quiz2.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Assignments */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Assignment 1</span>
                                    <span className={`text-sm font-bold ${assignment1 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {assignment1 ? `${assignment1.obtained_marks}/5` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {assignment1 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(assignment1.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Assignment 2</span>
                                    <span className={`text-sm font-bold ${assignment2 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {assignment2 ? `${assignment2.obtained_marks}/5` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {assignment2 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(assignment2.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Mid-term and Final */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Mid-term Exam</span>
                                    <span className={`text-sm font-bold ${midTerm ? 'text-green-600' : 'text-gray-400'}`}>
                                      {midTerm ? `${midTerm.obtained_marks}/25` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {midTerm && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(midTerm.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Final Exam</span>
                                    <span className={`text-sm font-bold ${finalExam ? 'text-green-600' : 'text-gray-400'}`}>
                                      {finalExam ? `${finalExam.obtained_marks}/60` : 'Not submitted'}
                                    </span>
                                  </div>
                                  {finalExam && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(finalExam.exam_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Total Calculation */}
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                                <h5 className="text-sm font-semibold text-blue-900 mb-2">Grade Calculation</h5>
                                <div className="text-sm text-blue-800 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Quizzes (10 marks total):</span>
                                    <span>{((quiz1?.obtained_marks || 0) + (quiz2?.obtained_marks || 0))}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Assignments (10 marks total):</span>
                                    <span>{((assignment1?.obtained_marks || 0) + (assignment2?.obtained_marks || 0))}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Mid-term (25 marks):</span>
                                    <span>{midTerm?.obtained_marks || 0}/25</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Final Exam (60 marks):</span>
                                    <span>{finalExam?.obtained_marks || 0}/60</span>
                                  </div>
                                  <hr className="my-2" />
                                  <div className="flex justify-between font-semibold">
                                    <span>Total Score:</span>
                                    <span>
                                      {((quiz1?.obtained_marks || 0) + (quiz2?.obtained_marks || 0) +
                                        (assignment1?.obtained_marks || 0) + (assignment2?.obtained_marks || 0) +
                                        (midTerm?.obtained_marks || 0) + (finalExam?.obtained_marks || 0))}/105
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-lg">
                                    <span>Final Grade:</span>
                                    <span className={selectedResultForDetails.grade === 'F' ? 'text-red-600' : selectedResultForDetails.grade?.startsWith('A') ? 'text-green-600' : 'text-blue-600'}>
                                      {selectedResultForDetails.grade}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Remarks */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Remarks</h4>
                        <p className="text-sm text-gray-700">
                          {selectedResultForDetails.remarks || (selectedResultForDetails.grade === 'F' ? 'Failed - Needs improvement' : selectedResultForDetails.grade?.startsWith('A') ? 'Excellent performance' : selectedResultForDetails.grade?.startsWith('B') ? 'Good performance' : 'Satisfactory performance')}
                        </p>
                      </div>
                    </div>
                  ) : resultDetailsActiveTab === 'all' ? (
                    <div className="space-y-6">
                      {/* All Courses Overview */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">All Courses Assessment Status</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Overview of all courses and their assessment completion status
                        </p>

                        <div className="space-y-4">
                          {studentCourses.map((course, index) => {
                            const courseResults = studentResults.filter(r => r.subject === getCourseName(course));
                            const finalResult = courseResults.find(r => r.exam_type.toLowerCase().includes('final'));

                            // Count completed assessments
                            const quiz1 = courseResults.find(r => r.exam_type.toLowerCase().includes('quiz 1'));
                            const quiz2 = courseResults.find(r => r.exam_type.toLowerCase().includes('quiz 2'));
                            const assignment1 = courseResults.find(r => r.exam_type.toLowerCase().includes('assignment 1'));
                            const assignment2 = courseResults.find(r => r.exam_type.toLowerCase().includes('assignment 2'));
                            const midTerm = courseResults.find(r => r.exam_type.toLowerCase().includes('mid'));
                            const finalExam = courseResults.find(r => r.exam_type.toLowerCase().includes('final'));

                            const completedAssessments = [quiz1, quiz2, assignment1, assignment2, midTerm, finalExam].filter(Boolean).length;
                            const totalAssessments = 6;

                            return (
                              <div key={index} className="bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{getCourseName(course)}</h5>
                                    <p className="text-sm text-gray-600">
                                      {completedAssessments}/{totalAssessments} assessments completed
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {finalResult ? (
                                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${finalResult.grade === 'F' ? 'bg-red-100 text-red-800' : finalResult.grade?.startsWith('A') ? 'bg-green-100 text-green-800' : finalResult.grade?.startsWith('B') ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {finalResult.grade}
                                      </span>
                                    ) : (
                                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Pending
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Assessment Status Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                  <div className={`p-2 rounded ${quiz1 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Quiz 1: {quiz1 ? '✓' : 'Pending'}
                                  </div>
                                  <div className={`p-2 rounded ${quiz2 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Quiz 2: {quiz2 ? '✓' : 'Pending'}
                                  </div>
                                  <div className={`p-2 rounded ${assignment1 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Assignment 1: {assignment1 ? '✓' : 'Pending'}
                                  </div>
                                  <div className={`p-2 rounded ${assignment2 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Assignment 2: {assignment2 ? '✓' : 'Pending'}
                                  </div>
                                  <div className={`p-2 rounded ${midTerm ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Mid-term: {midTerm ? '✓' : 'Pending'}
                                  </div>
                                  <div className={`p-2 rounded ${finalExam ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                    Final Exam: {finalExam ? '✓' : 'Pending'}
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round((completedAssessments / totalAssessments) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(completedAssessments / totalAssessments) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowResultDetailsModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };



  // Chart data for performance overview
  const performanceChartData = useMemo(() => {
    return {
      labels: ['Attendance', 'Assignments', 'Mid-term', 'Final', 'Projects'],
      datasets: [
        {
          label: 'Average Score',
          data: [85, 90, 75, 88, 82],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, []);





  // Render HOD Tab (merged requests and records with enhanced management)
  const renderHodTab = () => {
    return (
      <motion.div
        key="hod"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6"
      >
        {/* Toggle Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-1">
              <button
                onClick={() => setHodView('requests')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  hodView === 'requests' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Registration Requests</span>
                </div>
              </button>
              <button
                onClick={() => setHodView('records')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  hodView === 'records' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Active HODs</span>
                </div>
              </button>
              <button
                onClick={() => setHodView('retired')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  hodView === 'retired' 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Retired HODs</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {hodView === 'requests' ? renderHodRequestsContent() : 
         hodView === 'records' ? renderHodRecordsContent() : 
         renderRetiredHodsContent()}
        
        {/* View HOD Details Modal */}
        <AnimatePresence>
          {showViewModal && selectedHodForView && (
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
                    <h3 className="text-xl font-bold text-gray-900">HOD Profile Details</h3>
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
                      <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
                        {selectedHodForView.image ? (
                          <img src={selectedHodForView.image} alt={selectedHodForView.name} className="h-24 w-24 rounded-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-purple-600">{selectedHodForView.name?.charAt(0) || 'H'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{selectedHodForView.name}</h4>
                        <p className="text-lg text-gray-600">{selectedHodForView.designation}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                          selectedHodForView.status === 'retired' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedHodForView.status === 'retired' ? '⏰ Retired HOD' : '✓ Active HOD'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedHodForView.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedHodForView.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Department</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedHodForView.department?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Specialization</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedHodForView.specialization}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Experience</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedHodForView.experience_years} years</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedHodForView.hire_date ? new Date(selectedHodForView.hire_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        {selectedHodForView.status === 'retired' && selectedHodForView.retired_date && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Retired Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(selectedHodForView.retired_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
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

        {/* Edit HOD Modal */}
        <AnimatePresence>
          {showEditModal && selectedHodForEdit && (
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
                    <h3 className="text-xl font-bold text-gray-900">Edit HOD Profile</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); updateHodRecord(); }} className="space-y-4">
                    {/* Profile Image Upload */}
                    <div className="flex items-center space-x-6">
                      <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                        {selectedImage ? (
                          <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
                        ) : selectedHodForEdit.image ? (
                          <img src={selectedHodForEdit.image} alt={selectedHodForEdit.name} className="h-24 w-24 rounded-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-purple-600">{editFormData.name?.charAt(0) || selectedHodForEdit.name?.charAt(0) || 'H'}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                        <input
                          type="text"
                          value={editFormData.specialization || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                        <input
                          type="number"
                          value={editFormData.experience_years || 0}
                          onChange={(e) => setEditFormData({ ...editFormData, experience_years: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                        <input
                          type="date"
                          value={editFormData.hire_date || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, hire_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          value={editFormData.employee_id || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, employee_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          value={editFormData.department?.id || editFormData.department || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Department</option>
                          {adminData.departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedHodForEdit(null);
                          setEditFormData({});
                          setSelectedImage(null);
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!editFormData.name || !editFormData.email || isUpdating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{isUpdating ? 'Updating...' : 'Update Profile'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderHodRecordsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Active HOD Records</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setHodView('retired')}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Retired HODs
            </button>
            <button
              onClick={addApprovedHodsToActive}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Activate Approved HODs
            </button>
            <button
              onClick={loadHodRecords}
              disabled={hodRecordsLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${hodRecordsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hodRecordsLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading HOD records...</p>
            </div>
          ) : hodRecords.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2">No active HOD records found.</p>
              <p className="text-sm text-gray-400 mt-1">Approve HOD registration requests to activate them as HODs.</p>
            </div>
          ) : (
            hodRecords.map((hod) => (
              <div key={hod.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                      {hod.image ? (
                        <img src={hod.image} alt={hod.name} className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-purple-600">{hod.name?.charAt(0) || 'H'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hod.name}</h3>
                      <p className="text-sm text-gray-600">{hod.designation || 'Head of Department'}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        ✓ Active HOD
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{hod.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{hod.department?.name || hod.department_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>{hod.specialization || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    {/* Primary Actions Row */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editHodRecord(hod.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="Edit HOD profile"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit Profile</span>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteHodRecord(hod.id, hod.name)}
                        disabled={isDeleting === hod.id}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                        title="Deactivate HOD status"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isDeleting === hod.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          )}
                          <span>{isDeleting === hod.id ? 'Removing...' : 'Deactivate'}</span>
                        </div>
                      </button>
                    </div>
                    
                    {/* Secondary Action Row */}
                    <button
                      onClick={() => viewHodDetails(hod.id)}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      title="View detailed HOD information"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Full Details</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderHodRequestsContent = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">HOD Registration Requests</h3>
          <button
            onClick={loadHodRequests}
            disabled={hodRequestsLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${hodRequestsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => setSelectedFilter('all')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{hodRequests?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('pending')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{hodRequests?.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('approved')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{hodRequests?.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setSelectedFilter('rejected')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">{hodRequests?.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Showing:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedFilter === 'all' ? 'bg-blue-100 text-blue-800' :
              selectedFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              selectedFilter === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedFilter === 'all' ? 'All Requests' : 
               selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1) + ' Requests'}
            </span>
          </div>
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filter
          </button>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hodRequestsLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading requests...</p>
            </div>
          ) : !hodRequestsList || hodRequestsList.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2">No HOD requests found.</p>
            </div>
          ) : (
            (hodRequestsList || [])
              .filter(request => selectedFilter === 'all' || request.status === selectedFilter)
              .map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(request.requested_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.designation}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{request.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{request.department_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{request.specialization}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  {request.status !== 'pending' && request.reviewed_at && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">
                        {request.status === 'approved' ? 'Approved on:' : 'Rejected on:'}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(request.reviewed_at).toLocaleDateString()} at {new Date(request.reviewed_at).toLocaleTimeString()}
                      </div>
                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Reason:</div>
                          <div className="text-sm text-gray-700">{request.rejection_reason}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleHodRequestAction(request.id, 'approve')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleHodRequestAction(request.id, 'reject')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const loadHodRecords = async () => {
    setHodRecordsLoading(true);
    try {
      if (!token) {
        console.error('No auth token found for HOD records');
        setHodRecords([]);
        return;
      }

      // Try multiple endpoints to get HOD records
      let hodData = [];
      
      // First try the HOD records endpoint
      try {
        const response = await fetch('http://localhost:8000/api/register/admin/hod-records/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('HOD records response:', data);
          hodData = data.data || data.records || data || [];
        } else {
          console.log('HOD records endpoint failed, trying approved requests...');
        }
      } catch (error) {
        console.log('HOD records endpoint error, trying approved requests...');
      }

      // If no records found, try to get approved HOD requests
      if (hodData.length === 0) {
        try {
          const requestsResponse = await fetch('http://localhost:8000/api/register/admin/hod-requests/', {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            const approvedRequests = (requestsData.requests || requestsData.data || []).filter(
              (request: any) => request.status === 'approved'
            );
            
            // Convert approved requests to HOD records format
            hodData = approvedRequests.map((request: any) => ({
              id: request.id,
              name: request.name,
              email: request.email,
              phone: request.phone,
              employee_id: request.employee_id,
              department_name: request.department_name,
              designation: request.designation || 'Head of Department',
              specialization: request.specialization,
              experience_years: request.experience_years,
              status: 'active'
            }));
            
            console.log('Using approved HOD requests as active HODs:', hodData);
          }
        } catch (error) {
          console.error('Error fetching approved HOD requests:', error);
        }
      }
      
      setHodRecords(hodData);
    } catch (error) {
      console.error('Error loading HOD records:', error);
      setHodRecords([]);
    } finally {
      setHodRecordsLoading(false);
    }
  };

  const editHodRecord = (hodId: number) => {
    const hod = hodRecords.find(h => h.id === hodId);
    
    if (hod) {
      setSelectedHodForEdit(hod);
      // Properly initialize form data with all fields
      setEditFormData({
        name: hod.name || '',
        email: hod.email || '',
        phone: hod.phone || '',
        employee_id: hod.employee_id || '',
        specialization: hod.specialization || '',
        experience_years: hod.experience_years || 0,
        hire_date: hod.hire_date || '',
        department_name: hod.department_name || hod.department?.name || '',
        designation: hod.designation || 'Head of Department'
      });
      setSelectedImage(null);
      setShowEditModal(true);
      console.log('Editing HOD:', hod);
      console.log('Form data initialized:', {
        name: hod.name,
        email: hod.email,
        phone: hod.phone,
        specialization: hod.specialization
      });
    }
  };

  const viewHodDetails = (hodId: number) => {
    const hod = hodRecords.find(h => h.id === hodId);
    
    if (hod) {
      setSelectedHodForView(hod);
      setShowViewModal(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const updateHodRecord = async () => {
    if (!selectedHodForEdit) return;
    
    setIsUpdating(true);
    
    const updateData = {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      specialization: editFormData.specialization,
      experience_years: editFormData.experience_years,
      image: selectedImage ? URL.createObjectURL(selectedImage) : selectedHodForEdit.image
    };

    // Update local state immediately
    setHodRecords(prevRecords => 
      prevRecords.map(hod => 
        hod.id === selectedHodForEdit.id 
          ? { ...hod, ...updateData }
          : hod
      )
    );
    
    setShowEditModal(false);
    setSelectedHodForEdit(null);
    setSelectedImage(null);
    setIsUpdating(false);
    alert('HOD profile updated successfully!');
  };

  const calculateServicePeriod = (hireDate: string, retiredDate: string) => {
    if (!hireDate) return 'N/A';
    
    const hire = new Date(hireDate);
    const retired = new Date(retiredDate || new Date());
    
    const diffTime = Math.abs(retired.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}, ${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const addApprovedHodsToActive = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/register/admin/create-hod-from-request/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        alert(responseData.message);
        await loadHodRecords();
      } else {
        alert(responseData.error || 'Failed to add approved HODs');
      }
    } catch (error) {
      console.error('Error adding approved HODs:', error);
      alert('Network error occurred while adding approved HODs.');
    }
  };

  const deleteHodRecord = async (hodId: number, hodName: string) => {
    if (window.confirm(`Are you sure you want to remove ${hodName} from active HODs? This will deactivate their HOD status but preserve their record.`)) {
      setIsDeleting(hodId);
      try {
        let success = false;
        let response;

        // Try multiple endpoints for deletion
        // First try the dedicated HOD records endpoint
        try {
          response = await fetch(`http://localhost:8000/api/register/admin/hod-records/${hodId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            success = true;
          }
        } catch (error) {
          console.log('HOD records delete endpoint failed, trying alternative...');
        }

        // If that fails, try updating the status through requests endpoint
        if (!success) {
          try {
            response = await fetch(`http://localhost:8000/api/register/admin/hod-requests/${hodId}/action/`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                action: 'deactivate',
                reason: 'Deactivated by admin'
              })
            });
            
            if (response.ok) {
              success = true;
            }
          } catch (error) {
            console.log('HOD requests deactivate endpoint also failed');
          }
        }

        // If both fail, try a simple status update
        if (!success) {
          try {
            response = await fetch(`http://localhost:8000/api/register/admin/hod-requests/${hodId}/`, {
              method: 'PUT',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                status: 'inactive'
              })
            });
            
            if (response.ok) {
              success = true;
            }
          } catch (error) {
            console.log('Status update also failed');
          }
        }
        
        if (success) {
          // Update local state immediately
          setHodRecords(prevRecords => 
            prevRecords.filter(hod => hod.id !== hodId)
          );
          
          alert(`${hodName} has been deactivated successfully.`);
          
          // Reload data to ensure consistency
          await loadHodRecords();
        } else {
          const errorData = response ? await response.json().catch(() => ({})) : {};
          if (response?.status === 403) {
            alert('Permission denied. You do not have permission to deactivate HOD records.');
          } else {
            alert(errorData.error || `Failed to deactivate HOD record. Status: ${response?.status || 'Unknown'}`);
          }
        }
      } catch (error) {
        console.error('Error deactivating HOD:', error);
        alert('Network error occurred while deactivating HOD record.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Load HOD data when tab is active
  useEffect(() => {
    if (activeTab === 'hod') {
      loadHodRequests();
      loadHodRecords();
      if (hodView === 'retired') {
        loadRetiredHods();
      }
    }
  }, [activeTab, hodView]);

  const loadRetiredHods = async () => {
    setRetiredHodsLoading(true);
    try {
      if (!token) {
        console.error('No auth token found for retired HODs');
        setRetiredHods([]);
        return;
      }

      let retiredData: any[] = [];

      // Try to fetch retired HODs from dedicated endpoint
      try {
        console.log('Fetching retired HODs from:', 'http://localhost:8000/api/register/admin/retired-hods/');
        const response = await fetch('http://localhost:8000/api/register/admin/retired-hods/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Retired HODs response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Retired HODs response data:', data);
          const apiRetiredData = data.data || data.retired_hods || data || [];
          console.log('Processed retired data:', apiRetiredData);
          
          if (Array.isArray(apiRetiredData) && apiRetiredData.length > 0) {
            retiredData = [...retiredData, ...apiRetiredData];
          }
        }
      } catch (error) {
        console.log('Retired HODs endpoint failed with error:', error);
      }

      // Also try to get rejected HOD requests
      try {
        console.log('Fetching rejected HOD requests...');
        const response = await fetch('http://localhost:8000/api/register/admin/hod-requests/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const allRequests = data.requests || data.data || [];
          const rejectedRequests = allRequests.filter((req: any) => req.status === 'rejected');
          
          if (rejectedRequests.length > 0) {
            const processedRejected = rejectedRequests.map((req: any) => ({
              ...req,
              status: 'rejected',
              retired_at: req.reviewed_at || req.updated_at || new Date().toISOString(),
              retirement_reason: req.rejection_reason || 'Application rejected',
              hire_date: null,
              department_name: req.department_name || 'N/A'
            }));
            retiredData = [...retiredData, ...processedRejected];
          }
        }
      } catch (error) {
        console.log('HOD requests endpoint error:', error);
      }

      // Process and normalize the data
      const processedRetiredHods = retiredData.map((hod: any) => ({
        ...hod,
        id: hod.id || Math.random(),
        name: hod.name || 'Unknown HOD',
        email: hod.email || 'N/A',
        status: hod.status || 'retired',
        retired_at: hod.retired_at || hod.reviewed_at || hod.updated_at || new Date().toISOString(),
        retirement_reason: hod.retirement_reason || hod.rejection_reason || 'Retired',
        hire_date: hod.hire_date || hod.created_at || null,
        department_name: hod.department?.name || hod.department_name || 'N/A',
        designation: hod.designation || 'Head of Department',
        specialization: hod.specialization || 'N/A'
      }));

      console.log('Final processed retired HODs:', processedRetiredHods);
      setRetiredHods(processedRetiredHods);
    } catch (error) {
      console.error('Error loading retired HODs:', error);
      setRetiredHods([]);
    } finally {
      setRetiredHodsLoading(false);
    }
  };

  const viewRetiredHodDetails = (hodId: number) => {
    const hod = retiredHods.find(h => h.id === hodId);
    
    if (hod) {
      setSelectedHodForView(hod);
      setShowViewModal(true);
    }
  };

  const retireHodRecord = async (hodId: number, hodName: string) => {
    if (window.confirm(`Are you sure you want to retire ${hodName}? They will be moved to retired HODs.`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/hods/admin/records/${hodId}/retire/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          await loadHodRecords();
          await loadRetiredHods();
          alert(`${hodName} has been retired successfully.`);
        } else {
          alert(`Failed to retire HOD. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error retiring HOD:', error);
        alert('Network error occurred while retiring HOD.');
      }
    }
  };

  const renderRetiredHodsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Retired & Deactivated HODs</h3>
            <p className="text-sm text-gray-600 mt-1">HODs who were previously active and then retired or deactivated</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadRetiredHods}
              disabled={retiredHodsLoading}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${retiredHodsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {retiredHodsLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading retired HOD records...</p>
            </div>
          ) : retiredHods.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2">No retired HOD records found.</p>
            </div>
          ) : (
            retiredHods.map((hod) => {
              const servicePeriod = calculateServicePeriod(hod.hire_date, hod.retired_at);
              return (
                <div key={hod.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xl">
                        {hod.image ? (
                          <img src={hod.image} alt={hod.name || 'HOD'} className="h-16 w-16 rounded-full object-cover" />
                        ) : (
                          (hod.name || 'H').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{hod.name || 'Unknown HOD'}</h3>
                        <p className="text-sm text-gray-600">{hod.designation || 'Head of Department'}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            hod.status === 'retired' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {hod.status === 'retired' ? 'Retired' : 'Deactivated'}
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
                        <span>{hod.department_name || hod.department?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{hod.status === 'retired' ? 'Retired' : 'Deactivated'} on {hod.retired_at ? new Date(hod.retired_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-blue-600">Served: {servicePeriod}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{hod.specialization || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedHodForView(hod);
                          setShowViewModal(true);
                        }}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProfileDropdown && !target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Main render
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalScrollbarStyle }} />
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {renderTabs()}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 p-6 shadow-xl border-b border-white/20">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tabs.find(tab => tab.id === activeTab)?.icon || 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'} />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {activeTab === 'dashboard' ? 'Admin Dashboard' : 
                     tabs.find(tab => tab.id === activeTab)?.label || 'Admin Dashboard'}
                  </h1>
                  <p className="text-purple-100 text-sm">
                    {activeTab === 'dashboard' ? 'University Management System' :
                     `Manage ${tabs.find(tab => tab.id === activeTab)?.label || 'System'}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">Welcome back, {currentUser?.name || 'Admin'}</p>
                <p className="text-purple-200 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </motion.div>
          </header>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{adminData.stats.totalStudents}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                   {/* HOD Requests Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">HOD Requests</h3>
                    <div className={`h-3 w-3 rounded-full ${hodRequests.pending > 0 ? 'bg-orange-400 animate-pulse' : 'bg-green-400'} shadow-lg`}></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center mb-4">
                    <div className="bg-orange-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-orange-600">{hodRequests.pending}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-green-600">{hodRequests.approved}</p>
                      <p className="text-xs text-gray-600">Approved</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-red-600">{hodRequests.rejected}</p>
                      <p className="text-xs text-gray-600">Rejected</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xl font-bold text-gray-900">{hodRequests.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('hod')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    Manage Requests
                  </button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Instructors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{adminData.stats.totalStaff}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Departments</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{adminData.stats.totalDepartments}</p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                >
                  <NotificationPanel />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    <div className="h-64">
                      <Bar data={performanceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                    <SystemHealthWidget />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                >
                  <QuickActions />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                >
                  <AIInsights />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                >
                  <ActivityFeed />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                >
                  <CalendarWidget />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'students' && <StudentManagement activeTab={activeTab} />}
            {activeTab === 'instructors' && <TeacherManagement activeTab={activeTab} />}
            {activeTab === 'principal' && <PrincipalManagement />}
            {activeTab === 'departments' && <DepartmentManagement activeTab={activeTab} />}

            {activeTab === 'results' && renderResultsTab()}
            {activeTab === 'attendance' && <AdminAttendanceManagement />}

            {activeTab === 'hod' && renderHodTab()}

            {activeTab === 'events' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <EventManagement />
              </motion.div>
            )}
            {activeTab === 'announcements' && (
              <motion.div
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-2xl font-bold text-blue-600 mb-4">📢 Manage Announcements</h2>

                {/* Add Announcement Form */}
                <form onSubmit={handleCreateAnnouncement} className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                    }
                    className="w-full p-2 border rounded-md dark:bg-gray-700"
                    required
                  />
                  <textarea
                    placeholder="Message"
                    value={newAnnouncement.message}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                    }
                    className="w-full p-2 border rounded-md dark:bg-gray-700"
                    rows={4}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Add Announcement
                  </button>
                </form>

                {/* Announcement List */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Existing Announcements</h3>
                  {announcements.length > 0 ? (
                    announcements.map((a: any, i: number) => (
                      <div
                        key={i}
                        className="border-b border-gray-300 dark:border-gray-700 py-3 mb-3"
                      >
                        <h4 className="text-blue-600 font-bold">{a.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{a.message}</p>
                        <p className="text-xs text-gray-400">
                          Posted on: {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No announcements yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
