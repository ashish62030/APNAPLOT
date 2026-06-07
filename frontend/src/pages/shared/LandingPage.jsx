import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import banner from "../../assets/bannerimage.png";
import {
  HiLocationMarker,
  HiSearch,
  HiHome,
  HiOfficeBuilding,
  HiOutlineMap,
  HiLightningBolt,
  HiShieldCheck,
  HiCurrencyDollar,
  HiMail,
  HiPhone,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/hexagonlogo1.png";
import { landingPageStyles as s } from "../../assets/dummyStyles";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("Select Type");
  const [propertyCounts, setPropertyCounts] = useState({
    flat: 0,
    villa: 0,
    penthouse: 0,
    commercial: 0,
  });
  const [wishlistedIds, setWishlistedIds] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchCounts();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistedIds(
        res.data
          .filter((item) => item.property)
          .map((item) => String(item.property._id)),
      );
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (propertyId) => {
    try {
      const isWishlisted = wishlistedIds.includes(propertyId);
      if (isWishlisted) {
        await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistedIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${propertyId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWishlistedIds((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/property/counts`);
      if (res.data.success) {
        setPropertyCounts(res.data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch property counts:", err);
    }
  };

  const fetchProperties = async (search = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/property?city=${search}`);
      setProperties(res.data.properties || res.data || []);
      setError(null);
    } catch {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append("city", searchTerm);
    if (propertyType !== "Select Type") params.append("type", propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  const categories = [
    {
      name: "Modern Flats",
      count: propertyCounts.flat || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "flat",
    },
    {
      name: "Luxury Villas",
      count: propertyCounts.villa || 0,
      icon: <HiHome size={32} />,
      type: "villa",
    },
    {
      name: "Penthouse",
      count: propertyCounts.penthouse || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "penthouse",
    },
    {
      name: "Commercial",
      count: propertyCounts.commercial || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "commercial",
    },
  ];

  const features = [
    {
      title: "Verified Trust",
      desc: "Every listing is strictly audited for ownership, condition, and legality.",
      icon: <HiShieldCheck size={24} />,
    },
    {
      // This says "Easy Search" because the app uses filters, not AI.
      title: "Easy Search",
      desc: "Filter listings by location and property type to quickly find relevant options.",
      icon: <HiLightningBolt size={24} />,
    },
    {
      title: "Best Value",
      desc: "Direct-from-owner listings and zero-commission options to ensure competitive prices.",
      icon: <HiCurrencyDollar size={24} />,
    },
    {
      title: "Direct Inquiry",
      desc: "Send inquiries and connect with sellers directly from each property page.",
      icon: <HiMail size={24} />,
    },
  ];

  return (
    <div className={s.bgMain}>
      <Navbar />

      {/* Hero Section */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <span className={s.badge}>Trusted by 20,000+ homeowners</span>
          <h1 className={s.heroTitle}>
            Find Your <span className={s.textGradient}>Perfect</span> Next
            Chapter.
          </h1>
          <p className={s.heroSubtitle}>
            Experience the most advanced real estate search platform. Discover
            verified listings, connect with top agents, and find a place you'll
            love.
          </p>

          {/* Integrated Search */}
          <form onSubmit={handleSearch} className={s.searchForm}>
            <div className={s.searchField}>
              <div className={s.textPrimary}>
                <HiLocationMarker size={26} />
              </div>
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Location</label>
                <input
                  type="text"
                  placeholder="Where are you looking?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.inputTransparent}
                />
              </div>
            </div>
            <div className={s.searchDivider}></div>
            <div className={s.searchField}>
              <div className={s.textPrimary}>
                <HiHome size={26} />
              </div>
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={`${s.inputTransparent} cursor-pointer`}
                >
                  <option value="Select Type">Select Type</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="villa">Villa/House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
            <button type="submit" className={s.searchButton}>
              <HiSearch size={22} /> Search
            </button>
          </form>

          {/* Stats */}
          <div className={s.statsContainer}>
            <div className={s.statItemFlex}>
              {/* Real value from fetched listings instead of a fake marketing number. */}
              <h3 className={s.statNumber}>{properties.length}</h3>
              <p className={s.statLabel}>Available Listings</p>
            </div>
            <div className={s.statItemBorder}>
              {/* Real total from property category counts returned by the backend. */}
              <h3 className={s.statNumber}>
                {(propertyCounts.flat || 0) +
                  (propertyCounts.villa || 0) +
                  (propertyCounts.penthouse || 0) +
                  (propertyCounts.commercial || 0)}
              </h3>
              <p className={s.statLabel}>Listed by Type</p>
            </div>
            <div className={s.statItemBorder}>
              {/* Neutral text because there is no site-wide rating average here. */}
              <h3 className={s.statNumber}>Verified</h3>
              <p className={s.statLabel}>Seller Access</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className={s.heroImageContainer}>
          <div className={s.imageWrapper}>
            <img src={banner} alt="Luxury Home" className={s.heroImage} />
            {/* Verified Badge Overlay */}
            <div className={s.verifiedBadge}>
              <div className={s.badgeIconWrapper}>
                <HiShieldCheck size={24} className="text-primary" />
              </div>
              <div>
                <h4 className={s.badgeTitle}>Verified Listing</h4>
                <p className={s.badgeText}>
                  Inspected by our professional team
                </p>
              </div>
              <span className={s.preApproved}>Pre-Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className={s.categorySection}>
        <div className={s.container}>
          <div className={s.categoryHeader}>
            <div className={s.categoryHeaderText}>
              <h2 className={s.categoryTitle}>Browse by Category</h2>
              <p className={s.categoryDesc}>
                Explore curated collections of properties tailored to your
                specific lifestyle and needs.
              </p>
            </div>
          </div>
          <div className={s.categoryGrid}>
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className={s.categoryCard}
                onClick={() => navigate(`/properties?type=${cat.type}`)}
              >
                <div className={s.categoryIconWrapper}>{cat.icon}</div>
                <h3 className={s.categoryName}>{cat.name}</h3>
                <p className={s.categoryCount}>
                  {cat.count.toLocaleString()} Properties
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={s.featuresSection}>
        <div className={s.featuresContainer}>
          <div className={s.featuresList}>
            {features.map((f, idx) => (
              <div
                key={idx}
                className={s.featureCard}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={s.featureIconWrapper}>{f.icon}</div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className={s.featuresContent}>
            <h2 className={s.featuresHeading}>
              Why ApnaPlot
              <br />
              is the <span className={s.textGradient}>Preferred Choice.</span>
            </h2>
            <p className={s.featuresSubtext}>
              We've reinvented the property search experience from the ground
              up. By focusing on transparency, technological precision, and
              user-centric design, we help you find not just a house, but a
              home.
            </p>
            <ul className={s.featuresListItems}>
              {[
                "Direct connection with certified agents",
                "Real-time market valuation data",
                "Secure document management system",
                "24/7 Premium customer support",
              ].map((item, idx) => (
                <li key={idx} className={s.listItem}>
                  <HiLightningBolt className="text-primary" /> {item}
                </li>
              ))}
            </ul>
            <a href="#process" className={s.learnMoreLink}>
              Learn more about our process &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className={s.processSection}>
        <div className={s.container}>
          <div className={s.processHeader}>
            <span className={s.processBadge}>How It Works</span>
            <h2 className={s.processTitle}>
              Our Seamless <span className={s.textGradient}>Process</span>
            </h2>
            <p className={s.processSubtitle}>
              We've simplified the journey of finding your dream home into three
              clear, stress-free steps.
            </p>
          </div>

          <div className={s.processGrid}>
            {[
              {
                step: "01",
                // Search is filter-based, so this avoids claiming AI algorithms.
                title: "Search Listings",
                desc: "Use location and property type filters to browse listings that match your needs.",
                icon: <HiLightningBolt size={32} />,
              },
              {
                step: "02",
                // Replaced virtual tours because the app does not have that feature.
                title: "Connect Directly",
                desc: "Send an inquiry or start a chat with the seller when a listing matches your needs.",
                icon: <HiMail size={32} />,
              },
              {
                step: "03",
                title: "Verified Trust",
                desc: "Every listing is strictly audited for ownership and condition, ensuring your peace of mind and a secure transaction.",
                icon: <HiShieldCheck size={32} />,
              },
            ].map((p, idx) => (
              <div key={idx} className={s.processCard}>
                <div className={s.stepNumber}>{p.step}</div>
                <div className={s.processIconWrapper}>{p.icon}</div>
                <h3 className={s.processCardTitle}>{p.title}</h3>
                <p className={s.processCardDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className={s.featuredSection}>
        <div className={s.container}>
          <div className={s.featuredHeader}>
            <span className={s.featuredBadge}>Handpicked For You</span>
            <h2 className={s.featuredTitle}>Featured Collections</h2>
            <p className={s.featuredSubtitle}>
              Discover high-value properties curated by our experts for their
              exceptional design, location, and investment potential.
            </p>
          </div>

          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loader}></div>
            </div>
          ) : error ? (
            <div className={s.errorContainer}>
              <p>{error}</p>
            </div>
          ) : (
            <div className={s.propertiesGrid}>
              {properties
                .filter((p) => p)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isWishlisted={wishlistedIds.includes(String(property._id))}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
            </div>
          )}

          <div className={s.discoverButtonContainer}>
            <button
              onClick={() => navigate("/properties")}
              className={s.discoverButton}
            >
              Discover More Properties
            </button>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.container}>
          <div className={s.footerMainGrid}>
            {/* Column 1: Brand & About */}
            <div className={s.footerBrand}>
              <div className={s.brandLogo}>
                <div className={s.brandIcon}>RE</div>
                ApnaPlot
              </div>
              <p className={s.brandDesc}>
                The most trusted platform for buying, selling, and renting
                premium real estate globally. We make property hunting seamless.
              </p>
              <div className={s.socialIcons}>
                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
                  (Icon, idx) => (
                    <a key={idx} href="#" className={s.socialIcon}>
                      <Icon size={16} />
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className={s.footerHeading}>Company</h4>
              <ul className={s.footerLinks}>
                <li>
                  <a href="/" className={s.footerLink}>
                    Home
                  </a>
                </li>
                <li>
                  <a href="/properties" className={s.footerLink}>
                    Property
                  </a>
                </li>
                <li>
                  <a href="/wishlist" className={s.footerLink}>
                    Wishlist
                  </a>
                </li>
                <li>
                  <a href="/contact" className={s.footerLink}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h4 className={s.footerHeading}>Support</h4>
              <ul className={s.footerLinks}>
                <li className={s.contactInfo}>
                  <HiMail className="text-primary text-xl" />{" "}
                  contact@apnaplot.com
                </li>
                <li className={s.contactInfo}>
                  <HiPhone className="text-primary text-xl" /> +91 1234567890
                </li>
                <li className={s.contactInfoStart}>
                  <HiLocationMarker
                    className={`text-primary ${s.contactIcon}`}
                  />
                  123 Business Hub, India
                </li>
              </ul>
            </div>

            {/* Column 4: Replaces the removed non-working newsletter signup. */}
            <div>
              <h4 className={s.footerHeading}>Explore</h4>
              <p className={s.newsletterDesc}>
                Browse listings, save favorite properties, or contact our team
                for help with your search.
              </p>
              <ul className={s.footerLinks}>
                <li>
                  <a href="/properties" className={s.footerLink}>
                    Browse Properties
                  </a>
                </li>
                <li>
                  <a href="/wishlist" className={s.footerLink}>
                    Saved Properties
                  </a>
                </li>
                <li>
                  <a href="/contact" className={s.footerLink}>
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className={s.bottomBar}>
            <div className={s.bottomBarFlex}>
              <p>
                © {new Date().getFullYear()} ApnaPlot. All rights reserved.
              </p>
              <div className={s.footerLegalLinks}>
                <a href="#" className={s.footerLink}>
                  Privacy Policy
                </a>
                <a href="#" className={s.footerLink}>
                  Terms of Service
                </a>
                <a href="#" className={s.footerLink}>
                  Cookies Settings
                </a>
              </div>
            </div>
            <div className={s.designCredit}>
              <img
                src={logo}
                alt="Hexagon Digital Services"
                className={s.designLogo}
              />
              <span className="text-text-muted">Designed by Ashish Pandey</span>
             
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

