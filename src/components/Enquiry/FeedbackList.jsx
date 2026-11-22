import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faStar,
  faCommentDots,
  faBuilding,
  faSearch,
  faSyncAlt,
  faExclamationTriangle,
  faPhoneAlt,
  faQuoteLeft,
  faTimes,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = highest rating first
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        const q = searchQuery.toLowerCase().trim();
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ratingFilter, sortOrder, pageSize]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize));
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFeedbacks.slice(startIndex, startIndex + pageSize);
  }, [filteredFeedbacks, currentPage, pageSize]);

  // Star render helper
  const renderStars = (rating) => {
    const num = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return (
      <div className="inline-flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              style={{
                color: i < num ? "#F59E0B" : "#CBD5E1",
                fontSize: "11px",
              }}
            />
          ))}
        </div>
        <span
          className="font-bold text-xs ms-1"
          style={{ color: num >= 4 ? "#85621e" : "#64748B" }}
        >
          {Number(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6" style={{ minHeight: "100vh" }}>
      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm rounded-xl mb-3 d-flex align-items-center text-sm"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div className="flex-grow-1">{error}</div>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* ================================================================
            PAGE HEADER (Compact, Sleek, Professional)
        ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon
                icon={faCommentDots}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Customer Feedbacks & Reviews
                </h2>
                <span
                  className="badge rounded-pill fw-semibold"
                  style={{
                    backgroundColor: "rgba(122, 14, 46, 0.08)",
                    color: "#7A0E2E",
                    fontSize: "11.5px",
                    padding: "3px 8px",
                  }}
                >
                  {feedbacks.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Read customer reviews, satisfaction scores, and feedback submitted for property listings
              </p>
            </div>
          </div>

          {/* Action & Rating Summary (Compact & Clean) */}
          <div className="flex items-center gap-2 flex-wrap">
            {feedbacks.length > 0 && (
              <div
                className="px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 shadow-xs"
                style={{
                  height: "36px",
                  backgroundColor: "rgba(166, 129, 57, 0.08)",
                  borderColor: "rgba(166, 129, 57, 0.25)",
                }}
              >
                <FontAwesomeIcon icon={faStar} style={{ color: "#F59E0B", fontSize: "12px" }} />
                <span className="font-bold text-gray-900 text-xs">
                  {averageRating}
                </span>
                <span className="text-gray-500 text-[11.5px]">/ 5.0 Avg ({feedbacks.length})</span>
              </div>
            )}

            <button
              onClick={fetchFeedbacks}
              disabled={loading}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
              style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
              title="Refresh feedbacks"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`text-xs ${loading ? "fa-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Scoped CSS for scrollbar hiding */}
        <style>{`
          .filter-horizontal-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .filter-horizontal-scroll {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>

        {/* ================================================================
            SLEEK SINGLE-ROW HORIZONTAL FILTER TOOLBAR
        ================================================================= */}
        <div
          className="p-2.5 rounded-xl mb-3 border bg-gray-50/80 shadow-xs mt-3"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div
            className="flex flex-nowrap items-center gap-2 overflow-x-auto filter-horizontal-scroll"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Search Input */}
            <div className="relative" style={{ flex: "1 1 260px", minWidth: "180px" }}>
              <FontAwesomeIcon
                icon={faSearch}
                className="text-gray-400 text-xs absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, property, review..."
                className="form-control form-control-sm bg-white border-secondary-subtle ps-4 pe-4 text-gray-800"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                  paddingLeft: "32px",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                  style={{ textDecoration: "none" }}
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              )}
            </div>

            {/* Rating Filter Dropdown */}
            <div style={{ flex: "0 1 140px", minWidth: "120px" }}>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 ★ Only</option>
                <option value="4">4 ★ Only</option>
                <option value="below4">≤ 3 ★ Only</option>
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div style={{ flex: "0 1 165px", minWidth: "145px" }}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value="desc">Rating: High to Low ↓</option>
                <option value="asc">Rating: Low to High ↑</option>
              </select>
            </div>

            {/* Page Size Dropdown */}
            <div style={{ flex: "0 1 110px", minWidth: "95px" }}>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            {/* Counter Badge */}
            <div className="text-xs text-gray-500 font-medium px-1 flex-shrink-0">
              Showing <strong className="text-gray-900">{filteredFeedbacks.length}</strong> of{" "}
              <strong className="text-gray-900">{feedbacks.length}</strong>
            </div>

            {/* Reset Button */}
            {(searchQuery || ratingFilter !== "all" || sortOrder !== "desc") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter("all");
                  setSortOrder("desc");
                }}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex-shrink-0"
                style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
                title="Reset Filters"
              >
                <FontAwesomeIcon icon={faUndo} className="text-xs" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================
            FEEDBACKS DATA TABLE (With In-Table Loader & Empty State)
        ================================================================= */}
        <div className="overflow-x-auto mt-3">
          <table
            className="table table-hover align-middle border-separate border-spacing-0 w-full"
            style={{ borderRadius: "10px", overflow: "hidden" }}
          >
            <thead>
              <tr>
                <th
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", width: "45px" }}
                >
                  #
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "190px" }}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 text-amber-300" />
                  User Details
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "170px" }}
                >
                  <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-amber-300" />
                  Property
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  <FontAwesomeIcon icon={faStar} className="mr-1.5 text-amber-300" />
                  Rating
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "300px" }}
                >
                  <FontAwesomeIcon icon={faCommentDots} className="mr-1.5 text-amber-300" />
                  Customer Feedback
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2.2rem", height: "2.2rem" }}
                    >
                      <span className="visually-hidden">Loading feedbacks...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading feedback records...
                    </p>
                  </td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: "rgba(122, 14, 46, 0.08)",
                        color: "#7A0E2E",
                      }}
                    >
                      <FontAwesomeIcon icon={faStar} className="text-base" style={{ color: "#A68139" }} />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {feedbacks.length === 0 ? "No Feedbacks Found" : "No Matching Reviews Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
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
                        className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={fetchFeedbacks}
                        className="btn btn-sm text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                        style={{ backgroundColor: "#7A0E2E" }}
                      >
                        <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                        Reload
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedFeedbacks.map((feedback, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={feedback._id || index}
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs select-none"
                            style={{ backgroundColor: "#7A0E2E" }}
                          >
                            {(feedback.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {feedback.name || "Anonymous Reviewer"}
                            </span>
                            {feedback.email && (
                              <a
                                href={`mailto:${feedback.email}`}
                                className="text-gray-500 text-[11px] hover:text-[#7A0E2E] transition-colors inline-flex items-center gap-1"
                              >
                                <FontAwesomeIcon
                                  icon={faEnvelope}
                                  className="text-[10px]"
                                />
                                <span>{feedback.email}</span>
                              </a>
                            )}
                            {feedback.contact_number && (
                              <a
                                href={`tel:${feedback.contact_number}`}
                                className="text-gray-500 text-[11px] block hover:text-[#7A0E2E] transition-colors"
                              >
                                <FontAwesomeIcon
                                  icon={faPhoneAlt}
                                  className="text-[10px] me-1"
                                />
                                <span>{feedback.contact_number}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Property Name */}
                      <td className="py-3 px-3">
                        {feedback.property_name && feedback.property_name !== "-" ? (
                          <span
                            className="badge rounded-pill px-2.5 py-1 font-semibold text-truncate inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(122, 14, 46, 0.08)",
                              color: "#7A0E2E",
                              border: "1px solid rgba(122, 14, 46, 0.2)",
                              maxWidth: "200px",
                              fontSize: "11.5px",
                            }}
                            title={feedback.property_name}
                          >
                            <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
                            <span className="truncate">{feedback.property_name}</span>
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 text-[11px]">
                            General Platform
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3">
                        {renderStars(feedback.rating)}
                      </td>

                      {/* Message */}
                      <td className="py-3 px-3">
                        <div
                          className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 relative"
                          style={{
                            maxWidth: "460px",
                            lineHeight: "1.45",
                            wordBreak: "break-word",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faQuoteLeft}
                            className="mr-1.5 opacity-30 text-[#7A0E2E]"
                            size="xs"
                          />
                          <span>{feedback.feedback_msg || "No comments provided."}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================================================================
            PAGINATION SECTION
        ================================================================= */}
        {!loading && filteredFeedbacks.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredFeedbacks.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900">{filteredFeedbacks.length}</strong>{" "}
              reviews
            </div>

            <div className="flex items-center gap-2">
              <nav aria-label="Feedback pagination">
                <ul className="pagination pagination-sm mb-0 gap-1 align-items-center flex-wrap">
                  {/* First */}
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="First Page"
                    >
                      « First
                    </button>
                  </li>

                  {/* Prev */}
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      title="Previous Page"
                    >
                      ‹ Prev
                    </button>
                  </li>

                  {/* Numeric Page Buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 2
                      );
                    })
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const isActive = currentPage === pageNum;
                      return (
                        <React.Fragment key={pageNum}>
                          {prev && pageNum - prev > 1 && (
                            <li className="page-item disabled px-1 text-muted small">...</li>
                          )}
                          <li className={`page-item ${isActive ? "active" : ""}`}>
                            <button
                              className="page-link rounded-2 fw-bold text-xs d-flex align-items-center justify-content-center shadow-xs"
                              style={{
                                minWidth: "30px",
                                height: "30px",
                                backgroundColor: isActive ? "#7A0E2E" : undefined,
                                borderColor: isActive ? "#7A0E2E" : undefined,
                                color: isActive ? "#FFFFFF" : undefined,
                              }}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    })}

                  {/* Next */}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      title="Next Page"
                    >
                      Next ›
                    </button>
                  </li>

                  {/* Last */}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last Page"
                    >
                      Last »
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
