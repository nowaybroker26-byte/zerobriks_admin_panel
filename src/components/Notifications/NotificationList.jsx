import { EP } from '../../Api/endpoints';
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBell,
  faTrash,
  faSearch,
  faCheckCircle,
  faExclamationTriangle,
  faSyncAlt,
  faClock,
  faUsers,
  faCommentDots,
  faTimes,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  // Load notifications from server
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${EP.API_GET_NOTIFICATIONS}`
      );
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (err.response && err.response.status === 204) {
        setNotifications([]);
      } else {
        setError("Failed to fetch notifications from the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const flashMsg = localStorage.getItem("success");
    if (flashMsg) {
      setSuccess(flashMsg);
      localStorage.removeItem("success");
      setTimeout(() => setSuccess(""), 4000);
    }
    fetchNotifications();
  }, []);

  // Format timestamp helper
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

  // Delete All Notifications from server
  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    const result = await Swal.fire({
      title: "Delete All Notifications?",
      text: "This will permanently delete all broadcast notifications from the server. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7A0E2E",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete all",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
        cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingAll(true);
    setError("");
    setSuccess("");

    try {
      let res;
      try {
        res = await axios.delete(
          `${EP.API_DELETE_ALL_NOTIFICATIONS}`
        );
      } catch (delErr) {
        res = await axios.post(
          `${EP.API_DELETE_ALL_NOTIFICATIONS}`
        );
      }

      if (res.status === 200 || res.data?.status === 1) {
        setNotifications([]);
        setSuccess("All notifications have been successfully deleted.");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.data?.msg || "Failed to delete notifications.");
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      setError(
        err.response?.data?.msg ||
          "Failed to delete all notifications from the server."
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // Delete single notification from server
  const handleDeleteSingle = async (notificationId) => {
    const result = await Swal.fire({
      title: "Delete Notification?",
      text: "Are you sure you want to delete this notification record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7A0E2E",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
        cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingId(notificationId);
    setError("");
    setSuccess("");

    try {
      let res;
      try {
        res = await axios.delete(
          `${EP.API_DELETE_NOTIFICATION}`,
          { data: { notification_id: notificationId } }
        );
      } catch (delErr) {
        res = await axios.post(
          `${EP.API_DELETE_NOTIFICATION}`,
          { notification_id: notificationId }
        );
      }

      if (res.status === 200 || res.data?.status === 1) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        setSuccess("Notification deleted successfully.");
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(res.data?.msg || "Failed to delete notification.");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(
        err.response?.data?.msg ||
          "Failed to delete notification from the server."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format audience tags
  const renderAudiencePills = (sendToStr) => {
    if (!sendToStr) return <span className="badge bg-secondary">All</span>;
    const parts = sendToStr.split(/[,|]/).map((s) => s.trim().toLowerCase());

    const getPillStyle = (part) => {
      if (part.includes("buyer") || part.includes("tenant")) {
        return {
          backgroundColor: "rgba(13, 110, 253, 0.1)",
          color: "#0d6efd",
          borderColor: "rgba(13, 110, 253, 0.25)",
        };
      }
      if (part.includes("owner")) {
        return {
          backgroundColor: "rgba(122, 14, 46, 0.1)",
          color: "#7A0E2E",
          borderColor: "rgba(122, 14, 46, 0.25)",
        };
      }
      if (part.includes("builder") || part.includes("developer")) {
        return {
          backgroundColor: "rgba(166, 129, 57, 0.12)",
          color: "#85621e",
          borderColor: "rgba(166, 129, 57, 0.3)",
        };
      }
      return {
        backgroundColor: "#f1f5f9",
        color: "#475569",
        borderColor: "#cbd5e1",
      };
    };

    return (
      <div className="d-flex flex-wrap gap-1">
        {parts.map((p, idx) => {
          const style = getPillStyle(p);
          const label = p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <span
              key={idx}
              className="badge rounded-pill border px-2 py-0.5 fw-semibold"
              style={{ ...style, fontSize: "11px" }}
            >
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (notif.notification_title || "")
        .toLowerCase()
        .includes(q);
      const messageMatch = (notif.message || "").toLowerCase().includes(q);
      const audienceMatch = (notif.send_to || "").toLowerCase().includes(q);

      const matchesSearch =
        !q || titleMatch || messageMatch || audienceMatch;

      if (!matchesSearch) return false;

      if (selectedAudience === "all") return true;
      const sendTo = (notif.send_to || "").toLowerCase();
      if (selectedAudience === "buyer")
        return sendTo.includes("buyer") || sendTo.includes("tenant");
      if (selectedAudience === "owner") return sendTo.includes("owner");
      if (selectedAudience === "builder")
        return sendTo.includes("builder") || sendTo.includes("developer");
      if (selectedAudience === "agent") return sendTo.includes("agent");

      return true;
    });
  }, [notifications, searchQuery, selectedAudience]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAudience, pageSize]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6" style={{ minHeight: "100vh" }}>
      {/* Alert Messages */}
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

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm rounded-xl mb-3 d-flex align-items-center text-sm"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <div className="flex-grow-1">{success}</div>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Main Container Card */}
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
                icon={faBell}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Push Notifications
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
                  {notifications.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Manage and monitor broadcast push notifications sent to app users
              </p>
            </div>
          </div>

          {/* Action Buttons (Clean & Compact) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Refresh */}
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
              style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
              title="Refresh list"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`text-xs ${loading ? "fa-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            {/* Delete All */}
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll || notifications.length === 0}
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold shadow-xs"
              style={{
                height: "36px",
                fontSize: "12px",
                borderRadius: "8px",
                borderColor: "#FCA5A5",
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
              }}
              title="Permanently delete all notifications"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className={`text-xs ${deletingAll ? "fa-spin" : ""}`}
              />
              <span>{deletingAll ? "Deleting..." : "Delete All"}</span>
            </button>

            {/* Add Notification */}
            <button
              onClick={() => navigate("/notification")}
              className="btn btn-sm text-white d-inline-flex align-items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold shadow-xs"
              style={{
                height: "36px",
                fontSize: "12px",
                borderRadius: "8px",
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Add Notification</span>
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
                placeholder="Search by title, message, audience..."
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

            {/* Audience Filter Dropdown */}
            <div style={{ flex: "0 1 160px", minWidth: "140px" }}>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value="all">All Audiences</option>
                <option value="buyer">Buyers / Tenants</option>
                <option value="owner">Owners</option>
                <option value="builder">Builders</option>
                <option value="agent">Agents</option>
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
              Showing <strong className="text-gray-900">{filteredNotifications.length}</strong> of{" "}
              <strong className="text-gray-900">{notifications.length}</strong>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedAudience !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAudience("all");
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
            NOTIFICATIONS TABLE (With In-Table Loader & Empty State)
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
                  style={{ backgroundColor: "#7A0E2E", width: "50px" }}
                >
                  #
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "180px" }}
                >
                  <FontAwesomeIcon icon={faBell} className="mr-1.5 text-amber-300" />
                  Title
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "320px" }}
                >
                  <FontAwesomeIcon icon={faCommentDots} className="mr-1.5 text-amber-300" />
                  Message
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "150px" }}
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-1.5 text-amber-300" />
                  Audience
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "160px" }}
                >
                  <FontAwesomeIcon icon={faClock} className="mr-1.5 text-amber-300" />
                  Timestamp
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", width: "90px" }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Point 3: Clean loader while data is loading */}
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2.2rem", height: "2.2rem" }}
                    >
                      <span className="visually-hidden">Loading notifications...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading broadcast notifications...
                    </p>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
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
                      <FontAwesomeIcon icon={faBell} className="text-base" />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {notifications.length === 0
                        ? "No Notifications Broadcasted Yet"
                        : "No Matching Notifications Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
                      {notifications.length === 0
                        ? "Click below to compose and broadcast your first push alert."
                        : "Try adjusting your search criteria or audience filter."}
                    </p>
                    {notifications.length === 0 ? (
                      <button
                        onClick={() => navigate("/notification")}
                        className="btn btn-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                        style={{ backgroundColor: "#7A0E2E" }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1.5" />
                        Compose Notification
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedAudience("all");
                        }}
                        className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notification, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isDeleting = deletingId === notification._id;

                  return (
                    <tr
                      key={notification._id || index}
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 text-xs block">
                          {notification.notification_title || "Untitled"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p
                          className="text-gray-600 text-xs mb-0"
                          style={{
                            maxWidth: "420px",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: "1.45",
                          }}
                        >
                          {notification.message || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        {renderAudiencePills(notification.send_to)}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs">
                        {formatDate(notification.timestamp)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteSingle(notification._id)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-outline-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderColor: "#FCA5A5",
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                          }}
                          title="Delete notification"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            size="xs"
                            className={isDeleting ? "fa-spin" : ""}
                          />
                        </button>
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
        {!loading && filteredNotifications.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredNotifications.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900">{filteredNotifications.length}</strong>{" "}
              notifications
            </div>

            <div className="flex items-center gap-2">
              <nav aria-label="Notification pagination">
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

export default NotificationList;
