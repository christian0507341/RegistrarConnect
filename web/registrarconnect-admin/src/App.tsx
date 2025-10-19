import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import AdminLayout from "./layouts/AdminLayout";
import DashboardScreen from "./screens/DashboardScreen";
import RequestsScreen from "./screens/RequestsScreen";
import RequestHistoryScreen from "./screens/RequestHistoryScreen";
import AppointmentsScreen from "./screens/AppointmentsScreen";
import AppointmentSettingsScreen from "./screens/AppointmentSettingsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AdminLogin from "./screens/AdminLogin";

// Student imports
import StudentLayout from "./layouts/StudentLayout";
import StudentLogin from "./screens/StudentLogin";
import StudentDashboard from "./screens/StudentDashboard";
import StudentRequestsScreen from "./screens/StudentRequestsScreen";
import StudentProfileScreen from "./screens/StudentProfileScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (token && role === "admin") {
      setIsAuthenticated(true);
    } else if (token && role === "student") {
      setIsStudentAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  };

  const handleStudentLogout = () => {
    setIsStudentAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  };

  return (
    <Router>
      <Routes>
        {/* Public: Admin Login Page */}
        <Route
          path="/login"
          element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Public: Student Login Page */}
        <Route
          path="/student/login"
          element={<StudentLogin setIsAuthenticated={setIsStudentAuthenticated} />}
        />

        {/* Protected Admin Routes */}
        {isAuthenticated ? (
          <Route path="/*" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="requests" element={<RequestsScreen />} />
            <Route path="requests/history" element={<RequestHistoryScreen />} />
            <Route path="appointments" element={<AppointmentsScreen />} />
            <Route path="appointments/settings" element={<AppointmentSettingsScreen />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>
        ) : null}

        {/* Protected Student Routes */}
        {isStudentAuthenticated ? (
          <Route path="/student/*" element={<StudentLayout onLogout={handleStudentLogout} />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="requests" element={<StudentRequestsScreen />} />
            <Route path="requests/new" element={<div>New Request Form (Coming Soon)</div>} />
            <Route path="appointments" element={<div>Appointments (Coming Soon)</div>} />
            <Route path="profile" element={<StudentProfileScreen />} />
          </Route>
        ) : null}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
