import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import {
  HiLocationMarker,
  HiOutlineHome,
  HiArrowsExpand,
  HiChatAlt,
  HiHeart,
  HiOutlineLogout,
  HiShare,
  HiFlag,
  HiBadgeCheck,
  HiChevronRight,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
  HiCalendar,
  HiX,
  HiChevronLeft,
  HiCollection,
  HiOutlineHeart,
  HiTrash,
} from "react-icons/hi";
import { HiStar, HiOutlineStar } from "react-icons/hi";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import {
  propertyDetailsStyles as s,
  reviewSectionStyles as rs,
} from "../../assets/dummyStyles";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0,
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    hoverRating: 0,
    comment: "",
  });
  const [reviewStatus, setReviewStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });

  // Loads reviews plus the calculated average for this property.
  const fetchReviews = useCallback(async () => {
    const res = await axios.get(`${API_URL}/api/review/property/${id}`);
    setReviews(res.data.reviews || []);
    setReviewStats({
      averageRating: res.data.averageRating || 0,
      reviewCount: res.data.reviewCount || 0,
    });
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/property/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProperty(res.data.property);
        setSimilarProperties(res.data.similarProperties || []);

        if (user && user.role === "buyer") {
          const wishRes = await axios.get(`${API_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const found = wishRes.data.some((item) => item.property?._id === id);
          setIsInWishlist(found);
        }
        await fetchReviews();
        setLoading(false);
      } catch {
        setError("Failed to load property details.");
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user, token, fetchReviews]);

  const handleWishlistToggle = async () => {
    if (!user) return navigate("/login");
    try {
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setIsInWishlist(true);
      }
    } catch {
      alert("Failed to update wishlist.");
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    if (user.role !== "buyer") return alert("Only buyers can send inquiries");

    setInquiryStatus({ ...inquiryStatus, loading: true });
    try {
      await axios.post(
        `${API_URL}/api/inquiry`,
        {
          propertyId: id,
          message: inquiry.message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInquiryStatus({ loading: false, success: true, error: null });
      setInquiry({ ...inquiry, message: "" });
    } catch {
      setInquiryStatus({
        loading: false,
        success: false,
        error: "Failed to send inquiry.",
      });
    }
  };

  const handleChatStart = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer")
      return alert("Only buyers can chat with sellers");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          propertyId: id,
          sellerId: property.seller._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const chat = res.data;

      await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: chat._id,
          text: `(Context: Interested in property "${property.title}")`,
          image: property.images[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      navigate("/chat-messages", { state: { chat } });
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Failed to start chat.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (user.role !== "buyer") {
      setReviewStatus({
        loading: false,
        message: "Only buyers can submit ratings.",
        type: "error",
      });
      return;
    }
    if (!reviewForm.rating) {
      setReviewStatus({
        loading: false,
        message: "Please select a star rating.",
        type: "error",
      });
      return;
    }

    try {
      setReviewStatus({ loading: true, message: "", type: "" });
      // Backend creates a new rating or updates this buyer's old rating.
      const res = await axios.post(
        `${API_URL}/api/review`,
        {
          propertyId: id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setReviewStats({
        averageRating: res.data.averageRating || 0,
        reviewCount: res.data.reviewCount || 0,
      });
      setReviewForm({ rating: 0, hoverRating: 0, comment: "" });
      setReviewStatus({
        loading: false,
        message: "Thanks, your rating has been saved.",
        type: "success",
      });
      await fetchReviews();
    } catch (err) {
      setReviewStatus({
        loading: false,
        message: err.response?.data?.message || "Failed to save rating.",
        type: "error",
      });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Delete this rating?")) return;

    try {
      // Backend allows delete only for the review owner or an admin.
      const res = await axios.delete(`${API_URL}/api/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviewStats({
        averageRating: res.data.averageRating || 0,
        reviewCount: res.data.reviewCount || 0,
      });
      setReviewStatus({
        loading: false,
        message: "Rating deleted successfully.",
        type: "success",
      });
      await fetchReviews();
    } catch (err) {
      setReviewStatus({
        loading: false,
        message: err.response?.data?.message || "Failed to delete rating.",
        type: "error",
      });
    }
  };

  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  if (error || !property)
    return (
      <div
        className="container"
        style={{ padding: "4rem", textAlign: "center" }}
      >
        {error || "Property not found"}
      </div>
    );

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);
  const averageRating = Number(reviewStats.averageRating || 0);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length,
    );

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        {/* Breadcrumbs */}
        <nav className={s.breadcrumbs}>
          <Link to="/" className={s.breadcrumbLink}>
            Home
          </Link>
          <HiChevronRight />
          <Link to="/properties" className={s.breadcrumbLink}>
            Listings
          </Link>
          <HiChevronRight />
          <span className={s.breadcrumbCurrent}>{property.title}</span>
        </nav>

        <div className={s.galleryContainer}>
          {/* Desktop Grid */}
          <div
            className={s.galleryGrid}
            style={{
              gridTemplateColumns:
                property.images.length > 1 ? "repeat(4, 1fr)" : "1fr",
              gridTemplateRows:
                property.images.length > 1 ? "repeat(2, 180px)" : "400px",
            }}
          >
            {/* Main Large Image */}
            <div
              className={s.galleryMainItem(property.images.length > 1)}
              onClick={() => openLightbox(0)}
            >
              <img
                src={property.images[0]}
                alt="Main Property"
                className={s.galleryImage}
              />
            </div>

            {/* Side Images */}
            {property.images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className={s.gallerySideItem}
                onClick={() => openLightbox(idx + 1)}
              >
                <img
                  src={img}
                  alt={`Property Interior ${idx + 1}`}
                  className={s.galleryImage}
                />
                {idx === 3 && property.images.length > 5 && (
                  <div className={s.galleryMoreOverlay}>
                    +{property.images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Only Slider */}
          <div className={s.mobileSliderContainer}>
            <div className={s.mobileSliderTrack}>
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  className={s.mobileSlide}
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    className={s.mobileSlideImage}
                  />
                  <div className={s.mobileSlideCounter}>
                    {idx + 1} / {property.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div className={s.lightboxOverlay} onClick={closeLightbox}>
            <button onClick={closeLightbox} className={s.lightboxCloseBtn}>
              <HiX size={24} className={s.lightboxCloseIcon} />
            </button>

            <div
              className={s.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={property.images[lightboxIndex]}
                alt={`Property Full ${lightboxIndex + 1}`}
                className={s.lightboxImage}
              />

              {property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className={s.lightboxPrevBtn}>
                    <HiChevronLeft size={30} />
                  </button>
                  <button onClick={nextImage} className={s.lightboxNextBtn}>
                    <HiChevronRight size={30} />
                  </button>
                </>
              )}

              <div className={s.lightboxCounter}>
                {lightboxIndex + 1} / {property.images.length}
              </div>
            </div>
          </div>
        )}

        {/* Main Content & Sidebar Grid */}
        <div className={s.detailsLayout}>
          {/* Left Column: Property Info */}
          <div className={s.infoColumn}>
            <div className={s.infoHeader}>
              <div className={s.titleWrapper}>
                <div className={s.badgeWrapper}>
                  <span className={s.premiumBadge}>Premium Listing</span>
                </div>
                <h1 className={s.propertyTitle}>{property.title}</h1>
                <p className={s.propertyLocation}>
                  <HiLocationMarker className={s.locationIcon} />
                  <span className={s.locationText}>
                    {property.area}, {property.city}, India
                  </span>
                </p>
              </div>
              <div className={s.actionButtons}>
                {(!user || user.role === "buyer") && (
                  <button
                    onClick={handleWishlistToggle}
                    className={s.wishlistButton(isInWishlist)}
                  >
                    {isInWishlist ? (
                      <HiHeart size={26} fill="#ef4444" />
                    ) : (
                      <HiOutlineHeart size={26} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Boxes */}
            <div className={s.statsGrid}>
              {[
                {
                  label: "Bedrooms",
                  value: property.bhk || 0,
                  icon: HiOutlineHome,
                },
                {
                  label: "Bathrooms",
                  value:
                    property.bathrooms ||
                    Math.max(1, (parseInt(property.bhk) || 1) - 1),
                  icon: HiOutlineUserGroup,
                },
                {
                  label: "Furnishing",
                  value: property.furnishing || "N/A",
                  icon: HiCollection,
                },
                {
                  label: "Living Area",
                  value: `${property.areaSize} sqft`,
                  icon: HiOutlineViewGrid,
                },
                {
                  label: "Type",
                  value: property.propertyType,
                  icon: HiCalendar,
                },
              ].map((stat, i) => (
                <div key={i} className={s.statCard}>
                  {stat.icon && <stat.icon size={18} className={s.statIcon} />}
                  <div className={s.statValue}>{stat.value}</div>
                  <div className={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Description Section */}
            <div className={s.descriptionSection}>
              <h3 className={s.sectionTitle}>Description</h3>
              <p className={s.descriptionText}>
                {property.description ||
                  "No description available for this property."}
              </p>
            </div>

            {/* Amenities List */}
            <div className={s.amenitiesSection}>
              <h3 className={s.sectionTitle}>Amenities</h3>
              <div className={s.amenitiesGrid}>
                {(property.amenities?.length
                  ? property.amenities
                  : ["Parking", "Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={i} className={s.amenityItem}>
                    <HiBadgeCheck size={18} className={s.amenityIcon} />
                    <span className={s.amenityText}>{amn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shows average rating, buyer rating form, and saved reviews. */}
            <section className={rs.container}>
              <div className={rs.headerWrapper}>
                <h3 className={rs.headerTitle}>User Ratings</h3>
                <div className={rs.ratingBadge}>
                  <div className={rs.ratingStars}>
                    <HiStar className={rs.starIconGold} />
                    <span>{averageRating.toFixed(1)}</span>
                  </div>
                  <span className={rs.reviewCount}>
                    {reviewStats.reviewCount}{" "}
                    {reviewStats.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              {user?.role === "buyer" ? (
                <form className={rs.addReviewContainer} onSubmit={handleReviewSubmit}>
                  <h4 className={rs.addReviewTitle}>Rate this property</h4>
                  <div className={rs.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active =
                        star <= (reviewForm.hoverRating || reviewForm.rating);
                      return (
                        <button
                          type="button"
                          key={star}
                          className={rs.starButton}
                          onClick={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: star,
                            }))
                          }
                          onMouseEnter={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              hoverRating: star,
                            }))
                          }
                          onMouseLeave={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              hoverRating: 0,
                            }))
                          }
                          aria-label={`${star} star rating`}
                        >
                          {active ? (
                            <HiStar size={30} className={rs.starActive} />
                          ) : (
                            <HiOutlineStar
                              size={30}
                              className={rs.starInactive}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    className={rs.reviewTextarea}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share your experience with this listing..."
                    maxLength={800}
                  />
                  <button
                    type="submit"
                    className={rs.submitButton}
                    disabled={reviewStatus.loading}
                  >
                    {reviewStatus.loading ? "Saving..." : "Submit Rating"}
                  </button>
                  {reviewStatus.message && (
                    <p
                      className={`${rs.messageBase} ${
                        reviewStatus.type === "success"
                          ? rs.messageSuccess
                          : rs.messageError
                      }`}
                    >
                      {reviewStatus.message}
                    </p>
                  )}
                </form>
              ) : (
                <div className={rs.addReviewContainer}>
                  <h4 className={rs.addReviewTitle}>Rate this property</h4>
                  <p className="text-[#6b7280]">
                    {user
                      ? "Only buyers can submit ratings."
                      : "Login as a buyer to submit a rating."}
                  </p>
                  {!user && (
                    <Link to="/login" className="btn btn-primary mt-4">
                      Login to Rate
                    </Link>
                  )}
                </div>
              )}

              <div className={rs.reviewsList}>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <article key={review._id} className={rs.reviewCard}>
                      <div className="flex items-start justify-between gap-4">
                        <div className={rs.reviewHeader}>
                          <img
                            src={
                              review.buyer?.profilePic ||
                              `https://ui-avatars.com/api/?name=${review.buyer?.name || "Buyer"}&background=0d6e59&color=fff`
                            }
                            alt={review.buyer?.name || "Buyer"}
                            className={rs.avatar}
                          />
                          <div>
                            <div className={rs.reviewBuyerName}>
                              {review.buyer?.name || "Buyer"}
                            </div>
                            <div className={rs.reviewDate}>
                              {new Date(review.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {/* Delete is visible only to admins or the buyer who wrote it. */}
                        {(user?.role === "admin" ||
                          review.buyer?._id === user?._id) && (
                          <button
                            type="button"
                            onClick={() => handleReviewDelete(review._id)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 text-red-500 transition-colors hover:bg-red-50"
                            title="Delete rating"
                            aria-label="Delete rating"
                          >
                            <HiTrash size={18} />
                          </button>
                        )}
                      </div>
                      <div className={rs.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) =>
                          star <= review.rating ? (
                            <HiStar
                              key={star}
                              size={18}
                              className={rs.starActive}
                            />
                          ) : (
                            <HiOutlineStar
                              key={star}
                              size={18}
                              className={rs.starInactive}
                            />
                          ),
                        )}
                      </div>
                      {review.comment && (
                        <p className={rs.reviewComment}>{review.comment}</p>
                      )}
                    </article>
                  ))
                ) : (
                  <div className={rs.emptyState}>
                    No ratings yet. Be the first buyer to rate this property.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className={s.sidebarColumn}>
            {/* Price Card */}
            <div
              className={s.priceCard}
              style={{ background: "var(--primary)" }}
            >
              <div className={s.priceCardLabel}>
                {property.status?.toLowerCase() === "rent"
                  ? "Rental Details"
                  : "Listing Price"}
              </div>
              <div className={s.priceCardValue}>
                {property.status?.toLowerCase() === "rent"
                  ? `₹${Number(property.price).toLocaleString("en-IN")}`
                  : formattedPrice}
                {property.status?.toLowerCase() === "rent" && (
                  <span className={s.priceCardPeriod}> /month</span>
                )}
              </div>
              {property.status?.toLowerCase() === "rent" && (
                <div className={s.rentDetails}>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Security Deposit</span>
                    <span className={s.rentDetailValue}>
                      ₹
                      {Number(property.securityDeposit || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Maintenance</span>
                    <span className={s.rentDetailValue}>
                      ₹
                      {Number(property.maintenance || 0).toLocaleString(
                        "en-IN",
                      )}
                      /mo
                    </span>
                  </div>
                </div>
              )}
              <div className={s.priceCardAvailability}>
                Available for{" "}
                {property.status?.toLowerCase() === "rent" ? "Rent" : "Sale"}
              </div>
            </div>

            {/* Seller & Contact */}
            <div className={s.sellerCard}>
              <div className={s.sellerInfo}>
                <div className={s.sellerAvatar}>
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className={s.sellerAvatarImage}
                  />
                </div>
                <div className={s.sellerDetails}>
                  <div className={s.sellerNameLink}>
                    <h4 className={s.sellerName}>
                      {property.seller?.name || "Seller"}
                    </h4>
                  </div>
                  <div className={s.sellerVerifiedBadge}>
                    <HiBadgeCheck className={s.verifiedIcon} /> Verified Seller
                  </div>
                </div>
              </div>

              <div className={s.chatButtonWrapper}>
                <button className={s.chatButton} onClick={handleChatStart}>
                  <HiChatAlt /> Chat
                </button>
              </div>

              {/* Inquiry Form */}
              <h4 className={s.inquiryFormTitle}>Inquire</h4>
              <form onSubmit={handleInquirySubmit}>
                {user?.role === "buyer" ? (
                  <>
                    <textarea
                      placeholder="Your Message..."
                      value={inquiry.message}
                      onChange={(e) =>
                        setInquiry({ ...inquiry, message: e.target.value })
                      }
                      className={s.inquiryTextarea}
                      required
                    />
                    <button
                      type="submit"
                      className={s.inquirySubmitButton}
                      disabled={inquiryStatus.loading}
                    >
                      {inquiryStatus.loading ? "Sending..." : "Send Inquiry"}
                    </button>
                    {inquiryStatus.success && (
                      <p className={s.inquirySuccessMessage}>Inquiry sent!</p>
                    )}
                  </>
                ) : (
                  <div className={s.inquiryDisabledMessage}>
                    <p className={s.inquiryDisabledText}>
                      {user
                        ? "Only buyers can send inquiries."
                        : "Please login as a buyer to send inquiries."}
                    </p>
                    {!user && (
                      <Link to="/login" className={s.inquiryLoginButton}>
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Additional Details Box */}
        <div className={s.additionalDetails}>
          <h3 className={s.detailsTitle}>Property Details</h3>
          <div className={s.detailsGrid}>
            {[
              {
                label: "Property ID",
                value: property._id.slice(-8).toUpperCase(),
              },
              {
                label: "Added On",
                value: new Date(property.createdAt).toLocaleDateString(),
              },
              { label: "Property Type", value: property.propertyType },
              { label: "Status", value: `For ${property.status}` },
            ].map((detail, i) => (
              <div key={i} className={s.detailRow}>
                <span className={s.detailLabel}>{detail.label}</span>
                <span className={s.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Properties */}
        <section className={s.similarSection}>
          <div className={s.similarHeader}>
            <div>
              <h2 className={s.similarTitle}>Similar Properties</h2>
              <p className={s.similarSubtitle}>
                Listings you might like in {property.city}.
              </p>
            </div>
            <Link to="/properties" className={s.similarAllLink}>
              All Listings <HiChevronRight />
            </Link>
          </div>
          <div className={s.similarGrid}>
            {similarProperties.length > 0 ? (
              similarProperties
                .slice(0, 3)
                .map((p) => <PropertyCard key={p._id} property={p} />)
            ) : (
              <div className={s.similarEmptyState}>
                No similar properties found in this location.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PropertyDetails;
