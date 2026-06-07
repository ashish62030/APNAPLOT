import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { FaChevronUp } from "react-icons/fa";

import LandingPage from "./pages/shared/LandingPage";
import Properties from "./pages/shared/Properties";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PropertyDetails from "./pages/shared/PropertyDetails";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AddProperty from "./pages/seller/AddProperty";
import EditProperty from "./pages/seller/EditProperty";
import MyProperties from "./pages/seller/MyProperties";
import Wishlist from "./pages/buyer/Wishlist";
import MyInquiries from "./pages/buyer/MyInquiries";
import Profile from "./pages/shared/Profile";
import ChatMessages from "./pages/shared/ChatMessages";
import SellerLayout from "./components/SellerLayout";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContacts from "./pages/admin/AdminContacts";
import SellerRequests from "./pages/admin/SellerRequests";
import Contact from "./pages/shared/Contact";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/common/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Scroll to top whenever route changes
const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

// Floating scroll-to-top button
const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${visible
          ? "scale-100 opacity-100 bg-emerald-500 text-white hover:bg-green-400"
          : "pointer-events-none scale-0 opacity-0"
        }`}
    >
      <FaChevronUp size={22} />
    </button>
  );
};

// Smart Layout Wrapper to dynamically apply SellerLayout for Sellers
const SellerLayoutWrapper = () => {
  const { user } = useAuth();
  return user?.role === "seller" ? <SellerLayout /> : <Outlet />;
};

function App() {
  useEffect(() => {
    // Prevent horizontal overflow on the whole app
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <ScrollToTopOnRouteChange />
      <ScrollTopButton />

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["buyer", "seller", "admin"]} />
          }
        >
          <Route element={<SellerLayoutWrapper />}>
            <Route path="/inquiries" element={<MyInquiries />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/chat-messages" element={<ChatMessages />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
            <Route element={<SellerLayout />}>
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/edit-property/:id" element={<EditProperty />} />
              <Route path="/my-properties" element={<MyProperties />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route
                path="/admin/seller-requests"
                element={<SellerRequests />}
              />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;