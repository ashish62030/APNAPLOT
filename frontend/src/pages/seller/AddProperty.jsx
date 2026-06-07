import React, { useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiUpload,
  HiCheckCircle,
  HiHome,
  HiCurrencyDollar,
  HiLocationMarker,
} from "react-icons/hi";
import { addPropertyStyles as s } from "../../assets/dummyStyles";

const AddProperty = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pincode: "",
    propertyType: "flat",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished",
    status: "sale",
    amenities: [],
    securityDeposit: "",
    maintenance: "",
  });

  const commonAmenities = [
    "Parking",
    "Pool",
    "Gym",
    "Security",
    "Wifi",
    "Power Backup",
    "Club House",
    "Garden",
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      setError("You can only upload up to 10 images.");
      return;
    }
    setImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "amenities") {
        formData[key].forEach((a) => data.append("amenities", a));
      } else {
        data.append(key, formData[key]);
      }
    });
    images.forEach((img) => data.append("images", img));

    try {
      await axios.post(`${API_URL}/api/property`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property.");
      setLoading(false);
    }
  };

  return (
    <div className={s.outerContainer}>
      <div className={s.innerContainer}>
        <div className={s.header}>
          <h1 className={s.heading}>List Your Property</h1>
          <p className={s.subheading}>
            Fill in the details below to reach thousands of potential buyers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          {error && <div className={s.error}>{error}</div>}

          {/* Section 1: Basic Information */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Content & Description</h3>
            </div>
            <div className={s.contentGroupLarge}>
              <div>
                <label className={s.label}>Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Luxury 3BHK Apartment in Downtown"
                  className={s.input}
                  required
                />
              </div>
              <div>
                <label className={s.label}>Detailed Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property highlights..."
                  className={`${s.input} ${s.textarea}`}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className={s.twoColumnGrid}>
            {/* Section 2: Property Details */}
            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>
                <h3 className={s.sectionTitle}>Property Details</h3>
              </div>
              <div className={s.contentGroupMedium}>
                <div>
                  <label className={s.labelSmallMargin}>Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="flat">Flat/Apartment</option>
                    <option value="villa">Independent House/Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className={s.gridThreeCol}>
                  <div>
                    <label className={s.labelSmallMargin}>BHK</label>
                    <input
                      type="number"
                      name="bhk"
                      value={formData.bhk}
                      onChange={handleInputChange}
                      placeholder="e.g. 3"
                      className={s.input}
                    />
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 2"
                      className={s.input}
                    />
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>Area (Sq.Ft)</label>
                    <input
                      type="number"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleInputChange}
                      placeholder="e.g. 1500"
                      className={s.input}
                      required
                    />
                  </div>
                </div>
                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>Furnishing</label>
                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="furnished">Fully Furnished</option>
                    </select>
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>Listing Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Location */}
            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>
                <h3 className={s.sectionTitle}>Pricing & Location</h3>
              </div>
              <div className={s.contentGroupSmall}>
                <div>
                  <label className={s.labelSmallMargin}>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 5000000"
                    className={s.input}
                    required
                  />
                </div>
                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      className={s.input}
                      required
                    />
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      className={s.input}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={s.labelSmallMargin}>Specific Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. Worli"
                    className={s.input}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Amenities</h3>
            </div>
            <div className={s.amenitiesGrid}>
              {commonAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className={`${s.amenityLabelBase} ${formData.amenities.includes(amenity) ? s.amenityLabelActive : s.amenityLabelInactive}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className={s.amenityCheckbox}
                  />
                  <span
                    className={`${s.amenityTextBase} ${formData.amenities.includes(amenity) ? s.amenityTextActive : s.amenityTextInactive}`}
                  >
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 5: Property Images */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Property Images</h3>
            </div>

            <div className={s.uploadArea}>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
              <div className={s.uploadIconWrapper}>
                <HiUpload size={40} color="#64748b" />
              </div>
              <h4 className={s.uploadTitle}>
                Click to upload or drag and drop
              </h4>
              <p className={s.uploadSubtext}>
                Upload up to 10 high-quality images (PNG, JPG)
              </p>
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className={s.previewsGrid}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className={s.previewItem}>
                    <img
                      src={src}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className={s.removeButton}
                      style={{ transform: "rotate(45deg)" }}
                    >
                      <HiUpload size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <div className={s.addMoreBox}>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <HiUpload size={20} color="#64748b" />
                    <span className={s.addMoreText}>Add More</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={s.footerButtons}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={s.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={s.submitButton} disabled={loading}>
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
