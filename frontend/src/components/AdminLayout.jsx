import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import DashboardNavbar from "./DashboardNavbar";
import { adminLayoutStyles as s } from "../assets/dummyStyles";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={s.layout}>
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={s.mainWrapper}>
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={s.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
