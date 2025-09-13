import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 
import "../styles/layout.css"; 

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Sidebar /> 
      <main className="main">
        <div className="content">
         
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;