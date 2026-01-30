import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import AddItem from "./pages/AddItem.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";


import "./components/Navbar.css";
import "./components/Footer.css";
import "./pages/Login.css";
import "./pages/AdminLogin.css"; 
import "./pages/AdminDashboard.css";
import "./pages/AddItem.css";
import "./pages/Home.css";
import "./pages/About.css";


export default function App() {
  return (
    <Routes>
      {/* ---------- PUBLIC PAGES (Navbar + Footer) ---------- */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/login" element={<Login />} />

      </Route>

      {/* ---------- ADMIN PAGES (Navbar only) ---------- */}
      <Route element={<AdminLayout />}>
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}