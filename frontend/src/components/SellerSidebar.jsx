import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineSupport,
  HiOutlineLogout,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { sellerSidebarStyles as s } from "../assets/dummyStyles";

const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    {
      name: "My Listings",
      icon: HiOutlineClipboardList,
      path: "/my-properties",
    },
    { name: "Leads", icon: HiOutlineChartBar, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineViewGrid, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`${s.backdrop} ${isOpen ? s.backdropVisible : s.backdropHidden}`}
        onClick={onClose}
      />

      <aside
        className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}
      >
        {/* Logo Section */}
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        {/* Navigation items */}
        <nav className={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
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

export default SellerSidebar;
