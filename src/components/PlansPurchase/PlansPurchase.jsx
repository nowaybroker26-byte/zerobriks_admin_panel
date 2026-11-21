import { EP } from '../../Api/endpoints';
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faClock,
  faBoxes,
  faUser,
  faBuilding,
  faHouseUser,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { MyContext } from "../../App";

const USER_ROLES = [
  { id: "All", label: "All Plans", icon: faLayerGroup },
  { id: "Property Owner", label: "Property Owner", icon: faHouseUser },
  { id: "Buyer / Tenant", label: "Buyer / Tenant", icon: faUser },
  { id: "Builder / Developer", label: "Builder / Developer", icon: faBuilding },
];

const PlansPurchase = () => {
  const { can } = useContext(MyContext);
  const navigate = useNavigate();

  const [success, setSuccessMessage] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const msg = localStorage.getItem("success");
    if (msg) {
      setSuccessMessage(msg);
      localStorage.removeItem("success");
    }

    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      let plansList = [];

      // Primary endpoint
      try {
        const response = await axios.get(
          `${EP.API_GET_PLANS}`
        );
        if (
          response.data &&
          (response.data.status === 1 || response.data.status === "1") &&
          Array.isArray(response.data.data)
        ) {
          plansList = response.data.data;
        }
      } catch (err1) {
        console.warn("api/get_plans request failed, trying fallback:", err1);
      }

      // Fallback endpoint if primary returned empty
      if (!plansList || plansList.length === 0) {
        try {
          const resFallback = await axios.get(
            `${EP.CUST_API_GET_SUBSCRIPTION_PLANS}`
          );
          if (
            resFallback.data &&
            (resFallback.data.status === 1 || resFallback.data.status === "1") &&
            Array.isArray(resFallback.data.data)
          ) {
            plansList = resFallback.data.data;
          }
        } catch (err2) {
          console.warn("cust_api/get_subscription_plans request failed:", err2);
        }
      }

      if (plansList && plansList.length > 0) {
        setPlans(plansList);
      } else {
        setError("No plans returned from the server.");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to fetch plans from API.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (planId) => {
    navigate(`/update-plan/${planId}`);
  };

  const handleDelete = async (plan_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plan?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${EP.API_DELETE_PLAN}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan_id }),
        }
      );
      const data = await response.json();
      if (data.status === 1 || data.status === "1") {
        setPlans((prev) => prev.filter((p) => p._id !== plan_id));
        setSuccessMessage("Plan deleted successfully!");
      } else {
        alert("Error while deleting plan: " + (data.msg || data.message || "Failed"));
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  // Helper to determine category type / user role
  const getNormalizedUserType = (plan) => {
    const rawCategory = (plan.category_type || plan.user_type || "").trim();
    if (
      rawCategory === "Property Owner" ||
      rawCategory === "Buyer / Tenant" ||
      rawCategory === "Builder / Developer"
    ) {
      return rawCategory;
    }
    const combined = `${rawCategory} ${plan.plan_name || ""}`.toLowerCase();
    if (
      combined.includes("owner") ||
      combined.includes("post property") ||
      combined.includes("post properties") ||
      combined.includes("property")
    ) {
      return "Property Owner";
    }
    if (
      combined.includes("builder") ||
      combined.includes("developer") ||
      combined.includes("project")
    ) {
      return "Builder / Developer";
    }
    return "Buyer / Tenant";
  };

  // Filter plans based on selected role tab
  const filteredPlans = activeTab === "All"
    ? plans
    : plans.filter((plan) => getNormalizedUserType(plan) === activeTab);

  // Counts for tabs
  const getCountForRole = (roleId) => {
    if (roleId === "All") return plans.length;
    return plans.filter((p) => getNormalizedUserType(p) === roleId).length;
  };

  const getRoleBadgeStyle = (roleType) => {
    switch (roleType) {
      case "Buyer / Tenant":
        return { bg: "#EBF5FF", text: "#1E40AF", border: "#BFDBFE", icon: "🎯" };
      case "Property Owner":
        return { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", icon: "🏠" };
      case "Builder / Developer":
        return { bg: "#FAF5FF", text: "#6B21A8", border: "#E9D5FF", icon: "🏗️" };
      default:
        return { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1", icon: "📋" };
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5">
      {/* Alert Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <strong>Success!</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger shadow-sm" role="alert">
          {error}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3 shadow-xs border p-3 p-md-3.5">
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2.5 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-0.5" style={{ fontSize: "16px", letterSpacing: "-0.2px" }}>
              <FontAwesomeIcon icon={faFile} className="me-2" style={{ color: "#7A0E2E" }} />
              Role-Based Subscription Plans
            </h5>
            <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
              Manage dynamic pricing, features, and limits for Buyers/Tenants, Property Owners, and Builders.
            </p>
          </div>
          <div className="mt-2 mt-md-0">
            {can("plans", "add") && (
              <button
                className="btn text-white px-3 py-1.5 fw-semibold rounded-pill shadow-xs"
                style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E", fontSize: "12px" }}
                onClick={() => navigate("/add-plan")}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1.5" />
                Add New Plan
              </button>
            )}
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="d-flex flex-wrap gap-1.5 mb-3">
          {USER_ROLES.map((role) => {
            const isSelected = activeTab === role.id;
            const count = getCountForRole(role.id);
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                className={`btn btn-sm px-2.5 py-1 rounded-pill fw-semibold transition-all ${
                  isSelected
                    ? "text-white shadow-xs"
                    : "btn-outline-secondary border-1"
                }`}
                style={{
                  backgroundColor: isSelected ? "#7A0E2E" : "transparent",
                  borderColor: isSelected ? "#7A0E2E" : "#E2E8F0",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  fontSize: "12px",
                }}
              >
                <FontAwesomeIcon icon={role.icon} className="me-1.5" />
                {role.label}
                <span
                  className="badge rounded-pill ms-1.5"
                  style={{
                    backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#F1F5F9",
                    color: isSelected ? "#FFFFFF" : "#64748B",
                    fontSize: "10.5px",
                    padding: "2px 6px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-danger" role="status" style={{ color: "#7A0E2E" }}>
              <span className="visually-hidden">Loading plans...</span>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: "12px" }}>Loading subscription plans...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPlans.length === 0 && (
          <div className="text-center py-4 px-3 border rounded-3 bg-light my-2" style={{ maxWidth: "460px", margin: "0 auto" }}>
            <div style={{ fontSize: "22px" }} className="mb-1">📋</div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "13.5px" }}>
              No Plans Found for {activeTab}
            </h6>
            <p className="text-muted mb-2.5" style={{ fontSize: "12px" }}>
              You haven't added any subscription plans under this user type yet.
            </p>
            {can("plans", "add") && (
              <button
                className="btn btn-sm text-white px-3 py-1.5 rounded-pill shadow-xs fw-semibold"
                style={{ backgroundColor: "#7A0E2E", fontSize: "12px" }}
                onClick={() => navigate("/add-plan")}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Create {activeTab === "All" ? "a Plan" : `Plan for ${activeTab}`}
              </button>
            )}
          </div>
        )}

        {/* Plans Grid */}
        {!loading && filteredPlans.length > 0 && (
          <div className="row g-3">
            {filteredPlans.map((plan, index) => {
              const roleType = getNormalizedUserType(plan);
              const badge = getRoleBadgeStyle(roleType);
              const finalPrice = parseFloat(plan.final_price) || 0;

              // Parse features comma separated
              const featuresList = (plan.features || "")
                .split(",")
                .map((f) => f.trim())
                .filter((f) => f.length > 0);

              return (
                <div className="col-lg-4 col-md-6" key={plan._id || index}>
                  <div className="card h-100 border rounded-3 shadow-xs overflow-hidden d-flex flex-column hover-shadow transition">
                    {/* Card Header Banner */}
                    <div
                      className="px-3 py-2 d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "#FDF8F9",
                        borderBottom: "1px solid #F1E5E8",
                      }}
                    >
                      {/* Role Pill */}
                      <span
                        className="badge px-2 py-1 rounded-pill fw-semibold"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          fontSize: "11px",
                        }}
                      >
                        {badge.icon} {roleType}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`badge rounded-pill px-2 py-0.5 ${
                          plan.status === "Active"
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        {plan.status === "Active" ? "● Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="card-body p-3 d-flex flex-column flex-grow-1">
                      {/* Plan Name & Pricing */}
                      <div className="mb-2.5">
                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "14.5px" }}>{plan.plan_name}</h6>
                        <div className="d-flex align-items-baseline gap-1.5 mt-1">
                          <span className="fw-bold mb-0" style={{ fontSize: "18px", color: "#7A0E2E" }}>
                            ₹{(parseFloat(plan.total_price) || finalPrice).toLocaleString("en-IN")}
                          </span>
                          <span className="badge bg-light text-muted border px-1.5 py-0.5" style={{ fontSize: "10px" }}>
                            Incl. 18% GST
                          </span>
                        </div>
                        {parseFloat(plan.plan_price) > 0 && (
                          <div className="text-muted mt-0.5" style={{ fontSize: "11px" }}>
                            Base: ₹{parseFloat(plan.plan_price).toLocaleString("en-IN")} + GST (18%): ₹{(parseFloat(plan.gst_amount) || (parseFloat(plan.plan_price) * 0.18)).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Validity & Units Badges */}
                      <div className="d-flex flex-wrap gap-1.5 mb-2.5">
                        <span className="badge bg-light text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
                          <FontAwesomeIcon icon={faClock} className="text-muted me-1" />
                          {plan.validity} {plan.validity_unit}
                        </span>

                        {roleType === "Buyer / Tenant" && (
                          <span className="badge bg-light text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
                            <FontAwesomeIcon icon={faBoxes} className="text-muted me-1" />
                            {plan.contact_unlocks || plan.no_of_units} Contacts
                          </span>
                        )}

                        {roleType === "Property Owner" && (
                          <>
                            <span className="badge bg-light text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
                              <FontAwesomeIcon icon={faBoxes} className="text-muted me-1" />
                              {plan.no_of_property_units || plan.no_of_units} Listing(s)
                            </span>
                            {(plan.featured_credits === "Yes" || parseInt(plan.featured_credits, 10) > 0) && (
                              <span className="badge bg-warning-subtle text-dark border border-warning px-2 py-1 rounded-2" style={{ fontSize: "11px" }}>
                                ⭐ Featured
                              </span>
                            )}
                            {(plan.advertising_credits === "Yes" || parseInt(plan.advertising_credits, 10) > 0) && (
                              <span className="badge bg-danger-subtle text-dark border border-danger px-1.5 py-0.5 rounded-2" style={{ fontSize: "10.5px" }}>
                                📢 Ads
                              </span>
                            )}
                          </>
                        )}

                        {roleType === "Builder / Developer" && (
                          <>
                            <span className="badge bg-light text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
                              <FontAwesomeIcon icon={faBoxes} className="text-muted me-1" />
                              {plan.no_of_project_units || plan.max_projects || plan.no_of_units} Project(s)
                            </span>
                            {plan.no_of_property_units && (
                              <span className="badge bg-light text-dark border px-2 py-1 rounded-2 d-flex align-items-center" style={{ fontSize: "11px" }}>
                                <FontAwesomeIcon icon={faBoxes} className="text-muted me-1" />
                                {plan.no_of_property_units} Listing(s)
                              </span>
                            )}
                            {(plan.top_developer === "Yes" || parseInt(plan.top_developer_credits, 10) > 0) && (
                              <span className="badge bg-warning-subtle text-dark border border-warning px-1.5 py-0.5 rounded-2" style={{ fontSize: "10.5px" }}>
                                🌟 Top Dev
                              </span>
                            )}
                            {(plan.upcoming_project === "Yes" || parseInt(plan.upcoming_project_credits, 10) > 0) && (
                              <span className="badge bg-info-subtle text-dark border border-info px-1.5 py-0.5 rounded-2" style={{ fontSize: "10.5px" }}>
                                🚀 Upcoming
                              </span>
                            )}
                            {(plan.featured_credits === "Yes" || parseInt(plan.featured_credits, 10) > 0) && (
                              <span className="badge bg-warning-subtle text-dark border border-warning px-1.5 py-0.5 rounded-2" style={{ fontSize: "10.5px" }}>
                                ⭐ Featured
                              </span>
                            )}
                            {(plan.advertising_credits === "Yes" || parseInt(plan.advertising_credits, 10) > 0) && (
                              <span className="badge bg-danger-subtle text-dark border border-danger px-1.5 py-0.5 rounded-2" style={{ fontSize: "10.5px" }}>
                                📢 Ads
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Description */}
                      {plan.description && (
                        <p className="text-muted mb-2 fst-italic" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                          "{plan.description}"
                        </p>
                      )}

                      {/* Dynamic Features List */}
                      <div className="border-top pt-2.5 mt-auto mb-2.5">
                        <div className="text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                          Included Features & Benefits ({featuresList.length})
                        </div>
                        <ul className="list-unstyled mb-0" style={{ fontSize: "11.5px" }}>
                          {featuresList.map((feat, i) => (
                            <li key={i} className="d-flex align-items-start mb-1.5 text-secondary">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-success me-1.5 mt-0.5 flex-shrink-0"
                                style={{ fontSize: "11.5px" }}
                              />
                              <span className="text-dark">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-end gap-1.5 pt-2 border-top mt-auto">
                        {can("plans", "edit") && (
                          <button
                            onClick={() => handleEdit(plan._id)}
                            className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: "11.5px" }}
                          >
                            <FontAwesomeIcon icon={faEdit} className="me-1" />
                            Edit
                          </button>
                        )}

                        {can("plans", "delete") && (
                          <button
                            className="btn btn-sm btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: "11.5px" }}
                            onClick={() => handleDelete(plan._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPurchase;
