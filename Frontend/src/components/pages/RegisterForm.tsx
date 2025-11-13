import React, { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import { motion } from "framer-motion";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  first_name: string;
  last_name: string;
  // HOD specific fields
  employee_id?: string;
  phone?: string;
  department_id?: number;
  designation?: string;
  experience_years?: number;
  specialization?: string;
}

interface Department {
  department_id?: number;
  id?: number;
  name: string;
  code: string;
}

const Register = () => {
  const { register, error: authError, loading } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student", // default role
    first_name: "",
    last_name: "",
    // HOD specific fields
    employee_id: "",
    phone: "",
    department_id: 0,
    designation: "HOD",
    experience_years: 0,
    specialization: "",
  });
  
  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentsError('');
      try {
        console.log('Fetching departments...');
        const response = await fetch('http://localhost:8000/api/academics/departments/');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Departments data:', data);
        setDepartments(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartmentsError('Failed to load departments');
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Sync auth context error with local error state
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;

    // Parse number fields
    if (name === 'department_id' || name === 'experience_years') {
      parsedValue = value === '' ? 0 : parseInt(value, 10);
    }

    setForm({ ...form, [name]: parsedValue });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    
    // HOD specific validation
    if (form.role === 'hod') {
      if (!form.employee_id.trim() || !form.phone.trim() || !form.specialization.trim() || form.department_id === 0) {
        setError("Please fill in all HOD required fields: Employee ID, Phone, Department, and Specialization");
        return;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Password validation (at least 6 characters)
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    // Password confirmation validation
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

<<<<<<< HEAD
    // Create user data based on role
    let userData;
    
    if (form.role === 'hod') {
      // HOD-specific data structure
      userData = {
        name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        employee_id: form.employee_id,
        phone: form.phone,
        department_id: form.department_id,
        designation: form.designation,
        experience_years: form.experience_years,
        specialization: form.specialization,
        password: form.password,
        confirm_password: form.confirm_password
      };
    } else {
      // Regular user data structure
      userData = {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        role: form.role,
        first_name: form.first_name,
        last_name: form.last_name
      };
    }
    
    try {
      // For HOD registration, use dedicated HOD endpoint
      if (form.role === 'hod') {
        const response = await fetch('http://localhost:8000/api/hods/registration/', {
=======
    // Create a complete user object that matches the Person model
    const userData = {
      username: form.username,
      email: form.email,
      password: form.password,
      confirm_password: form.confirm_password,
      role: form.role,
      first_name: form.first_name,
      last_name: form.last_name,
      // Always include HOD fields (will be ignored for non-HOD roles)
      employee_id: form.employee_id,
      phone: form.phone,
      department_id: form.department_id,
      designation: form.designation,
      experience_years: form.experience_years,
      specialization: form.specialization
    };
    
    try {
      // For HOD registration, handle response differently
      if (form.role === 'hod') {
        const response = await fetch('http://localhost:8000/api/register/registration/', {
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (response.ok && data.message) {
          setRegistrationSuccess(true);
          setSuccessMessage(data.message);
        } else {
<<<<<<< HEAD
          setError(data.error || Object.values(data)[0] || 'Registration failed');
=======
          setError(data.hod_fields?.[0] || data.error || 'Registration failed');
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        }
      } else {
        // Regular registration through AuthContext
        await register(userData);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      if (!error) {
        setError(err.message || "Registration failed. Please try again.");
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-6 text-center text-gray-800"
      >
        Create an Account
      </motion.h2>
      {(error || authError) && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-center">{error || authError}</p>
        </motion.div>
      )}
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            required
          />
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              required
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              required
            />
          </div>
        </motion.div>

        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </motion.div>

        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </motion.div>
        
        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={handleChange}
            className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </motion.div>
        
        <motion.div className="flex items-center mb-2" variants={itemVariants}>
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={toggleShowPassword}
            className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="show-password" className="text-sm text-gray-600">
            Show password
          </label>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="hod">HOD (Head of Department)</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* HOD Specific Fields */}
        {form.role === 'hod' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">HOD Registration Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="employee_id"
                  placeholder="Employee ID"
                  value={form.employee_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={departmentsLoading}
              >
                <option value={0}>
                  {departmentsLoading ? 'Loading departments...' :
                   departmentsError ? 'Error loading departments' :
                   'Select Department'}
                </option>
                {departments.map((dept) => (
                  <option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departmentsError && (
                <p className="text-red-500 text-sm mt-1">{departmentsError}</p>
              )}

              <input
                type="number"
                name="experience_years"
                placeholder="Years of Experience"
                value={form.experience_years}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <input
              type="text"
              name="specialization"
              placeholder="Specialization/Field of Study"
              value={form.specialization}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {registrationSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          >
            <p className="text-center">{successMessage}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Registering...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>Register</span>
            </>
          )}
        </motion.button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:text-blue-700 transition">
            Login
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;
