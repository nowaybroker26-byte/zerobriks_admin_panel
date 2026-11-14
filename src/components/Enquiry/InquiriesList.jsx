import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhoneAlt,
  faEnvelope,
  faCommentDots,
  faClock,
  faHouseUser,
  faSearch,
  faArrowLeft,
  faSyncAlt,
  faExternalLinkAlt,
  faExclamationTriangle,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      let data = [];
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_enquiry`,
          { page: "1", page_size: "100" }
        );
        if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
      } catch (postErr) {
        console.warn("POST /cust_api/get_property_enquiry error, trying GET fallback:", postErr);
      }

      // If no data returned, fallback to GET /api/get_property_enquiry
      if (!data || data.length === 0) {
        try {
          const fallbackRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/get_property_enquiry`
          );
          if (fallbackRes.data && Array.isArray(fallbackRes.data.data)) {
            data = fallbackRes.data.data;
          }
        } catch (getErr) {
          console.warn("GET /api/get_property_enquiry fallback error:", getErr);
        }
      }

      setInquiries(data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      if (err.response) {
        setError(`Error: ${err.response.data?.msg || "Failed to fetch inquiries"}`);
      } else if (err.request) {
        setError("No response from server. Please verify backend connection.");
      } else {
        setError("An error occurred while loading inquiries.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return String(dateString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateString);
    }
  };

  // Copy property ID
  const handleCopyId = (propertyId) => {
    if (!propertyId) return;
    navigator.clipboard.writeText(String(propertyId));
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewClick = (property_id) => {
    if (!property_id) return;
    navigate(`/property-details/${property_id}`);
  };

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return inquiries;
    const q = searchQuery.toLowerCase();
    return inquiries.filter((inquiry) => {
      return (
        inquiry.name?.toLowerCase().includes(q) ||
        inquiry.contact_number?.toLowerCase().includes(q) ||
        inquiry.email?.toLowerCase().includes(q) ||
        inquiry.message?.toLowerCase().includes(q) ||
        String(inquiry.property_id || "").toLowerCase().includes(q)
      );
    });
  }, [inquiries, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage) || 1;
  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInquiries, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Error Alert */}
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
            onClick={() => setError("")}
            aria-label="Close"
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
                Lead Capture & Inquiries
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
                <FontAwesomeIcon icon={faHouseUser} />
              </span>
              Property Inquiries
            </h3>
            <p className="text-muted small mb-0">
              Manage prospective buyer & tenant inquiries submitted across listed properties.
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
              onClick={fetchInquiries}
              disabled={loading}
              className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition d-inline-flex align-items-center"
              style={{
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`me-1.5 ${loading ? "fa-spin" : ""}`}
              />
              Refresh Inquiries
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="row g-3 align-items-center mb-4">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="input-group">
              <span
                className="input-group-text bg-white border-end-0 text-muted"
                style={{ borderColor: "#E2E8F0" }}
              >
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                style={{ borderColor: "#E2E8F0", fontSize: "14px" }}
                placeholder="Search by name, phone, email, message, property ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-7 d-flex justify-content-md-end">
            <span className="text-muted small fw-semibold">
              Total Inquiries: <strong className="text-dark">{inquiries.length}</strong>
              {searchQuery ? (
                <span className="text-muted ms-2">
                  (Showing <strong>{filteredInquiries.length}</strong> matching)
                </span>
              ) : null}
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading inquiries...</span>
            </div>
            <p className="text-muted mt-2 small">Loading inquiries list...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInquiries.length === 0 && (
          <div className="text-center py-5 border rounded-4 bg-light my-2">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(122, 14, 46, 0.08)",
                color: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faHouseUser} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {inquiries.length === 0 ? "No Inquiries Found" : "No Matching Inquiries"}
            </h5>
            <p className="text-muted small mb-3">
              {inquiries.length === 0
                ? "Customer inquiries submitted for your properties will appear here."
                : "Try adjusting your search terms to find what you are looking for."}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={fetchInquiries}
                className="btn btn-sm text-white px-3.5 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Reload
              </button>
            )}
          </div>
        )}

        {/* Inquiries Table */}
        {!loading && filteredInquiries.length > 0 && (
          <div className="table-responsive rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
            <table className="table table-hover align-middle mb-0">
              <thead
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottom: "2px solid #E2E8F0",
                }}
              >
                <tr
                  className="text-muted small text-uppercase fw-bold"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  <th style={{ width: "45px" }} className="py-3 px-3 text-center">
                    #
                  </th>
                  <th style={{ minWidth: "190px" }} className="py-3">
                    <FontAwesomeIcon icon={faUser} className="me-1.5 text-muted" />
                    User Details
                  </th>
                  <th style={{ minWidth: "180px" }} className="py-3">
                    <FontAwesomeIcon icon={faPhoneAlt} className="me-1.5 text-muted" />
                    Contact Info
                  </th>
                  <th style={{ minWidth: "260px" }} className="py-3">
                    <FontAwesomeIcon icon={faCommentDots} className="me-1.5 text-muted" />
                    Message
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon icon={faClock} className="me-1.5 text-muted" />
                    Date & Time
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3 text-center">
                    Inquiry For
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInquiries.map((inquiry, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const isCopied = copiedId === inquiry.property_id;

                  return (
                    <tr
                      key={inquiry._id || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {rowNumber}
                      </td>

                      {/* User Info */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold flex-shrink-0"
                            style={{
                              width: "34px",
                              height: "34px",
                              backgroundColor: "#7A0E2E",
                              fontSize: "13px",
                            }}
                          >
                            {(inquiry.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">
                              {inquiry.name || "Anonymous User"}
                            </span>
                            {inquiry.email && (
                              <a
                                href={`mailto:${inquiry.email}`}
                                className="text-muted small text-decoration-none d-inline-flex align-items-center hover-underline"
                                title="Send Email"
                              >
                                <FontAwesomeIcon icon={faEnvelope} className="me-1 text-muted" size="xs" />
                                {inquiry.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Number */}
                      <td className="py-3">
                        {inquiry.contact_number ? (
                          <a
                            href={`tel:${inquiry.contact_number}`}
                            className="badge rounded-pill px-2.5 py-1.5 fw-semibold text-decoration-none d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "rgba(166, 129, 57, 0.12)",
                              color: "#85621e",
                              border: "1px solid rgba(166, 129, 57, 0.25)",
                              fontSize: "12px",
                            }}
                            title="Call user"
                          >
                            <FontAwesomeIcon icon={faPhoneAlt} className="me-1.5" size="xs" />
                            {inquiry.contact_number}
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="py-3">
                        <div
                          className="p-2 rounded-2 border bg-light text-dark small"
                          style={{
                            maxWidth: "380px",
                            borderColor: "#E2E8F0",
                            lineHeight: "1.45",
                            wordBreak: "break-word",
                          }}
                        >
                          {inquiry.message || "No specific message provided."}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 text-muted small">
                        {formatDate(inquiry.time_date)}
                      </td>

                      {/* Inquiry For / Details Action */}
                      <td className="py-3 text-center">
                        {inquiry.property_id ? (
                          <div className="d-flex flex-column align-items-center gap-1.5">
                            <button
                              onClick={() => handleViewClick(inquiry.property_id)}
                              className="btn btn-sm text-white px-3 py-1.5 rounded-pill fw-semibold shadow-xs transition d-inline-flex align-items-center"
                              style={{
                                backgroundColor: "#7A0E2E",
                                borderColor: "#7A0E2E",
                                fontSize: "12px",
                              }}
                              title="View Property Details"
                            >
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1.5" size="xs" />
                              View Property
                            </button>

                            <button
                              onClick={() => handleCopyId(inquiry.property_id)}
                              className="btn btn-link p-0 text-muted small text-decoration-none d-inline-flex align-items-center"
                              style={{ fontSize: "11px" }}
                              title="Copy Property ID"
                            >
                              <FontAwesomeIcon
                                icon={isCopied ? faCheck : faCopy}
                                className={`me-1 ${isCopied ? "text-success" : ""}`}
                              />
                              {isCopied ? "Copied" : `#${String(inquiry.property_id).slice(-6)}`}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">General Inquiry</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top">
            <span className="text-muted small">
              Showing{" "}
              <strong>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredInquiries.length)}
              </strong>{" "}
              of <strong>{filteredInquiries.length}</strong> inquiries
            </span>

            <nav aria-label="Inquiry pagination">
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link rounded-pill px-3"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: currentPage === page ? "#7A0E2E" : undefined,
                        borderColor: currentPage === page ? "#7A0E2E" : undefined,
                      }}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link rounded-pill px-3"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiriesList;
