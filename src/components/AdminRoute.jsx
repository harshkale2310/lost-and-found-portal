import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * AdminRoute component:
 * - Protects routes that require admin login.
 * - Redirects non-admin users to /admin-login.
 * - If admin is already logged in and tries to access /admin-login, redirect to /admin-dashboard.
 */
export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("admin") === "true";
  const location = useLocation();

  // If admin is logged in and trying to access /admin-login, redirect to dashboard
  if (isAdmin && location.pathname === "/admin-login") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // If route requires admin and user is not admin, redirect to login
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // Otherwise, render the admin page
  return children;
}
