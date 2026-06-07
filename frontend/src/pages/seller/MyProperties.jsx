import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiExternalLink,
  HiEye,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import { myPropertiesStyles as s } from "../../assets/dummyStyles";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/property/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const props = Array.isArray(res.data)
        ? res.data
        : res.data.properties || [];
      setProperties(props);
      setLoading(false);
    } catch (err) {
      setError("Failed to load your properties.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/property/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProperties(
        properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  const getAvailableStatus = (p) => {
    return "sale";
  };

  return (
    <div className={s.fadeIn}>
      <div className={s.fadeIn}>
        <div className={s.header}>
          <div>
            <h1 className={s.heading}>My Listings</h1>
            <p className={s.subheading}>
              Manage your listed properties and their status.
            </p>
          </div>
          <Link to="/add-property" className={s.addButton}>
            Add New Listing
          </Link>
        </div>

        <div className={s.content}>
          {!Array.isArray(properties) || properties.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiOutlineLibrary size={40} color="#94a3b8" />
              </div>
              <h2 className={s.emptyTitle}>No properties found</h2>
              <p className={s.emptyText}>
                Start your journey by adding your first property listing.
              </p>
              <Link to="/add-property" className={s.emptyButton}>
                Add Your First Listing
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  renderActions={() => (
                    <>
                      <div className={s.actionContainer}>
                        <div className={s.selectWrapper}>
                          <select
                            value={p.status === "sale" ? "available" : p.status}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "available") {
                                updateStatus(p._id, getAvailableStatus(p));
                              } else {
                                updateStatus(p._id, val);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`${s.select} ${p.status === "sold" ? s.selectSold : s.selectAvailable}`}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </select>
                          <div className={s.selectIcon}>
                            <HiOutlineCheckCircle size={14} />
                          </div>
                        </div>
                        <Link
                          to={`/edit-property/${p._id}`}
                          className={s.editButton}
                        >
                          <HiOutlinePencilAlt /> Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p._id);
                          }}
                          className={s.deleteButton}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
