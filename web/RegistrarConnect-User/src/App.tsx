import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import DashboardTab from "./components/DashboardTab";
import TransactionsTab from "./components/TransactionsTab"; // Renamed from RequestsTab
import AppointmentsTab from "./components/AppointmentsTab";
import Chatbot from "./components/Chatbot"; // New component
import Settings from "./components/Settings"; // New component
import Profile from "./components/Profile"; // New component
import NotificationsTab from "./components/NotificationsTab";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<DashboardTab />} />
          <Route path="transactions" element={<TransactionsTab />} />
          <Route path="appointments" element={<AppointmentsTab />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<NotificationsTab />} />
        </Route>
      </Routes>
    </Router>
  );
};


export default App;