import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * Checks localStorage to verify login status.
 * Redirects to login page if not logged in.
 */
const ProtectedRoute = ({ children, role = "user" }) => {
  const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  const userIds = JSON.parse(localStorage.getItem("deviceProfileIds") || "[]");
  const hasUser = userIds.length > 0;

  // Admin protection
  if (role === "admin" && !adminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  // Regular user protection
  if (role === "user" && !hasUser) {
    return <Navigate to="/" replace />;
  }

  // If authorized → render the page
  return children;
};

export default ProtectedRoute;
