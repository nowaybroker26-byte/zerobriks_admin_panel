import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Slider from "react-slick";
import { FaEdit, FaTrashAlt, FaCopy, FaMapMarkerAlt } from "react-icons/fa";
import { BsHouseDoorFill } from "react-icons/bs";
import { Ruler } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair } from "@fortawesome/free-solid-svg-icons";
import { AiOutlineUser } from "react-icons/ai";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MyContext } from "../../App";

const PropertyCard = ({ property, onDelete }) => {
  const { can } = useContext(MyContext);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const getValidImageUrl = (img) => {
    if (typeof img !== "string" || !img.trim()) return null;
    return img.startsWith("http") ? img : `${BASE_URL}/${img.replace(/^\/+/, "")}`;
  };

  const propertyId = property._id || property.id || "";
  const coverImage = getValidImageUrl(property.cover_image);
  const additionalImages = (property.property_images || [])
    .map((imgObj) => {
      const path = typeof imgObj === "string" ? imgObj : imgObj?.image;
      return getValidImageUrl(path);
    })
    .filter(Boolean);
  const allImages = [...(coverImage ? [coverImage] : []), ...additionalImages];

  const handleUpdateClick = (e) => {
    e.stopPropagation();
    if (propertyId) {
      navigate(`/update-property/${propertyId}`);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (propertyId && window.confirm("Are you sure you want to delete this property listing?")) {
      onDelete(propertyId);
    }
  };

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (propertyId) {
      navigator.clipboard.writeText(String(propertyId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "₹0";
    const num = Number(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const convertToSqFt = (area, unit) => {
    if (!area || isNaN(area)) return null;
    const a = Number(area);
    const u = (unit || "sq ft").toLowerCase().trim();
    switch (u) {
      case "sq ft":
      case "sqft":
        return a;
      case "sq yard":
      case "sqyard":
        return a * 9;
      case "sq mt":
      case "sqm":
        return a * 10.7639;
      case "acre":
        return a * 43560;
      default:
        return a;
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    beforeChange: (_, next) => setActiveIndex(next),
    customPaging: (i) => {
      const isActive = i === activeIndex;
      return (
        <div
          style={{
            width: isActive ? "16px" : "6px",
            height: "6px",
            borderRadius: "3px",
            background: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
            margin: "0 2px",
            transition: "all 0.2s ease",
          }}
        />
      );
    },
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: 0,
        }}
      >
        {dots}
      </div>
    ),
  };

  // Determine category badge colors
  const getCategoryBadge = () => {
    const raw = (property.property_category_type || "").toLowerCase();
    if (raw.includes("buy") && !raw.includes("commercial")) {
      return { text: "FOR BUY", bg: "#059669", color: "#FFFFFF" };
    }
    if (raw.includes("rent") && !raw.includes("commercial")) {
      return { text: "FOR RENT", bg: "#2563EB", color: "#FFFFFF" };
    }
    if (raw.includes("commercial buy")) {
      return { text: "COMMERCIAL BUY", bg: "#7C3AED", color: "#FFFFFF" };
    }
    if (raw.includes("commercial lease")) {
      return { text: "COMMERCIAL LEASE", bg: "#4F46E5", color: "#FFFFFF" };
    }
    if (raw.includes("pg") || raw.includes("co living")) {
      return { text: "PG / CO-LIVING", bg: "#D97706", color: "#FFFFFF" };
    }
    return { text: (property.property_category_type || "PROPERTY").toUpperCase(), bg: "#475569", color: "#FFFFFF" };
  };

  const catBadge = getCategoryBadge();
  const sqft = convertToSqFt(property.area, property.area_in);

  return (
    <div className="card h-100 border rounded-4 shadow-sm overflow-hidden d-flex flex-column hover-shadow transition-all bg-white">
      {/* Top Image Box */}
      <div className="position-relative overflow-hidden" style={{ height: "205px", backgroundColor: "#F1F5F9" }}>
        <Link to={`/property-details/${property._id}`} className="d-block w-100 h-100">
          {allImages.length > 1 ? (
            <Slider {...sliderSettings} className="h-100">
              {allImages.map((imgUrl, idx) => (
                <div key={idx} className="h-100">
                  <img
                    src={imgUrl}
                    alt={property.property_name || "Property"}
                    className="w-100 h-100 object-cover"
                    style={{ height: "205px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x205?text=Zerobriks+Property";
                    }}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={allImages[0] || "https://via.placeholder.com/400x205?text=Zerobriks+Property"}
              alt={property.property_name || "Property"}
              className="w-100 h-100 object-cover"
              style={{ height: "205px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x205?text=Zerobriks+Property";
              }}
            />
          )}
        </Link>

        {/* Days ago pill */}
        <span
          className="position-absolute top-0 start-0 m-2 px-2.5 py-1 rounded-pill text-white fw-semibold"
          style={{
            fontSize: "11px",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          {property.days_since_created ? `${property.days_since_created}d ago` : "Recently added"}
        </span>

        {/* Action Buttons (Edit / Delete) */}
        <div className="position-absolute top-0 end-0 m-2 d-flex gap-1.5">
          {can("myInventory", "edit") && (
            <button
              onClick={handleUpdateClick}
              className="btn btn-sm btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", color: "#2563EB" }}
              title="Edit Property"
            >
              <FaEdit size={14} />
            </button>
          )}
          {can("myInventory", "delete") && (
            <button
              onClick={handleDeleteClick}
              className="btn btn-sm btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", color: "#DC2626" }}
              title="Delete Property"
            >
              <FaTrashAlt size={13} />
            </button>
          )}
        </div>

        {/* Floating Category Tag */}
        <div className="position-absolute bottom-0 start-0 m-2">
          <span
            className="badge px-2.5 py-1 rounded-2 fw-bold text-uppercase shadow-xs"
            style={{
              backgroundColor: catBadge.bg,
              color: catBadge.color,
              fontSize: "10.5px",
              letterSpacing: "0.5px",
            }}
          >
            {catBadge.text}
          </span>
        </div>

        {/* Featured Tag */}
        {property.mark_as_featured === "Yes" && (
          <div className="position-absolute bottom-0 end-0 m-2">
            <span
              className="badge px-2 py-1 rounded-2 fw-bold shadow-xs"
              style={{
                backgroundColor: "#A68139",
                color: "#FFFFFF",
                fontSize: "10.5px",
              }}
            >
              ★ FEATURED
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body p-3.5 d-flex flex-column flex-grow-1">
        {/* Price & Unit Type */}
        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <div className="h5 fw-bolder mb-0" style={{ color: "#7A0E2E" }}>
            {property.property_category_type === "Rent" && property.rent
              ? `${formatPrice(property.rent)}${property.rent_duration ? ` / ${property.rent_duration}` : ""}`
              : property.property_price
              ? formatPrice(property.property_price)
              : "Price on Request"}
          </div>

          <span
            className="badge bg-light text-secondary border px-2 py-1 rounded-2 text-capitalize"
            style={{ fontSize: "11px" }}
          >
            {property.property_type || "Residential"}
          </span>
        </div>

        {/* Property Name */}
        <h6 className="fw-bold text-dark mb-1 text-truncate" title={property.property_name}>
          <Link
            to={`/property-details/${property._id}`}
            className="text-dark text-decoration-none"
            style={{ transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.target.style.color = "#7A0E2E")}
            onMouseLeave={(e) => (e.target.style.color = "")}
          >
            {property.property_name || "Unnamed Property"}
          </Link>
        </h6>

        {/* Location / Area */}
        <p className="text-muted small mb-2 text-truncate d-flex align-items-center">
          <FaMapMarkerAlt className="text-danger me-1 flex-shrink-0" style={{ fontSize: "12px", color: "#7A0E2E" }} />
          <span>{property.address_area || property.address || "Location not specified"}</span>
        </p>

        {/* Key Features Ribbon */}
        <div
          className="d-flex flex-wrap gap-1.5 p-2 rounded-3 mb-3"
          style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}
        >
          {property.bhk_type && property.bhk_type !== "Not Specified" && (
            <span className="badge bg-white text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
              <BsHouseDoorFill className="me-1 text-secondary" />
              {property.bhk_type}
            </span>
          )}

          {sqft && (
            <span className="badge bg-white text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
              <Ruler size={13} className="me-1 text-secondary" />
              {Math.round(sqft)} sq ft
            </span>
          )}

          {property.furnished_type && (
            <span className="badge bg-white text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
              <FontAwesomeIcon icon={faChair} className="me-1 text-secondary" />
              {property.furnished_type}
            </span>
          )}
        </div>

        {/* Owner / Poster Row */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
          <div className="d-flex align-items-center overflow-hidden me-2">
            <div
              className="rounded-circle overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center border"
              style={{ width: "28px", height: "28px", backgroundColor: "#F1F5F9" }}
            >
              {property.property_owner_image ? (
                <img
                  src={`${BASE_URL}/media/${property.property_owner_image}`}
                  alt="Owner"
                  className="w-100 h-100 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <AiOutlineUser className="text-muted" size={16} />
              )}
            </div>

            <div className="ms-2 overflow-hidden">
              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "12px" }}>
                {property.connect_to_name || "Owner"}
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: "10.5px" }}>
                {property.user_type || "Property Owner"}
              </div>
            </div>
          </div>

          {/* Copy ID Button */}
          <button
            onClick={handleCopyId}
            className="btn btn-sm btn-light border px-2 py-1 rounded-2 d-flex align-items-center gap-1 text-muted"
            style={{ fontSize: "11px" }}
            title="Copy Property ID"
          >
            <span>ID</span>
            {copied ? (
              <span className="text-success fw-bold">✓</span>
            ) : (
              <FaCopy size={10} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
