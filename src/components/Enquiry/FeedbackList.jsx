import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faStar,
  faCommentDots,
  faBuilding,
  faSearch,
  faArrowLeft,
  faSyncAlt,
  faExclamationTriangle,
  faPhoneAlt,
  faFilter,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = highest rating first
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch feedbacks from API
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${EP.API_GET_FEEDBACKS}`
      );
      if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
        setFeedbacks(response.data.data);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      if (err.response && err.response.status === 204) {
        setFeedbacks([]);
      } else {
        setError("Failed to fetch customer feedbacks from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Compute average rating
  const averageRating = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((acc, curr) => {
      const r = Number(curr.rating) || 0;
      return acc + r;
    }, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  // Filtered & sorted feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((fb) => {
        // Rating filter
        const r = Number(fb.rating) || 0;
        if (ratingFilter === "5" && r !== 5) return false;
        if (ratingFilter === "4" && r !== 4) return false;
        if (ratingFilter === "below4" && r >= 4) return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          fb.name?.toLowerCase().includes(q) ||
          fb.email?.toLowerCase().includes(q) ||
          fb.contact_number?.toLowerCase().includes(q) ||
          fb.property_name?.toLowerCase().includes(q) ||
          fb.feedback_msg?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ratingA = Number(a.rating) || 0;
        const ratingB = Number(b.rating) || 0;
        return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
      });
  }, [feedbacks, searchQuery, ratingFilter, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage) || 1;
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFeedbacks, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Star render helper
  const renderStars = (rating) => {
    const num = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return (
      <div className="d-inline-flex align-items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            style={{
              color: i < num ? "#F59E0B" : "#CBD5E1",
              fontSize: "12px",
            }}
          />
        ))}
        <span
          className="ms-1.5 fw-bold"
          style={{ fontSize: "12px", color: num >= 4 ? "#85621e" : "#64748B" }}
        >
          {Number(rating || 0).toFixed(1)}
        </span>
      </div>
    );
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
                Quality & Reputation
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
                <FontAwesomeIcon icon={faCommentDots} />
              </span>
              Customer Feedbacks & Reviews
            </h3>
            <p className="text-muted small mb-0">
              Read customer reviews, satisfaction scores, and feedback submitted for property listings.
            </p>
          </div>

          {/* Action & Rating Summary */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 flex-wrap">
            {feedbacks.length > 0 && (
              <div
                className="px-3 py-1.5 rounded-pill border d-inline-flex align-items-center shadow-xs"
                style={{
                  backgroundColor: "rgba(166, 129, 57, 0.1)",
                  borderColor: "rgba(166, 129, 57, 0.25)",
                }}
              >
                <FontAwesomeIcon icon={faStar} className="me-1.5" style={{ color: "#F59E0B" }} />
                <span className="fw-bold me-1 text-dark" style={{ fontSize: "13px" }}>
                  {averageRating}
                </span>
                <span className="text-muted small">/ 5.0 Avg ({feedbacks.length})</span>
              </div>
            )}

            <button
              onClick={fetchFeedbacks}
              disabled={loading}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
              title="Refresh feedbacks"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`me-1.5 ${loading ? "fa-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="row g-3 align-items-center mb-4">
          {/* Search Input */}
          <div className="col-12 col-md-5">
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
                placeholder="Search by name, email, phone, property, review..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Quick Filter Pills & Sorting */}
          <div className="col-12 col-md-7 d-flex justify-content-md-end flex-wrap gap-1.5 align-items-center">
            <span className="text-muted small me-1 d-none d-lg-inline">
              <FontAwesomeIcon icon={faFilter} className="me-1 text-muted" /> Rating:
            </span>
            {[
              { id: "all", label: "All Reviews" },
              { id: "5", label: "5 ★ Only" },
              { id: "4", label: "4 ★ Only" },
              { id: "below4", label: "≤ 3 ★" },
            ].map((tab) => {
              const active = ratingFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRatingFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition ${
                    active ? "text-white shadow-xs" : "btn-light text-muted border"
                  }`}
                  style={{
                    backgroundColor: active ? "#7A0E2E" : "#F8FAFC",
                    borderColor: active ? "#7A0E2E" : "#E2E8F0",
                    fontSize: "12px",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold shadow-xs ms-md-2"
              style={{ borderColor: "#CBD5E1", fontSize: "12px" }}
              title="Toggle sort order"
            >
              Rating: {sortOrder === "desc" ? "Highest First ↓" : "Lowest First ↑"}
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Total Reviews: <strong className="text-dark">{feedbacks.length}</strong>
            {searchQuery || ratingFilter !== "all" ? (
              <span className="text-muted ms-2">
                (Showing <strong>{filteredFeedbacks.length}</strong> matching)
              </span>
            ) : null}
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
              <span className="visually-hidden">Loading feedbacks...</span>
            </div>
            <p className="text-muted mt-2 small">Loading feedback records...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredFeedbacks.length === 0 && (
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
              <FontAwesomeIcon icon={faStar} size="lg" style={{ color: "#A68139" }} />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {feedbacks.length === 0 ? "No Feedbacks Found" : "No Matching Reviews"}
            </h5>
            <p className="text-muted small mb-3">
              {feedbacks.length === 0
                ? "Reviews and feedbacks submitted by customers will appear here."
                : "Try adjusting your search query or rating filter."}
            </p>
            {searchQuery || ratingFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter("all");
                }}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={fetchFeedbacks}
                className="btn btn-sm text-white px-3.5 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Reload
              </button>
            )}
          </div>
        )}

        {/* Feedbacks Table */}
        {!loading && filteredFeedbacks.length > 0 && (
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
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon icon={faBuilding} className="me-1.5 text-muted" />
                    Property
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon icon={faStar} className="me-1.5 text-muted" />
                    Rating
                  </th>
                  <th style={{ minWidth: "280px" }} className="py-3">
                    <FontAwesomeIcon icon={faCommentDots} className="me-1.5 text-muted" />
                    Customer Feedback
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedFeedbacks.map((feedback, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={feedback._id || index}
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
                            {(feedback.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">
                              {feedback.name || "Anonymous Reviewer"}
                            </span>
                            {feedback.email && (
                              <a
                                href={`mailto:${feedback.email}`}
                                className="text-muted small text-decoration-none d-inline-flex align-items-center hover-underline"
                                style={{ fontSize: "12px" }}
                              >
                                <FontAwesomeIcon
                                  icon={faEnvelope}
                                  className="me-1 text-muted"
                                  size="xs"
                                />
                                {feedback.email}
                              </a>
                            )}
                            {feedback.contact_number && (
                              <a
                                href={`tel:${feedback.contact_number}`}
                                className="text-muted small text-decoration-none d-block hover-underline"
                                style={{ fontSize: "11px" }}
                              >
                                <FontAwesomeIcon
                                  icon={faPhoneAlt}
                                  className="me-1 text-muted"
                                  size="xs"
                                />
                                {feedback.contact_number}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Property Name */}
                      <td className="py-3">
                        {feedback.property_name && feedback.property_name !== "-" ? (
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold text-truncate d-inline-block"
                            style={{
                              backgroundColor: "rgba(122, 14, 46, 0.08)",
                              color: "#7A0E2E",
                              border: "1px solid rgba(122, 14, 46, 0.2)",
                              maxWidth: "200px",
                              fontSize: "12px",
                            }}
                            title={feedback.property_name}
                          >
                            <FontAwesomeIcon icon={faBuilding} className="me-1" size="xs" />
                            {feedback.property_name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border px-2 py-1">
                            General Platform
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3">
                        {renderStars(feedback.rating)}
                      </td>

                      {/* Message */}
                      <td className="py-3">
                        <div
                          className="p-2.5 rounded-3 bg-light border small text-dark position-relative"
                          style={{
                            maxWidth: "460px",
                            borderColor: "#E2E8F0",
                            lineHeight: "1.45",
                            wordBreak: "break-word",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faQuoteLeft}
                            className="me-1.5 opacity-25"
                            size="xs"
                            style={{ color: "#7A0E2E" }}
                          />
                          {feedback.feedback_msg || "No comments provided."}
                        </div>
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
                {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)}
              </strong>{" "}
              of <strong>{filteredFeedbacks.length}</strong> reviews
            </span>

            <nav aria-label="Feedback pagination">
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
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
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

export default FeedbackList;
