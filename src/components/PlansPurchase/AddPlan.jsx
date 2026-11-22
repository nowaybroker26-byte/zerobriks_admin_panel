import { EP } from '../../Api/endpoints';
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimesCircle,
  faArrowLeft,
  faCheckCircle,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import {
  USER_ROLES,
  ROLE_FEATURES,
  calculateGstBreakdown,
} from "./planFeatureConfig";

const AddPlan = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("Buyer");

  const [plan, setPlan] = useState({
    plan_name: "BASIC",
    plan_image: null,
    plan_price: "999",
    gst_percentage: "18",
    gst_amount: "179.82",
    total_price: "1178.82",
    validity: "30",
    validity_unit: "Days",
    description: "Access verified properties and unlock direct owner contacts.",
    status: "Active",
  });

  const [featureValues, setFeatureValues] = useState(() => {
    const initial = {};
    (ROLE_FEATURES.Buyer || []).forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Price change handler
  const handlePriceChange = (e) => {
    const val = e.target.value;
    const calc = calculateGstBreakdown(val, 18);
    setPlan((prev) => ({
      ...prev,
      plan_price: val,
      gst_amount: calc.gstAmount,
      total_price: calc.totalPayable,
    }));
  };

  const handlePlanChange = (e) => {
    const { name, value } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Role change handler
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserType(newRole);

    let defaultPrice = "999";
    let defaultDesc = "Access verified properties and unlock direct owner contacts.";

    if (newRole === "Owner") {
      defaultPrice = "499";
      defaultDesc = "List active properties and receive direct buyer & tenant enquiries.";
    } else if (newRole === "Builder") {
      defaultPrice = "5999";
      defaultDesc = "Showcase development projects with verified RERA and buyer leads.";
    }

    const calc = calculateGstBreakdown(defaultPrice, 18);

    setPlan((prev) => ({
      ...prev,
      plan_price: defaultPrice,
      description: defaultDesc,
      gst_amount: calc.gstAmount,
      total_price: calc.totalPayable,
    }));

    const newFeatureState = {};
    (ROLE_FEATURES[newRole] || []).forEach((f) => {
      newFeatureState[f.key] = f.defaultValue;
    });
    setFeatureValues(newFeatureState);
  };

  const handleFeatureChange = (key, value) => {
    setFeatureValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlan((prev) => ({ ...prev, plan_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const currentDefs = ROLE_FEATURES[userType] || [];
    const enabledTitles = currentDefs
      .filter((f) => {
        const val = featureValues[f.key];
        return val !== "No" && val !== "0" && val !== 0;
      })
      .map((f) => f.title)
      .join(", ");

    const formData = new FormData();
    if (plan.plan_image) {
      formData.append("plan_image", plan.plan_image);
    }

    formData.append("plan_name", plan.plan_name);
    formData.append("user_type", userType);
    formData.append("category_type", userType);
    formData.append("features", enabledTitles);

    formData.append("plan_price", String(plan.plan_price));
    formData.append("gst_percentage", "18");
    formData.append("gst_amount", String(plan.gst_amount));
    formData.append("total_price", String(plan.total_price));
    formData.append("final_price", String(plan.total_price));
    formData.append("offer_percentage", "0");

    formData.append("validity", String(plan.validity));
    formData.append("validity_unit", plan.validity_unit);
    formData.append("description", plan.description);
    formData.append("status", plan.status);

    const mainUnits =
      userType === "Buyer"
        ? (featureValues.contact_unlocks || "15")
        : userType === "Owner"
        ? (featureValues.no_of_property_units || "1")
        : (featureValues.no_of_project_units || featureValues.no_of_property_units || "1");
    formData.append("no_of_units", String(mainUnits));

    Object.keys(featureValues).forEach((key) => {
      formData.append(key, String(featureValues[key]));
    });

    try {
      const response = await fetch(
        `${EP.API_ADD_PLAN}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("success", data.msg || "Plan created successfully!");
        navigate("/plans-purchase");
      } else {
        const err = await response.json();
        alert(`Failed to add plan: ${err.msg || "Server error"}`);
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Failed to connect to backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleFeatures = ROLE_FEATURES[userType] || [];
  const basePriceNum = parseFloat(plan.plan_price) || 0;
  const gstNum = parseFloat(plan.gst_amount) || 0;
  const totalNum = parseFloat(plan.total_price) || 0;

  return (
    <div className="container-fluid pt-2 px-3 pb-4" style={{ maxWidth: "1050px" }}>
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold text-dark mb-0">Add Subscription Plan</h5>
          <span className="text-muted" style={{ fontSize: "12px" }}>
            Configure plan details, pricing, and feature entitlements.
          </span>
        </div>
        <Link
          to="/plans-purchase"
          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
          style={{ fontSize: "12px" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
          Back to Plans
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ============================================================
            CARD 1: PLAN DETAILS & PRICING (COMPACT)
           ============================================================ */}
        <div className="card border rounded-3 shadow-xs mb-3 bg-white">
          <div className="card-body p-3">
            {/* Row 1: Target Role, Plan Name, Price, Validity */}
            <div className="row g-2 mb-2">
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-bold small mb-1 text-muted">
                  User Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-sm fw-bold"
                  value={userType}
                  onChange={handleRoleChange}
                >
                  {USER_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.emoji} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-bold small mb-1 text-muted">
                  Plan Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm fw-bold"
                  name="plan_name"
                  value={plan.plan_name}
                  onChange={handlePlanChange}
                  placeholder="e.g. BASIC, PLUS, MAX"
                  required
                />
              </div>

              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-bold small mb-1 text-muted">
                  Price (Excl. GST) <span className="text-danger">*</span>
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-control fw-bold"
                    value={plan.plan_price}
                    onChange={handlePriceChange}
                    placeholder="999"
                    required
                  />
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-bold small mb-1 text-muted">
                  Validity <span className="text-danger">*</span>
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type="number"
                    min="1"
                    className="form-control fw-bold"
                    name="validity"
                    value={plan.validity}
                    onChange={handlePlanChange}
                    placeholder="30"
                    required
                  />
                  <select
                    className="form-select fw-semibold"
                    name="validity_unit"
                    value={plan.validity_unit}
                    onChange={handlePlanChange}
                    style={{ maxWidth: "85px" }}
                  >
                    <option value="Days">Days</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: Compact GST Breakdown Bar */}
            <div
              className="p-2 px-3 rounded-2 mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
              style={{ backgroundColor: "#FBF7F8", border: "1px solid #F1E5E8", fontSize: "12.5px" }}
            >
              <div className="d-flex align-items-center gap-1 text-muted">
                <FontAwesomeIcon icon={faCalculator} style={{ color: "#780018" }} />
                <span className="fw-semibold">18% GST Breakdown:</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span>
                  Base: <strong className="text-dark">₹{basePriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-muted">+</span>
                <span>
                  GST (18%): <strong className="text-dark">₹{gstNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-muted">=</span>
                <span className="badge px-2.5 py-1.5" style={{ backgroundColor: "#780018", color: "#FFFFFF", fontSize: "12px" }}>
                  Total Payable: ₹{totalNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Row 3: Description, Image, Status */}
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-bold small mb-1 text-muted">Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="description"
                  value={plan.description}
                  onChange={handlePlanChange}
                  placeholder="Short summary of plan benefits..."
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1 text-muted">Card Image</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded border"
                      style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                  )}
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-bold small mb-1 text-muted">Status</label>
                <select
                  className="form-select form-select-sm fw-semibold"
                  name="status"
                  value={plan.status}
                  onChange={handlePlanChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            CARD 2: FEATURE RULES & LIMITS (COMPACT TABLE)
           ============================================================ */}
        <div className="card border rounded-3 shadow-xs mb-3 bg-white">
          <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark small">
              <FontAwesomeIcon icon={faCheckCircle} className="me-1 text-success" />
              Features & Limits for {userType === "Buyer" ? "Buyer / Tenant" : userType === "Owner" ? "Property Owner" : "Builder / Developer"}
            </span>
            <span className="badge bg-light text-muted border" style={{ fontSize: "11px" }}>
              {currentRoleFeatures.length} Rules
            </span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "12.5px" }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "65%" }} className="py-2 px-3 text-muted fw-semibold">Feature / Rule</th>
                    <th style={{ width: "35%" }} className="py-2 px-3 text-muted fw-semibold text-end">Value / Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRoleFeatures.map((f) => {
                    const currentVal = featureValues[f.key] ?? f.defaultValue;

                    return (
                      <tr key={f.key}>
                        {/* Title & Desc */}
                        <td className="py-2 px-3">
                          <span className="fw-semibold text-dark d-block">{f.title}</span>
                          <span className="text-muted" style={{ fontSize: "11px" }}>{f.desc}</span>
                        </td>

                        {/* Value Input / Dropdown */}
                        <td className="py-2 px-3 text-end">
                          {/* Numeric Unit limit */}
                          {f.type === "number" && (
                            <div className="input-group input-group-sm ms-auto" style={{ maxWidth: "140px" }}>
                              <input
                                type="number"
                                min="0"
                                className="form-control form-control-sm text-center fw-bold"
                                value={currentVal}
                                onChange={(e) => handleFeatureChange(f.key, e.target.value)}
                              />
                              <span className="input-group-text bg-light text-muted px-2" style={{ fontSize: "11px" }}>
                                {f.unit}
                              </span>
                            </div>
                          )}

                          {/* Enum Dropdown */}
                          {f.type === "select" && (
                            <select
                              className="form-select form-select-sm fw-bold ms-auto"
                              style={{
                                maxWidth: "130px",
                                fontSize: "12px",
                                borderColor: currentVal !== "No" ? "#780018" : "#ced4da",
                                color: currentVal !== "No" ? "#780018" : "#6c757d",
                              }}
                              value={currentVal}
                              onChange={(e) => handleFeatureChange(f.key, e.target.value)}
                            >
                              {f.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Boolean Yes / No */}
                          {f.type === "boolean" && (
                            <select
                              className="form-select form-select-sm fw-bold ms-auto text-center"
                              style={{
                                maxWidth: "90px",
                                fontSize: "12px",
                                backgroundColor: currentVal === "Yes" ? "#ECFDF5" : "#F9FAFB",
                                color: currentVal === "Yes" ? "#065F46" : "#6B7280",
                                borderColor: currentVal === "Yes" ? "#A7F3D0" : "#E5E7EB",
                              }}
                              value={currentVal}
                              onChange={(e) => handleFeatureChange(f.key, e.target.value)}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="d-flex justify-content-end align-items-center gap-2 pt-1">
          <Link
            to="/plans-purchase"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5"
            style={{ fontSize: "12.5px" }}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm text-white rounded-pill px-4 py-1.5 fw-bold shadow-xs"
            style={{ backgroundColor: "#780018", fontSize: "12.5px" }}
          >
            <FontAwesomeIcon icon={faSave} className="me-1.5" />
            {isSubmitting ? "Saving..." : "Save & Publish Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlan;
