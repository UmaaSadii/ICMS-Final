// src/pages/PrincipalDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrincipalFeedbackModal from "../components/PrincipalFeedbackModal";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  LogOut,
  Users,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Menu,
  CheckCircle,
  XCircle,
} from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 shadow-md ${className}`}
  >
    {children}
  </button>
);

const COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#0088FE"];

const PrincipalDashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPrincipalFeedback, setOpenPrincipalFeedback] = useState(false);
  const navigate = useNavigate();

  // 📊 Sample Data
  const stats = [
    { title: "Students", value: 512, color: "bg-blue-600", icon: <Users size={26} /> },
    { title: "Teachers", value: 35, color: "bg-green-600", icon: <BookOpen size={26} /> },
    { title: "Parents", value: 480, color: "bg-orange-500", icon: <ClipboardList size={26} /> },
    { title: "Events", value: events.length, color: "bg-red-600", icon: <CalendarDays size={26} /> },
  ];

  const lineData = [
    { name: "Jan", students: 400 },
    { name: "Feb", students: 300 },
    { name: "Mar", students: 500 },
    { name: "Apr", students: 200 },
    { name: "May", students: 600 },
  ];

  const pieData = [
    { name: "Sports", value: 4 },
    { name: "Cultural", value: 3 },
    { name: "Academic", value: 5 },
    { name: "Community", value: 2 },
  ];

  // 🚀 Fetch Events
  const fetchEvents = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      const token = authData?.access_token;
      if (!token) return;

      const res = await axios.get("http://127.0.0.1:8000/api/events/", {
        headers: { Authorization: `Token ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Approve Event
  const handleApprove = async (id: number) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    try {
      await axios.post(`http://127.0.0.1:8000/api/events/${id}/approve/`, {}, {
        headers: { Authorization: `Token ${auth?.access_token}` },
      });
      fetchEvents();
    } catch (err) {
      alert("Error approving event.");
    }
  };

  // ❌ Reject Event
  const handleReject = async (id: number) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    try {
      await axios.post(`http://127.0.0.1:8000/api/events/${id}/reject/`, {}, {
        headers: { Authorization: `Token ${auth?.access_token}` },
      });
      fetchEvents();
    } catch (err) {
      alert("Error rejecting event.");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("auth");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🌐 Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-indigo-700 to-indigo-900 text-white flex flex-col justify-between shadow-2xl"
      >
        <div>
          <h2 className="text-2xl font-bold text-center py-5">Principal</h2>
          <nav className="space-y-1 px-3">
            {[
              { name: "Dashboard", icon: <Users /> },
              { name: "Teachers", icon: <BookOpen /> },
              { name: "Reports", icon: <ClipboardList /> },
              { name: "Events", icon: <CalendarDays /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ${
                  active === item.name
                    ? "bg-indigo-600 shadow-md"
                    : "hover:bg-indigo-600"
                }`}
              >
                {item.icon}
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 🚪 Logout */}
        <div className="p-3 border-t border-indigo-500">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </motion.div>

      {/* 📋 Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-white shadow-md p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="bg-indigo-500 hover:bg-indigo-600 flex items-center gap-2"
            >
              <Menu size={18} /> {isSidebarOpen ? "Collapse" : "Expand"}
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">{active} Overview</h1>
          </div>
          <p className="text-sm text-gray-500">
            Logged in as <span className="font-semibold">Principal</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {active === "Events" ? (
            // ✅ EVENTS TAB
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center gap-2">
                <CalendarDays className="text-indigo-600" /> Pending Event Approvals
              </h2>

              {loading ? (
                <p>Loading events...</p>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          Status:{" "}
                          <span
                            className={`font-medium ${
                              event.status === "approved"
                                ? "text-green-600"
                                : event.status === "rejected"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {event.status}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {event.description || "No description available."}
                        </p>
                      </div>
                      {event.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(event.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center gap-1"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center">No events found for review.</p>
              )}
            </motion.div>
          ) : active === "Reports" ? (
            // ✅ FEEDBACK REPORT TAB
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">
                Feedback Reports
              </h2>
              <Button
                onClick={() => setOpenPrincipalFeedback(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Feedback Report
              </Button>
              <PrincipalFeedbackModal
                isOpen={openPrincipalFeedback}
                onClose={() => setOpenPrincipalFeedback(false)}
              />
            </motion.div>
          ) : (
            // ✅ DASHBOARD TAB
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-2xl p-5 text-white shadow-lg ${stat.color} flex justify-between items-center`}
                  >
                    <div>
                      <h2 className="text-4xl font-bold">{stat.value}</h2>
                      <p className="text-lg">{stat.title}</p>
                    </div>
                    {stat.icon}
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-4">Student Activity Trends</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-4">Event Categories</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
