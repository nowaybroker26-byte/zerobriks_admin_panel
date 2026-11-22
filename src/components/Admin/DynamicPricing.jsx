import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faArrowLeft,
  faSave,
  faCoins,
  faCheckCircle,
  faExclamationTriangle,
  faTag,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { MyContext } from "../../App";

const DynamicPricing = () => {
  const { currentRole } = useContext(MyContext) || {};
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const backPath = isAdminPath ? "/admin/admin-settings" : "/admin-settings";

  const [keyId, setKeyId] = useState("");
  const [keys, setKeys] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch existing Dynamic Pricing Keys
  const fetchPricingKeys = () => {
    setLoading(true);
    fetch(`${EP.API_GET_DYNAMIC_PRICING_KEYS}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1 && data.data?.length > 0) {
          const keyData = data.data[0];
          setKeyId(keyData._id || "");
          setKeys(keyData.keys || "");
        }
      })
      .catch((err) => {
        console.error("Error fetching Dynamic Pricing Keys:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPricingKeys();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      keys,
      key_id: keyId,
    };

    fetch(
      `${EP.API_ADD_DYNAMIC_PRICING_KEYS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1 || data.status === "1") {
          setSuccessMessage("Dynamic pricing keys updated successfully!");
          fetchPricingKeys();
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setError(data.msg || "Failed to update pricing keys.");
        }
      })
      .catch((err) => {
        console.error("Error updating keys:", err);
        setError("Failed to update pricing keys from server.");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // Parsed tags preview
  const keyTags = useMemo(() => {
    if (!keys) return [];
    return keys
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }, [keys]);

  const canSave = currentRole?.isSuperAdmin ?? true;

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Alert Messages */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div className="flex-grow-1">{error}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <div className="flex-grow-1">{successMessage}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to={backPath}
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Settings Hub
              </Link>
              <span className="text-muted small">•</span>
              <span
                className="badge rounded-pill px-2.5 py-0.5 fw-bold text-uppercase"
                style={{
                  backgroundColor: "rgba(166, 129, 57, 0.12)",
                  color: "#85621e",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                Financial Engine
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(166, 129, 57, 0.15)",
                  color: "#85621e",
                }}
              >
                <FontAwesomeIcon icon={faCoins} />
              </span>
              Dynamic Pricing Keys
            </h3>
            <p className="text-muted small mb-0">
              Define comma-separated parameter keys used by the platform to calculate rule-based listing fees and multipliers.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchPricingKeys}
              disabled={loading}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              <FontAwesomeIcon icon={faSyncAlt} className={`me-1.5 ${loading ? "fa-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-3.5 rounded-3 border bg-light mb-4" style={{ borderColor: "#E2E8F0" }}>
            <label htmlFor="keys" className="form-label small fw-bold text-dark mb-1">
              <FontAwesomeIcon icon={faKey} className="me-1.5 text-muted" /> Configured Pricing Keys
            </label>
            <p className="text-muted small mb-3">
              Enter each dynamic pricing variable separated by a comma (e.g.{" "}
              <code>residential, commercial, verified_badge, instant_boost, premium_slot</code>).
            </p>

            <textarea
              id="keys"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
              className="form-control rounded-3 shadow-none"
              style={{
                borderColor: "#CBD5E1",
                fontSize: "14px",
                lineHeight: "1.6",
                minHeight: "130px",
              }}
              placeholder="Enter keys separated by commas..."
              required
            />
          </div>

          {/* Live Tag Preview */}
          <div className="mb-4">
            <span className="text-muted small fw-semibold text-uppercase d-block mb-2" style={{ fontSize: "11px" }}>
              <FontAwesomeIcon icon={faTag} className="me-1" /> Active Parsed Keys ({keyTags.length})
            </span>
            {keyTags.length > 0 ? (
              <div className="d-flex flex-wrap gap-1.5">
                {keyTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge rounded-pill px-3 py-1.5 fw-semibold border shadow-xs"
                    style={{
                      backgroundColor: "rgba(122, 14, 46, 0.08)",
                      color: "#7A0E2E",
                      borderColor: "rgba(122, 14, 46, 0.2)",
                      fontSize: "12px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted small fst-italic mb-0">
                No keys entered yet. Type comma-separated values above to see live tags.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {canSave && (
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Link
                to={backPath}
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold shadow-xs"
                style={{ borderColor: "#CBD5E1", color: "#334155" }}
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
                style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSave} className={`me-2 ${saving ? "fa-spin" : ""}`} />
                {saving ? "Saving Keys..." : keyId ? "Update Pricing Keys" : "Save Pricing Keys"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DynamicPricing;
