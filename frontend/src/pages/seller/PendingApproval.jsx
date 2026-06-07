import React, { useEffect, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineSupport,
  HiOutlineLogout,
  HiOutlineRefresh,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { pendingApprovalStyles as s } from "../../assets/dummyStyles";

const PendingApproval = () => {
  const { logout, user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 10 seconds while on this page
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 1000); // Slight delay for UX
  };

  return (
    <div className={s.container}>
      <div className={s.iconCircle}>
        <HiOutlineClock size={48} />
      </div>

      <h1 className={s.heading}>Approval Pending</h1>
      <p className={s.description}>
        Hello {user?.name}, your seller account is currently under review by our
        administration team. Approval usually takes less than 24 hours. You'll
        gain full dashboard access once verified.
      </p>

      <div className={s.buttonGroup}>
        <a href="/properties" className={s.browseButton}>
          Browse Properties
        </a>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className={`${s.refreshButtonBase} ${refreshing ? s.refreshButtonDisabled : s.refreshButtonEnabled}`}
        >
          <HiOutlineRefresh
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Checking..." : "Check Status Now"}
        </button>
      </div>

      <div className={s.supportContainer}>
        <HiOutlineSupport size={18} />
        Need help?{" "}
        <Link to="/contact" className={s.supportLink}>
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;
