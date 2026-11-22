import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faClock,
  faUser,
  faPhoneAlt,
  faBuilding,
  faMapMarkerAlt,
  faSearch,
  faSyncAlt,
  faExclamationTriangle,
  faPhoneVolume,
  faHome,
  faTimes,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handlePageSizeChange = (newSize) => {
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
      const q = searchQuery.toLowerCase().trim();

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
                icon={faVideo}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Virtual Tours Scheduled
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
                  {pagination.total_count || allSchedules.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Track live walkthrough appointments scheduled between clients and property owners/builders
              </p>
            </div>
          </div>

          {/* Action & Tab Navigation (Compact & Sleek) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="p-1 rounded-lg border inline-flex items-center bg-gray-50/80"
              style={{ borderColor: "#E2E8F0" }}
            >
              <button
                className="btn btn-sm px-3 py-1 font-semibold rounded-md text-xs shadow-xs text-white"
                style={{
                  backgroundColor: "#7A0E2E",
                  borderColor: "#7A0E2E",
                  height: "28px",
                }}
                onClick={() => handleTabChange("all")}
              >
                All Schedules
              </button>
              <button
                className="btn btn-sm px-3 py-1 font-semibold rounded-md text-xs text-gray-600 hover:text-gray-900"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  height: "28px",
                }}
                onClick={() => handleTabChange("my")}
              >
                My Schedules
              </button>
            </div>

            <button
              onClick={() => fetchSchedules(pagination.current_page, pagination.page_size)}
              disabled={loading}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
              style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
              title="Refresh schedule list"
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
                placeholder="Search by client, owner, property, city, date..."
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

            {/* Tour Type Dropdown */}
            <div style={{ flex: "0 1 150px", minWidth: "130px" }}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value="all">All Tour Types</option>
                <option value="Property">Properties Only</option>
                <option value="Project">Projects Only</option>
              </select>
            </div>

            {/* Page Size Dropdown */}
            <div style={{ flex: "0 1 110px", minWidth: "95px" }}>
              <select
                value={pagination.page_size}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
              Showing <strong className="text-gray-900">{filteredSchedules.length}</strong> of{" "}
              <strong className="text-gray-900">{pagination.total_count || allSchedules.length}</strong>
            </div>

            {/* Reset Button */}
            {(searchQuery || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
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
            SCHEDULES DATA TABLE (With In-Table Loader & Empty State)
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
                  style={{ backgroundColor: "#7A0E2E", minWidth: "180px" }}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 text-amber-300" />
                  Scheduled By
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "180px" }}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 text-amber-300" />
                  Scheduled With
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "220px" }}
                >
                  <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-amber-300" />
                  Property / Project
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "160px" }}
                >
                  <FontAwesomeIcon icon={faClock} className="mr-1.5 text-amber-300" />
                  Appointment Time
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "150px" }}
                >
                  <FontAwesomeIcon icon={faPhoneVolume} className="mr-1.5 text-amber-300" />
                  Call Sessions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2.2rem", height: "2.2rem" }}
                    >
                      <span className="visually-hidden">Loading tour schedules...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading appointment records...
                    </p>
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: "rgba(122, 14, 46, 0.08)",
                        color: "#7A0E2E",
                      }}
                    >
                      <FontAwesomeIcon icon={faVideo} className="text-base" />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {allSchedules.length === 0 ? "No Virtual Tours Scheduled" : "No Matching Appointments Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
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
                        className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={() => fetchSchedules(1, pagination.page_size)}
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
                filteredSchedules.map((schedule, index) => {
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
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>

                      {/* Scheduled By (Client) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs select-none"
                            style={{ backgroundColor: "#7A0E2E" }}
                          >
                            {(schedule.user_details?.full_name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {schedule.user_details?.full_name || "N/A"}
                            </span>
                            {schedule.user_details?.mobile_number && (
                              <a
                                href={`tel:${schedule.user_details.mobile_number}`}
                                className="text-gray-500 text-[11px] hover:text-[#7A0E2E] transition-colors inline-flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faPhoneAlt} className="text-[10px]" />
                                <span>{schedule.user_details.mobile_number}</span>
                              </a>
                            )}
                            {schedule.user_details?.email && (
                              <div className="text-gray-400 text-[11px]">
                                {truncateText(schedule.user_details.email, 24)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Scheduled With (Owner / Builder) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs select-none"
                            style={{
                              backgroundColor: "rgba(166, 129, 57, 0.15)",
                              color: "#85621e",
                            }}
                          >
                            {(schedule.property_owner_details?.full_name || "O").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {schedule.property_owner_details?.full_name || "N/A"}
                            </span>
                            {schedule.property_owner_details?.mobile_number && (
                              <a
                                href={`tel:${schedule.property_owner_details.mobile_number}`}
                                className="text-gray-500 text-[11px] hover:text-[#7A0E2E] transition-colors inline-flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faPhoneAlt} className="text-[10px]" />
                                <span>{schedule.property_owner_details.mobile_number}</span>
                              </a>
                            )}
                            {schedule.property_owner_details?.email && (
                              <div className="text-gray-400 text-[11px]">
                                {truncateText(schedule.property_owner_details.email, 24)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Property / Project Details */}
                      <td className="py-3 px-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="badge rounded-pill px-2 py-0.5 font-semibold text-[10.5px]"
                              style={{
                                backgroundColor: isProject
                                  ? "rgba(122, 14, 46, 0.08)"
                                  : "rgba(13, 110, 253, 0.08)",
                                color: isProject ? "#7A0E2E" : "#0d6efd",
                                border: isProject
                                  ? "1px solid rgba(122, 14, 46, 0.2)"
                                  : "1px solid rgba(13, 110, 253, 0.2)",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={isProject ? faBuilding : faHome}
                                className="text-[9px] mr-1"
                              />
                              {schedule.tour_type || "Listing"}
                            </span>
                            <span className="font-bold text-gray-800 text-xs truncate max-w-[170px]" title={entity?.property_name || entity?.project_name}>
                              {entity?.property_name || entity?.project_name || "Untitled Listing"}
                            </span>
                          </div>
                          {entity?.city_name && (
                            <div className="text-gray-500 text-[11px] flex items-center gap-1">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px] text-[#7A0E2E]" />
                              <span>{entity.city_name}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Appointment Time */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-gray-800">
                          {schedule.schedule_date || "—"}
                        </div>
                        <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <FontAwesomeIcon icon={faClock} className="text-[10px] text-amber-600" />
                          <span>{schedule.timeslot || "Flexible Time"}</span>
                        </div>
                      </td>

                      {/* Call Sessions & Duration */}
                      <td className="py-3 px-3">
                        {hasSessions ? (
                          <div className="flex flex-col gap-1">
                            {schedule.call_sessions.slice(0, 2).map((session, sIdx) => (
                              <div
                                key={sIdx}
                                className="px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-[11px]"
                              >
                                <span className="font-semibold text-gray-800">
                                  {session.call_duration || "0m 0s"}
                                </span>
                                {session.ended_at && (
                                  <span className="text-gray-400 ms-1 text-[10px]">
                                    ({session.ended_at})
                                  </span>
                                )}
                              </div>
                            ))}
                            {schedule.call_sessions.length > 2 && (
                              <span className="text-gray-400 text-[10px]">
                                +{schedule.call_sessions.length - 2} earlier session(s)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="badge bg-gray-50 text-gray-400 border border-dashed border-gray-300 px-2 py-0.5 font-normal text-[10.5px]">
                            No Calls Logged
                          </span>
                        )}
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
        {!loading && pagination.total_pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing page{" "}
              <strong className="text-gray-900">{pagination.current_page}</strong> of{" "}
              <strong className="text-gray-900">{pagination.total_pages}</strong> (Total{" "}
              <strong className="text-gray-900">{pagination.total_count}</strong> tours)
            </div>

            <div className="flex items-center gap-2">
              <nav aria-label="Virtual tour pagination">
                <ul className="pagination pagination-sm mb-0 gap-1 align-items-center flex-wrap">
                  {/* First */}
                  <li className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1}
                      title="First Page"
                    >
                      « First
                    </button>
                  </li>

                  {/* Prev */}
                  <li className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      title="Previous Page"
                    >
                      ‹ Prev
                    </button>
                  </li>

                  {/* Numeric Buttons */}
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
                      const isActive = pagination.current_page === pageNum;
                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${isActive ? "active" : ""}`}
                        >
                          <button
                            className="page-link rounded-2 fw-bold text-xs d-flex align-items-center justify-content-center shadow-xs"
                            style={{
                              minWidth: "30px",
                              height: "30px",
                              backgroundColor: isActive ? "#7A0E2E" : undefined,
                              borderColor: isActive ? "#7A0E2E" : undefined,
                              color: isActive ? "#FFFFFF" : undefined,
                            }}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    }
                  )}

                  {/* Next */}
                  <li
                    className={`page-item ${
                      pagination.current_page === pagination.total_pages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      title="Next Page"
                    >
                      Next ›
                    </button>
                  </li>

                  {/* Last */}
                  <li
                    className={`page-item ${
                      pagination.current_page === pagination.total_pages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link rounded-2 px-2.5 py-1 text-xs border"
                      onClick={() => handlePageChange(pagination.total_pages)}
                      disabled={pagination.current_page === pagination.total_pages}
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

export default AllSchedules;
