import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faBuilding,
  faArrowLeft,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [success, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const msg = localStorage.getItem("success");
    if (msg) {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(""), 3000);
      localStorage.removeItem("success");
    }
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    setErrors("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_amenities`
      );
      if (response.data && response.data.data) {
        setAmenities(response.data.data);
      } else {
        setAmenities([]);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      setErrors("Failed to fetch amenities from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (property_amenity_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this amenity?"
    );
    if (!confirmDelete) return;

    try {
      setErrors("");
      setSuccessMessage("");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/remove_property_amenity`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ property_amenity_id }),
        }
      );

      const data = await response.json();
      if (data.status === 1) {
        setAmenities((prevAmenities) =>
          prevAmenities.filter((amenity) => amenity._id !== property_amenity_id)
        );
        setSuccessMessage("Amenity deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert("Error while deleting amenity: " + data.msg);
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
      setErrors("Error deleting amenity. Please try again.");
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5">
      {/* Toast / Alert Messages */}
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm border-0 d-flex align-items-center mb-3"
          role="alert"
          style={{ backgroundColor: "#ECFDF5", color: "#065F46" }}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
          <span>{success}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {errors && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm border-0 d-flex align-items-center mb-3"
          role="alert"
          style={{ backgroundColor: "#FDF2F2", color: "#991B1B" }}
        >
          <span>{errors}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setErrors("")}
          ></button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to="/properties"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Properties
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
                Catalog Management
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <FontAwesomeIcon
                icon={faBuilding}
                className="me-2"
                style={{ color: "#7A0E2E" }}
              />
              Property Amenities
            </h3>
            <p className="text-muted small mb-0">
              Manage standard and premium amenities that property owners and developers can attach to listings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={() => navigate("/properties")}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              View Inventory
            </button>

            <button
              onClick={() => navigate("/add-amenity")}
              className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition"
              style={{
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1.5" />
              Add Amenity
            </button>
          </div>
        </div>

        {/* Counter Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Total Amenities: <strong className="text-dark">{amenities.length}</strong>
          </span>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading amenities...</span>
            </div>
            <p className="text-muted mt-2 small">Loading amenity catalog...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && amenities.length === 0 && (
          <div className="text-center py-5 border rounded-4 bg-light my-3">
            <div className="display-6 mb-2">✨</div>
            <h5 className="fw-bold text-dark mb-1">No Amenities Found</h5>
            <p className="text-muted small mb-3">
              You haven't added any property amenities yet.
            </p>
            <button
              onClick={() => navigate("/add-amenity")}
              className="btn btn-sm text-white px-3 py-1.5 rounded-pill fw-semibold"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add First Amenity
            </button>
          </div>
        )}

        {/* Amenities Grid */}
        {!loading && amenities.length > 0 && (
          <div className="row g-3">
            {amenities.map((amenity, index) => {
              const iconUrl = amenity.amenity_icon
                ? amenity.amenity_icon.startsWith("http")
                  ? amenity.amenity_icon
                  : `${process.env.REACT_APP_API_BASE_URL}${amenity.amenity_icon}`
                : null;

              return (
                <div key={amenity._id || index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div className="card h-100 border rounded-3 shadow-xs hover-shadow transition-all bg-white position-relative overflow-hidden text-center p-3">
                    {/* Delete Icon Button */}
                    <button
                      onClick={() => handleDelete(amenity._id)}
                      className="btn btn-sm btn-light border position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center text-muted hover-danger"
                      style={{ width: "26px", height: "26px" }}
                      title="Delete Amenity"
                    >
                      <FontAwesomeIcon icon={faTrash} size="xs" style={{ fontSize: "11px" }} />
                    </button>

                    {/* Amenity Icon */}
                    <div
                      className="rounded-3 mx-auto d-flex align-items-center justify-content-center mb-2 overflow-hidden border"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={amenity.amenity_name}
                          className="w-100 h-100 object-contain p-2"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="text-muted"
                          style={{ fontSize: "24px" }}
                        />
                      )}
                    </div>

                    {/* Amenity Name */}
                    <h6
                      className="fw-bold text-dark mb-0 small text-truncate"
                      title={amenity.amenity_name}
                    >
                      {amenity.amenity_name}
                    </h6>
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

export default Amenities;
