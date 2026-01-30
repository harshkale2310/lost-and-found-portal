
// src/components/Layout.jsx
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    document.body.classList.toggle("dark", savedTheme === "dark");
    document.body.style.transition = "background-color 0.3s, color 0.3s";
  }, []);

  // Footer hidden only on these routes
  const hideFooterRoutes = ["/login", "/add"];
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="layout-wrapper">
      <Navbar />

      {/* 🔥 MAIN MUST FLEX */}
      <main className="page-content">
        <Outlet />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}
