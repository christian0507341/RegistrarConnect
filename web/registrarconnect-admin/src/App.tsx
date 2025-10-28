import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import RequestsScreen from "./screens/RequestsScreen";
import RequestHistoryScreen from "./screens/RequestHistoryScreen";
import AppointmentsScreen from "./screens/AppointmentsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
// Student imports
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./screens/StudentDashboard";
import StudentRequestsScreen from "./screens/StudentRequestsScreen";
import StudentProfileScreen from "./screens/StudentProfileScreen";
import StudentNewRequestScreen from "./screens/StudentNewRequestScreen";
import StudentAppointmentsScreen from "./screens/StudentAppointmentsScreen";
import StudentChatScreen from "./screens/StudentChatScreen";
import StudentNotificationsScreen from "./screens/StudentNotificationsScreen";
import StudentSettingsScreen from "./screens/StudentSettingsScreen";

// Registrar imports
import RegistrarLayout from "./layouts/RegistrarLayout";
import RegistrarDashboard from "./screens/RegistrarDashboard";
import RegistrarRequestsScreen from "./screens/RegistrarRequestsScreen";
import RegistrarApprovalScreen from "./screens/RegistrarApprovalScreen";
import RegistrarAppointmentsScreen from "./screens/RegistrarAppointmentsScreen";
import RegistrarScheduleScreen from "./screens/RegistrarScheduleScreen";
import RegistrarNotificationsScreen from "./screens/RegistrarNotificationsScreen";
import RegistrarProfileScreen from "./screens/RegistrarProfileScreen";

// Finance imports
import FinanceLayout from "./layouts/FinanceLayout";
import FinanceDashboard from "./screens/FinanceDashboard";
import FinancePaymentsScreen from "./screens/FinancePaymentsScreen";
import FinanceVerificationScreen from "./screens/FinanceVerificationScreen";
import FinanceReportsScreen from "./screens/FinanceReportsScreen";
import FinanceNotificationsScreen from "./screens/FinanceNotificationsScreen";
import FinanceProfileScreen from "./screens/FinanceProfileScreen";

// Admin Dedicated imports
import AdminDedicatedLayout from "./layouts/AdminDedicatedLayout";
import AdminDedicatedDashboard from "./screens/AdminDedicatedDashboard";
import AdminUsersManagement from "./screens/AdminUsersManagement";
import AdminSystemSettings from "./screens/AdminSystemSettings";
import AdminActivityLogs from "./screens/AdminActivityLogs";
import AdminReportsScreen from "./screens/AdminReportsScreen";
import AdminDatabaseScreen from "./screens/AdminDatabaseScreen";

// Unified Login
import UnifiedLogin from "./screens/UnifiedLogin";

// Protected Route Components
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedStudentRoute from "./components/ProtectedStudentRoute";
import ProtectedRegistrarRoute from "./components/ProtectedRegistrarRoute";
import ProtectedFinanceRoute from "./components/ProtectedFinanceRoute";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    console.log('Auth check on load:', { token: !!token, role });
    
    // Validate token format
    if (token && token.length <= 10) {
      console.log('Invalid token format, clearing storage');
      localStorage.clear();
    }
    
    // Set loading to false after auth check
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
  };

  const handleStudentLogout = () => {
    localStorage.clear();
  };

  const handleRegistrarLogout = () => {
    localStorage.clear();
  };

  const handleFinanceLogout = () => {
    localStorage.clear();
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
          element={<UnifiedLogin />}
        />

        {/* Protected Admin Dedicated Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedAdminRoute>
              <AdminDedicatedLayout onLogout={handleLogout} />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDedicatedDashboard />} />
          <Route path="users" element={<AdminUsersManagement />} />
          <Route path="requests" element={<RequestsScreen />} />
          <Route path="requests/history" element={<RequestHistoryScreen />} />
          <Route path="appointments" element={<AppointmentsScreen />} />
          <Route path="reports" element={<AdminReportsScreen />} />
          <Route path="settings" element={<AdminSystemSettings />} />
          <Route path="logs" element={<AdminActivityLogs />} />
          <Route path="database" element={<AdminDatabaseScreen />} />
          <Route path="notifications" element={<NotificationsScreen />} />
        </Route>

        {/* Protected Student Routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedStudentRoute>
              <StudentLayout onLogout={handleStudentLogout} />
            </ProtectedStudentRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="requests" element={<StudentRequestsScreen />} />
          <Route path="requests/new" element={<StudentNewRequestScreen />} />
          <Route path="appointments" element={<StudentAppointmentsScreen />} />
          <Route path="chat" element={<StudentChatScreen />} />
          <Route path="notifications" element={<StudentNotificationsScreen />} />
          <Route path="profile" element={<StudentProfileScreen />} />
          <Route path="settings" element={<StudentSettingsScreen />} />
        </Route>

        {/* Protected Registrar Routes */}
        <Route 
          path="/registrar/*" 
          element={
            <ProtectedRegistrarRoute>
              <RegistrarLayout onLogout={handleRegistrarLogout} />
            </ProtectedRegistrarRoute>
          }
        >
          <Route index element={<Navigate to="/registrar/dashboard" replace />} />
          <Route path="dashboard" element={<RegistrarDashboard />} />
          <Route path="requests" element={<RegistrarRequestsScreen />} />
          <Route path="approve" element={<RegistrarApprovalScreen />} />
          <Route path="appointments" element={<RegistrarAppointmentsScreen />} />
          <Route path="schedule" element={<RegistrarScheduleScreen />} />
          <Route path="notifications" element={<RegistrarNotificationsScreen />} />
          <Route path="profile" element={<RegistrarProfileScreen />} />
        </Route>

        {/* Protected Finance Routes */}
        <Route 
          path="/finance/*" 
          element={
            <ProtectedFinanceRoute>
              <FinanceLayout onLogout={handleFinanceLogout} />
            </ProtectedFinanceRoute>
          }
        >
          <Route index element={<Navigate to="/finance/dashboard" replace />} />
          <Route path="dashboard" element={<FinanceDashboard />} />
          <Route path="payments" element={<FinancePaymentsScreen />} />
          <Route path="verification" element={<FinanceVerificationScreen />} />
          <Route path="reports" element={<FinanceReportsScreen />} />
          <Route path="notifications" element={<FinanceNotificationsScreen />} />
          <Route path="profile" element={<FinanceProfileScreen />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/student/login" element={<Navigate to="/login" replace />} />
        <Route path="/registrar/login" element={<Navigate to="/login" replace />} />
        <Route path="/finance/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
