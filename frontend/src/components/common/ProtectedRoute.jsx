import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  const isGuestAllowed = allowedRoles?.includes(undefined);

  if (!user && !isGuestAllowed) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirection for unauthorized access
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "seller") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Redirect logged-in users away from public-only pages like Login/Register
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "seller") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };
