// src/components/AdminLayout.jsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AdminLayout() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    document.body.classList.toggle("dark", savedTheme === "dark");
    document.body.style.transition = "background-color 0.3s, color 0.3s";
  }, []);

  return (
    <div className="admin-layout-wrapper">
      <Navbar /> {/* Only Navbar */}
      <main className="admin-page-content">
        <Outlet /> {/* This renders AdminLogin or AdminDashboard */}
      </main>
    </div>
  );
}
