import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faCalendarAlt,
  faClock,
  faUser,
  faPhoneAlt,
  faEnvelope,
  faBuilding,
  faMapMarkerAlt,
  faSearch,
  faSyncAlt,
  faArrowLeft,
  faExclamationTriangle,
  faFilter,
  faPhoneVolume,
  faCity,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

const AllSchedules = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'Property', 'Project'
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    page_size: 10,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  // Helper to truncate text safely
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "—";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Fetch schedules from API
  const fetchSchedules = async (page = 1, pageSize = pagination.page_size) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${EP.CUST_API_GET_VIRTUAL_TOUR_SCHEDULE}`,
        { page: page.toString(), page_size: pageSize.toString() }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setAllSchedules(response.data.data);
        setPagination({
          current_page: Number(response.data.current_page) || page,
          total_pages: Number(response.data.total_pages) || 1,
          total_count: Number(response.data.total_count) || response.data.data.length,
          page_size: Number(response.data.page_size) || pageSize,
        });
      } else {
        setAllSchedules([]);
      }
    } catch (err) {
      console.error("Error fetching virtual tour schedules:", err);
      setAllSchedules([]);
      setError("No virtual tours scheduled yet or failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(pagination.current_page, pagination.page_size);
  }, []);

  const handleTabChange = (tab) => {
    const prefix = isAdminPath ? "/admin" : "";
    navigate(tab === "all" ? `${prefix}/virtual-tour-all` : `${prefix}/virtual-tour-my`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchSchedules(newPage, pagination.page_size);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPagination((prev) => ({ ...prev, page_size: newSize }));
    fetchSchedules(1, newSize);
  };

  // Filtered schedules for client-side search across current dataset
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter((item) => {
      // Type filter
      if (typeFilter !== "all") {
        if (typeFilter === "Property" && item.tour_type !== "Property") return false;
        if (typeFilter === "Project" && item.tour_type !== "Project") return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const user = item.user_details || {};
      const owner = item.property_owner_details || {};
      const prop = item.property_details || {};
      const proj = item.project_details || {};

      return (
        user.full_name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.mobile_number?.toLowerCase().includes(q) ||
        owner.full_name?.toLowerCase().includes(q) ||
        owner.email?.toLowerCase().includes(q) ||
        owner.mobile_number?.toLowerCase().includes(q) ||
        prop.property_name?.toLowerCase().includes(q) ||
        prop.city_name?.toLowerCase().includes(q) ||
        proj.project_name?.toLowerCase().includes(q) ||
        proj.city_name?.toLowerCase().includes(q) ||
        item.schedule_date?.toLowerCase().includes(q) ||
        item.timeslot?.toLowerCase().includes(q)
      );
    });
  }, [allSchedules, searchQuery, typeFilter]);

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
                Engagement & Live Tours
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
                <FontAwesomeIcon icon={faVideo} />
              </span>
              Virtual Tours Scheduled
            </h3>
            <p className="text-muted small mb-0">
              Track live walkthrough appointments scheduled between clients and property owners/builders.
            </p>
          </div>

          {/* Action & Tab Navigation */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 flex-wrap">
            <div
              className="p-1 rounded-pill border d-inline-flex align-items-center bg-light"
              style={{ borderColor: "#E2E8F0" }}
            >
              <button
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold shadow-xs text-white"
                style={{
                  backgroundColor: "#7A0E2E",
                  borderColor: "#7A0E2E",
                  fontSize: "12px",
                }}
                onClick={() => handleTabChange("all")}
              >
                All Schedules
              </button>
              <button
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold text-muted"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "12px",
                }}
                onClick={() => handleTabChange("my")}
              >
                My Schedules
              </button>
            </div>

            <button
              onClick={() => fetchSchedules(pagination.current_page, pagination.page_size)}
              disabled={loading}
              className="btn btn-outline-secondary px-3 py-1.5 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155", fontSize: "13px" }}
              title="Refresh schedule list"
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
                placeholder="Search by client, owner, property, city, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="col-12 col-md-7 d-flex justify-content-md-end flex-wrap gap-1.5 align-items-center">
            <span className="text-muted small me-1 d-none d-lg-inline">
              <FontAwesomeIcon icon={faFilter} className="me-1 text-muted" /> Filter Type:
            </span>
            {[
              { id: "all", label: "All Tours" },
              { id: "Property", label: "Properties" },
              { id: "Project", label: "Projects" },
            ].map((tab) => {
              const active = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
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

            {/* Page Size Select */}
            <div className="ms-md-2 d-flex align-items-center gap-1">
              <span className="text-muted small">Show:</span>
              <select
                className="form-select form-select-sm rounded-pill shadow-none"
                style={{ width: "75px", borderColor: "#E2E8F0", fontSize: "12px" }}
                value={pagination.page_size}
                onChange={handlePageSizeChange}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Total Bookings: <strong className="text-dark">{pagination.total_count}</strong>
            {searchQuery || typeFilter !== "all" ? (
              <span className="text-muted ms-2">
                (Showing <strong>{filteredSchedules.length}</strong> matching current page)
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
              <span className="visually-hidden">Loading tour schedules...</span>
            </div>
            <p className="text-muted mt-2 small">Loading appointment records...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSchedules.length === 0 && (
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
              <FontAwesomeIcon icon={faVideo} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {allSchedules.length === 0 ? "No Virtual Tours Scheduled" : "No Matching Appointments"}
            </h5>
            <p className="text-muted small mb-3">
              {allSchedules.length === 0
                ? "Live walkthrough tour requests scheduled by users will appear here."
                : "Try adjusting your search query or tour type filter."}
            </p>
            {searchQuery || typeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => fetchSchedules(1, pagination.page_size)}
                className="btn btn-sm text-white px-3.5 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Reload
              </button>
            )}
          </div>
        )}

        {/* Schedules Table */}
        {!loading && filteredSchedules.length > 0 && (
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
                  <th style={{ minWidth: "180px" }} className="py-3">
                    <FontAwesomeIcon icon={faUser} className="me-1.5 text-muted" />
                    Scheduled By
                  </th>
                  <th style={{ minWidth: "180px" }} className="py-3">
                    <FontAwesomeIcon icon={faUser} className="me-1.5 text-muted" />
                    Scheduled With
                  </th>
                  <th style={{ minWidth: "220px" }} className="py-3">
                    <FontAwesomeIcon icon={faBuilding} className="me-1.5 text-muted" />
                    Property / Project
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon icon={faClock} className="me-1.5 text-muted" />
                    Appointment Time
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon icon={faPhoneVolume} className="me-1.5 text-muted" />
                    Call Sessions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule, index) => {
                  const rowNumber =
                    (pagination.current_page - 1) * pagination.page_size + index + 1;
                  const isProject = schedule.tour_type === "Project";
                  const entity = isProject
                    ? schedule.project_details
                    : schedule.property_details;

                  const hasSessions =
                    Array.isArray(schedule.call_sessions) &&
                    schedule.call_sessions.length > 0;

                  return (
                    <tr
                      key={schedule._id || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {rowNumber}
                      </td>

                      {/* Scheduled By (Client) */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold flex-shrink-0"
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: "#7A0E2E",
                              fontSize: "12px",
                            }}
                          >
                            {(schedule.user_details?.full_name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "13px" }}>
                              {schedule.user_details?.full_name || "N/A"}
                            </span>
                            {schedule.user_details?.mobile_number && (
                              <a
                                href={`tel:${schedule.user_details.mobile_number}`}
                                className="text-muted small text-decoration-none d-inline-flex align-items-center hover-underline"
                                style={{ fontSize: "12px" }}
                              >
                                <FontAwesomeIcon icon={faPhoneAlt} className="me-1 text-muted" size="xs" />
                                {schedule.user_details.mobile_number}
                              </a>
                            )}
                            {schedule.user_details?.email && (
                              <div className="text-muted small" style={{ fontSize: "11px" }}>
                                {truncateText(schedule.user_details.email, 24)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Scheduled With (Owner / Builder) */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 text-dark fw-bold flex-shrink-0"
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: "rgba(166, 129, 57, 0.15)",
                              color: "#85621e",
                              fontSize: "12px",
                            }}
                          >
                            {(schedule.property_owner_details?.full_name || "O").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "13px" }}>
                              {schedule.property_owner_details?.full_name || "N/A"}
                            </span>
                            {schedule.property_owner_details?.mobile_number && (
                              <a
                                href={`tel:${schedule.property_owner_details.mobile_number}`}
                                className="text-muted small text-decoration-none d-inline-flex align-items-center hover-underline"
                                style={{ fontSize: "12px" }}
                              >
                                <FontAwesomeIcon icon={faPhoneAlt} className="me-1 text-muted" size="xs" />
                                {schedule.property_owner_details.mobile_number}
                              </a>
                            )}
                            {schedule.property_owner_details?.email && (
                              <div className="text-muted small" style={{ fontSize: "11px" }}>
                                {truncateText(schedule.property_owner_details.email, 24)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Property / Project Details */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-1.5">
                            <span
                              className="badge rounded-pill px-2 py-0.5 fw-semibold"
                              style={{
                                backgroundColor: isProject
                                  ? "rgba(166, 129, 57, 0.12)"
                                  : "rgba(122, 14, 46, 0.1)",
                                color: isProject ? "#85621e" : "#7A0E2E",
                                fontSize: "10px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={isProject ? faBuilding : faHome}
                                className="me-1"
                              />
                              {isProject ? "Project" : "Property"}
                            </span>
                            <span
                              className="fw-semibold text-dark text-truncate"
                              style={{ maxWidth: "200px", fontSize: "13px" }}
                              title={
                                isProject
                                  ? entity?.project_name
                                  : entity?.property_name
                              }
                            >
                              {isProject
                                ? entity?.project_name || "Untitled Project"
                                : entity?.property_name || "Untitled Property"}
                            </span>
                          </div>

                          {entity?.address && (
                            <span
                              className="text-muted small text-truncate d-inline-flex align-items-center"
                              style={{ maxWidth: "230px", fontSize: "12px" }}
                              title={entity.address}
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-1 text-muted flex-shrink-0"
                                size="xs"
                              />
                              {truncateText(entity.address, 32)}
                            </span>
                          )}

                          {entity?.city_name && (
                            <span className="text-muted small" style={{ fontSize: "11px" }}>
                              <FontAwesomeIcon icon={faCity} className="me-1 text-muted" size="xs" />
                              {entity.city_name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Appointment Time */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-0.5">
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center align-self-start"
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#334155",
                              border: "1px solid #CBD5E1",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faClock} className="me-1 text-muted" />
                            {schedule.timeslot || "Flexible"} {schedule.time_unit || ""}
                          </span>
                          <span className="text-muted small mt-1" style={{ fontSize: "12px" }}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" size="xs" />
                            {schedule.schedule_date || "Date N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Call Sessions & Duration */}
                      <td className="py-3">
                        {hasSessions ? (
                          <div className="d-flex flex-column gap-1">
                            {schedule.call_sessions.slice(0, 2).map((session, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-1 px-2 rounded-2 bg-light border small"
                                style={{ borderColor: "#E2E8F0", fontSize: "11px" }}
                              >
                                <span className="fw-semibold text-dark">
                                  {session.call_duration || "0m 0s"}
                                </span>
                                {session.ended_at && (
                                  <span className="text-muted ms-1" style={{ fontSize: "10px" }}>
                                    ({session.ended_at})
                                  </span>
                                )}
                              </div>
                            ))}
                            {schedule.call_sessions.length > 2 && (
                              <span className="text-muted small" style={{ fontSize: "10px" }}>
                                +{schedule.call_sessions.length - 2} earlier session(s)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="badge rounded-pill px-2.5 py-1 text-muted fw-normal"
                            style={{ backgroundColor: "#F8FAFC", border: "1px dashed #CBD5E1", fontSize: "11px" }}
                          >
                            No Calls Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Section */}
        {!loading && pagination.total_pages > 1 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top">
            <span className="text-muted small">
              Page <strong>{pagination.current_page}</strong> of{" "}
              <strong>{pagination.total_pages}</strong> (Total{" "}
              <strong>{pagination.total_count}</strong> tours)
            </span>

            <nav aria-label="Virtual tour pagination">
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li
                  className={`page-item ${
                    pagination.current_page === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link rounded-pill px-3"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                  >
                    Previous
                  </button>
                </li>

                {Array.from(
                  { length: Math.min(5, pagination.total_pages) },
                  (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.total_pages > 5 && pagination.current_page > 3) {
                      pageNum = pagination.current_page - 2 + i;
                      if (pageNum > pagination.total_pages) {
                        pageNum = pagination.total_pages - (4 - i);
                      }
                    }
                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          pagination.current_page === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor:
                              pagination.current_page === pageNum ? "#7A0E2E" : undefined,
                            borderColor:
                              pagination.current_page === pageNum ? "#7A0E2E" : undefined,
                          }}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                )}

                <li
                  className={`page-item ${
                    pagination.current_page === pagination.total_pages
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link rounded-pill px-3"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
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

export default AllSchedules;
