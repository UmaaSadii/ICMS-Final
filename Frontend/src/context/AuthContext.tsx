import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../api/authService";

// Define types
interface User {
  id: number;
  role: "student" | "staff" | "admin" | "principal" | "director" | "instructor";
  username: string;
  email: string;
  [key: string]: any;
}

interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string, enforceRole?: string) => Promise<void>; // ✅ Added enforceRole
  register: (userData: any) => Promise<void>;
  logout: () => void;
  forceLogout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // ✅ Check for existing session on initial load
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData: AuthData = JSON.parse(storedAuth);
        setCurrentUser(authData.user);

        if (authData.access_token) {
          axios.defaults.headers.common['Authorization'] = `Token ${authData.access_token}`;
        }
      } catch (err) {
        console.error('Error parsing stored auth data:', err);
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  // ✅ Updated login with enforceRole
  const login = async (username: string, password: string, enforceRole?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ username, password });
      
      console.log('Login response in AuthContext:', response);
      
      if (!response) {
        throw new Error('No response received from login');
      }

      // ✅ Role restriction check
      if (enforceRole && response.user.role !== enforceRole) {
        throw new Error(`Access denied. Only ${enforceRole}s can log in here.`);
      }
      
      const authData: AuthData = {
        user: response.user,
        access_token: response.access_token,
        refresh_token: response.refresh_token
      };
      
      console.log('Auth data being stored from login:', authData);
      
      setCurrentUser(authData.user);
      localStorage.setItem('auth', JSON.stringify(authData));
      axios.defaults.headers.common['Authorization'] = `Token ${authData.access_token}`;
      
      // ✅ Role-based redirect
      if (authData.user.role === "admin" || authData.user.role === "principal" || authData.user.role === "director") {
        navigate("/admin");
      } else if (authData.user.role === "instructor") {
        navigate("/teacher");
      } else if (authData.user.role === "staff") {
        navigate("/staff");
      } else if (authData.user.role === "student") {
        navigate("/student");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Invalid credentials. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      
      console.log('Registration response:', response);
      
      if (!response.user) {
        throw new Error('No user data received from registration');
      }
      
      const authData: AuthData = {
        user: response.user,
        access_token: response.access_token,
        refresh_token: response.refresh_token
      };
      
      console.log('Auth data being stored:', authData);
      
      setCurrentUser(authData.user);
      localStorage.setItem('auth', JSON.stringify(authData));
      axios.defaults.headers.common['Authorization'] = `Token ${authData.access_token}`;

      // ✅ Redirect by role
      if (authData.user.role === "admin" || authData.user.role === "principal" || authData.user.role === "director") {
        navigate("/admin");
      } else if (authData.user.role === "staff") {
        navigate("/staff");
      } else if (authData.user.role === "student") {
        navigate("/student");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error('Registration error details:', err.response?.data || err.message || err);
      const errorMessage = err.response?.data
        ? typeof err.response.data === 'string'
          ? err.response.data
          : Object.values(err.response.data).flat().join(', ')
        : "Registration failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    authService.logout();
    navigate("/login");
  };

  const forceLogout = () => {
    console.log('Force logout called - clearing all auth data');
    setCurrentUser(null);
    localStorage.removeItem('auth');
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      forceLogout,
      loading,
      error,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};