import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTag,
  faTimesCircle,
  faBuilding,
  faArrowLeft,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const AddAmenity = () => {
  const navigate = useNavigate();

  const [amenity, setAmenity] = useState({
    user_id: "ADMIN123",
    amenity_icon: "",
    amenity_name: "",
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmenity({
      ...amenity,
      [name]: value,
    });
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAmenity((prev) => ({ ...prev, amenity_icon: file }));
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", amenity.user_id);
    formData.append("amenity_icon", amenity.amenity_icon);
    formData.append("amenity_name", amenity.amenity_name);

    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/add_property_amenities`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        localStorage.setItem("success", "Amenity added successfully!");
        navigate("/amenities");
      } else {
        alert("Error while adding amenity!");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Failed to add the amenity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5">
      <div className="bg-white rounded-4 shadow-sm border p-4 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to="/amenities"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Amenities
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
                New Item
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <FontAwesomeIcon
                icon={faBuilding}
                className="me-2"
                style={{ color: "#7A0E2E" }}
              />
              Add Property Amenity
            </h3>
            <p className="text-muted small mb-0">
              Create a new amenity icon and name to enrich listings in Zerobriks.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Amenity Name */}
            <div className="col-md-6">
              <label htmlFor="amenity_name" className="form-label fw-bold small text-secondary">
                <FontAwesomeIcon icon={faTag} className="me-1.5" />
                Amenity Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control border-secondary-subtle py-2"
                id="amenity_name"
                name="amenity_name"
                placeholder="e.g. Swimming Pool, Gymnasium, Power Backup"
                value={amenity.amenity_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amenity Icon File */}
            <div className="col-md-6">
              <label htmlFor="amenity_icon" className="form-label fw-bold small text-secondary">
                <FontAwesomeIcon icon={faImage} className="me-1.5" />
                Amenity Icon / Image <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                className="form-control border-secondary-subtle py-2"
                id="amenity_icon"
                name="amenity_icon"
                accept="image/*"
                onChange={handleIconChange}
                required
              />
            </div>

            {/* Preview Box */}
            {iconPreview && (
              <div className="col-12">
                <div
                  className="p-3 rounded-3 border d-inline-flex align-items-center gap-3"
                  style={{ backgroundColor: "#F8FAFC" }}
                >
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="rounded-3 border object-contain p-1"
                    style={{ width: "60px", height: "60px", backgroundColor: "#FFFFFF" }}
                  />
                  <div>
                    <span className="text-muted small d-block">Selected Icon Preview:</span>
                    <strong className="text-dark">{amenity.amenity_name || "Amenity Icon"}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-4 border-top mt-4">
            <button
              onClick={() => navigate("/amenities")}
              type="button"
              className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="me-1.5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faSave} className="me-1.5" />
              {submitting ? "Saving..." : "Save Amenity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAmenity;
