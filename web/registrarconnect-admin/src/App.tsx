import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import AdminLayout from "./layouts/AdminLayout";
import DashboardScreen from "./screens/DashboardScreen";
import RequestsScreen from "./screens/RequestsScreen";
import RequestHistoryScreen from "./screens/RequestHistoryScreen";
import AppointmentsScreen from "./screens/AppointmentsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AdminLogin from "./screens/AdminLogin";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public: Login Page */}
        <Route
          path="/login"
          element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Protected Admin Routes */}
        {isAuthenticated ? (
          <Route path="/*" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="requests" element={<RequestsScreen />} />
            <Route path="requests/history" element={<RequestHistoryScreen />} />
            <Route path="appointments" element={<AppointmentsScreen />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>
        ) : (
          <Route path="/*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}
