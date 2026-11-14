import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faSlidersH,
  faIndianRupeeSign,
  faClock,
  faArrowLeft,
  faArrowRight,
  faShieldAlt,
  faCoins,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";

  const handleClick = (category) => {
    navigate(`${prefix}/admin-settings/${category}`);
  };

  const categories = [
    {
      id: "general-setting",
      title: "General Settings",
      subtitle: "System Preferences",
      description:
        "Configure global platform defaults, branding assets, contact information, and standard real estate catalog parameters.",
      icon: faSlidersH,
      color: "#7A0E2E",
      bgLight: "rgba(122, 14, 46, 0.08)",
      borderColor: "rgba(122, 14, 46, 0.2)",
      tag: "CORE SYSTEM",
    },
    {
      id: "dynamic-price",
      title: "Dynamic Pricing",
      subtitle: "Listing Monetization",
      description:
        "Manage rule-based pricing multipliers, featured listing charges, surge rates, and regional discount formulas.",
      icon: faCoins,
      color: "#85621e",
      bgLight: "rgba(166, 129, 57, 0.12)",
      borderColor: "rgba(166, 129, 57, 0.25)",
      tag: "FINANCIAL",
    },
    {
      id: "time-slot",
      title: "Time Slot Windows",
      subtitle: "Walkthrough Scheduling",
      description:
        "Set standard virtual tour appointment slots, inspection intervals, and calendar availability for property walkthroughs.",
      icon: faClock,
      color: "#1d4ed8",
      bgLight: "rgba(37, 99, 235, 0.08)",
      borderColor: "rgba(37, 99, 235, 0.2)",
      tag: "SCHEDULING",
    },
  ];

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Main Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to="/dashboard"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Dashboard
              </Link>
              <span className="text-muted small">•</span>
              <span
                className="badge rounded-pill px-2.5 py-0.5 fw-bold text-uppercase"
                style={{
                  backgroundColor: "rgba(122, 14, 46, 0.08)",
                  color: "#7A0E2E",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                Configuration & System
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(122, 14, 46, 0.1)",
                  color: "#7A0E2E",
                }}
              >
                <FontAwesomeIcon icon={faCog} />
              </span>
              Admin Settings Hub
            </h3>
            <p className="text-muted small mb-0">
              Select a configuration module below to manage platform behavior, monetization, and scheduling rules.
            </p>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="row g-4 mb-4">
          {categories.map((cat) => (
            <div key={cat.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="h-100 p-4 rounded-4 border transition bg-white shadow-xs cursor-pointer d-flex flex-column justify-content-between position-relative overflow-hidden"
                style={{
                  borderColor: "#E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.25s ease-in-out",
                }}
                onClick={() => handleClick(cat.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className="badge rounded-pill px-2.5 py-1 fw-bold text-uppercase"
                      style={{
                        backgroundColor: cat.bgLight,
                        color: cat.color,
                        fontSize: "10px",
                        letterSpacing: "0.5px",
                        border: `1px solid ${cat.borderColor}`,
                      }}
                    >
                      {cat.tag}
                    </span>

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: cat.bgLight,
                        color: cat.color,
                      }}
                    >
                      <FontAwesomeIcon icon={cat.icon} size="lg" />
                    </div>
                  </div>

                  <span className="text-muted small fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                    {cat.subtitle}
                  </span>
                  <h5 className="fw-bold text-dark mb-2">{cat.title}</h5>
                  <p
                    className="text-muted small mb-3"
                    style={{ lineHeight: "1.5", fontSize: "13px" }}
                  >
                    {cat.description}
                  </p>
                </div>

                {/* Footer Action link */}
                <div
                  className="pt-3 border-top d-flex align-items-center justify-content-between"
                  style={{ borderColor: "#F1F5F9" }}
                >
                  <span
                    className="fw-semibold small d-inline-flex align-items-center"
                    style={{ color: cat.color }}
                  >
                    Configure Settings
                    <FontAwesomeIcon icon={faArrowRight} className="ms-1.5" size="xs" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Info Banner */}
        <div
          className="p-3.5 rounded-3 border d-flex flex-wrap align-items-center justify-content-between"
          style={{
            backgroundColor: "#F8FAFC",
            borderColor: "#E2E8F0",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: "rgba(122, 14, 46, 0.1)",
                color: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faShieldAlt} size="xs" />
            </span>
            <div>
              <span className="fw-semibold text-dark small d-block">
                Zerobriks Central Administration
              </span>
              <span className="text-muted" style={{ fontSize: "12px" }}>
                All settings updates are automatically synchronized across the mobile apps and customer web portals.
              </span>
            </div>
          </div>

          <div className="mt-2 mt-md-0 d-flex gap-2">
            <Link
              to="/properties"
              className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-muted"
              style={{ fontSize: "12px" }}
            >
              Properties
            </Link>
            <Link
              to="/plans-purchase"
              className="btn btn-sm text-white rounded-pill px-3 fw-semibold"
              style={{ backgroundColor: "#7A0E2E", fontSize: "12px" }}
            >
              Subscription Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
