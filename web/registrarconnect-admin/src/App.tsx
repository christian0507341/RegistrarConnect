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
// Student imports
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./screens/StudentDashboard";
import StudentRequestsScreen from "./screens/StudentRequestsScreen";
import StudentProfileScreen from "./screens/StudentProfileScreen";
import StudentNewRequestScreen from "./screens/StudentNewRequestScreen";
import StudentAppointmentsScreen from "./screens/StudentAppointmentsScreen";
import StudentChatScreen from "./screens/StudentChatScreen";
import StudentNotificationsScreen from "./screens/StudentNotificationsScreen";

// Unified Login
import UnifiedLogin from "./screens/UnifiedLogin";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const adminRole = localStorage.getItem("adminRole");
    
    console.log('Auth check on load:', { token: !!token, role, adminRole });
    
    if (token && role) {
      // Basic token validation - check if token exists and has content
      if (token.length > 10) {
        if (role === "student") {
          setIsStudentAuthenticated(true);
          console.log('Student authenticated');
        } else if (role === "admin" || role === "faculty") {
          setIsAuthenticated(true);
          console.log('Admin/Faculty authenticated');
        }
      } else {
        // Invalid token, clear storage
        console.log('Invalid token, clearing storage');
        localStorage.clear();
      }
    }
    
    // Set loading to false after auth check
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  };

  const handleStudentLogout = () => {
    setIsStudentAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div>Loading RegistrarConnect...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public: Unified Login Page */}
        <Route
          path="/login"
          element={
            <UnifiedLogin 
              setIsAuthenticated={setIsAuthenticated} 
              setIsStudentAuthenticated={setIsStudentAuthenticated} 
            />
          }
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
            <Route path="requests/new" element={<StudentNewRequestScreen />} />
            <Route path="appointments" element={<StudentAppointmentsScreen />} />
            <Route path="chat" element={<StudentChatScreen />} />
            <Route path="notifications" element={<StudentNotificationsScreen />} />
            <Route path="profile" element={<StudentProfileScreen />} />
          </Route>
        ) : null}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/student/login" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
