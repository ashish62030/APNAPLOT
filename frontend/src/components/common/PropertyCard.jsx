import {
  HiLocationMarker,
  HiShieldCheck,
  HiHeart,
  HiOutlineHeart,
  HiOutlineHome,
  HiArrowsExpand,
  HiOutlineUserGroup,
  HiEye,
} from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { propertyCardStyles as s } from "../../assets/dummyStyles";

const PropertyCard = ({
  property,
  renderActions,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!property) return null;
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (onToggleWishlist) {
      onToggleWishlist(property._id);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const statusBadgeClass = s.badgeStatus(property.status);

  return (
    <div className={s.card}>
      <Link to={`/property/${property._id}`} className={s.link}>
        {/* Image Section */}
        <div className={s.imageSection}>
          <img
            src={property.images[0]}
            alt={property.title}
            className={s.image}
          />

          {/* Top Badges */}
          <div className={s.topBadges}>
            <div className={s.badgesLeft}>
              {renderActions ? (
                <span className={statusBadgeClass}>
                  {property.status === "sale" ? "available" : property.status}
                </span>
              ) : (
                <span className={s.badgeNew}>New</span>
              )}
              <span className={s.badgeVerified}>
                <HiShieldCheck size={14} /> Verified
              </span>
            </div>
            {(!user || user.role === "buyer") && (
              <button
                className={s.wishlistButton(isWishlisted)}
                onClick={handleWishlistClick}
              >
                {isWishlisted ? (
                  <HiHeart size={20} />
                ) : (
                  <HiOutlineHeart size={20} />
                )}
              </button>
            )}
          </div>

          {/* Price Overlay */}
          <div className={s.priceOverlay}>
            <h3 className={s.price}>{formattedPrice}</h3>
          </div>
        </div>

        {/* Content Section */}
        <div className={s.content}>
          <div className="flex justify-between items-center">
            <span className={s.propertyType}>{property.propertyType}</span>
            {property.views !== undefined && (
              <div className={s.views}>
                <HiEye size={16} /> {property.views}
              </div>
            )}
          </div>

          <h4 className={s.title}>{property.title}</h4>

          <div className={s.location}>
            <HiLocationMarker className={s.locationIcon} />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {property.area}, {property.city}
            </span>
          </div>

          {/* Specs Grid */}
          <div className={s.specsGrid}>
            {property.propertyType?.toLowerCase() === "commercial" ? (
              <>
                <div className={s.specItem}>
                  <div className={s.specIcon}>
                    <HiOutlineHome size={20} />
                  </div>
                  <div className={s.specValue}>{property.status}</div>
                  <div className={s.specLabel}>Type</div>
                </div>
                <div className={`${s.specItem} ${s.specDivider}`}>
                  <div className={s.specIcon}>
                    <HiArrowsExpand size={20} />
                  </div>
                  <div className={s.specValue}>{property.areaSize}</div>
                  <div className={s.specLabel}>Sq Ft</div>
                </div>
                <div className={s.specItem}>
                  <div className={s.specIcon}>
                    <HiShieldCheck size={20} />
                  </div>
                  <div className={s.specValue}>OK</div>
                  <div className={s.specLabel}>Legal</div>
                </div>
              </>
            ) : (
              <>
                <div className={s.specItem}>
                  <div className={s.specIcon}>
                    <HiOutlineHome size={20} />
                  </div>
                  <div className={s.specValue}>{property.bhk}</div>
                  <div className={s.specLabel}>Beds</div>
                </div>
                <div className={`${s.specItem} ${s.specDivider}`}>
                  <div className={s.specIcon}>
                    <HiOutlineUserGroup size={20} />
                  </div>
                  <div className={s.specValue}>
                    {property.bathrooms ||
                      Math.max(1, parseInt(property.bhk) - 1 || 0)}
                  </div>
                  <div className={s.specLabel}>Baths</div>
                </div>
                <div className={s.specItem}>
                  <div className={s.specIcon}>
                    <HiArrowsExpand size={20} />
                  </div>
                  <div className={s.specValue}>{property.areaSize}</div>
                  <div className={s.specLabel}>Sq Ft</div>
                </div>
              </>
            )}
          </div>

          {/* View Details Action (Desktop/Default) */}
          {!renderActions && (
            <div className={s.viewDetailsButton}>
              <button className={s.viewDetailsBtn}>View Details</button>
            </div>
          )}
        </div>
      </Link>

      {/* Custom Actions (Management) - OUTSIDE Link */}
      {renderActions && (
        <div
          className={s.actionsContainer}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {renderActions(property)}
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
