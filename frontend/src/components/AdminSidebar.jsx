import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineLibrary,
  HiOutlineChatAlt2,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineMail,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { adminSidebarStyles as s } from "../assets/dummyStyles";

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navItems = [
    { name: "Overview", icon: HiOutlineViewGrid, path: "/admin-dashboard" },
    { name: "Users", icon: HiOutlineUsers, path: "/admin/users" },
    {
      name: "Seller Requests",
      icon: HiOutlineUserCircle,
      path: "/admin/seller-requests",
    },
    { name: "Properties", icon: HiOutlineLibrary, path: "/admin/properties" },
    { name: "Inquiries", icon: HiOutlineChatAlt2, path: "/admin/inquiries" },
    { name: "Contact Inbox", icon: HiOutlineMail, path: "/admin/contacts" },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div className={s.backdrop(isOpen)} onClick={onClose} />

      <aside className={s.sidebar(isOpen)}>
        {/* Logo Section */}
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        {/* Navigation items */}
        <nav className={s.navContainer}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => s.navLink(isActive)}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className={s.logoutContainer}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className={s.logoutButton}
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
