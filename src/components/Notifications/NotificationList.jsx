import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBell,
  faTrash,
  faSearch,
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
  faSyncAlt,
  faFilter,
  faClock,
  faUsers,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

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
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Load notifications from server
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/get_notifications`
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

    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete ALL notifications?\n\nThis will permanently delete all broadcast notifications from the server and database. This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingAll(true);
    setError("");
    setSuccess("");

    try {
      let res;
      try {
        res = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/delete_all_notifications`
        );
      } catch (delErr) {
        // Fallback to POST if DELETE method is blocked
        res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/delete_all_notifications`
        );
      }

      if (res.status === 200 || res.data?.status === 1) {
        setNotifications([]);
        setSuccess("All notifications have been successfully deleted from the server.");
        setTimeout(() => setSuccess(""), 5000);
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification from the server?"
    );
    if (!confirmed) return;

    setDeletingId(notificationId);
    setError("");
    setSuccess("");

    try {
      let res;
      try {
        res = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/delete_notification`,
          { data: { notification_id: notificationId } }
        );
      } catch (delErr) {
        res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/delete_notification`,
          { notification_id: notificationId }
        );
      }

      if (res.status === 200 || res.data?.status === 1) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        setSuccess("Notification deleted successfully.");
        setTimeout(() => setSuccess(""), 4000);
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
              className="badge rounded-pill border px-2 py-1 fw-semibold"
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
      const titleMatch = notif.notification_title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const messageMatch = notif.message
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const audienceMatch = notif.send_to
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch =
        !searchQuery || titleMatch || messageMatch || audienceMatch;

      if (!matchesSearch) return false;

      if (selectedAudience === "all") return true;
      const sendTo = (notif.send_to || "").toLowerCase();
      if (selectedAudience === "buyer")
        return sendTo.includes("buyer") || sendTo.includes("tenant");
      if (selectedAudience === "owner") return sendTo.includes("owner");
      if (selectedAudience === "builder")
        return sendTo.includes("builder") || sendTo.includes("developer");

      return true;
    });
  }, [notifications, searchQuery, selectedAudience]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <div className="flex-grow-1">{success}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
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
                Communications & Broadcasts
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
                <FontAwesomeIcon icon={faBell} />
              </span>
              Push Notifications
            </h3>
            <p className="text-muted small mb-0">
              Manage broadcast notifications sent to app users and monitor dispatch history.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
              title="Refresh list"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`me-1.5 ${loading ? "fa-spin" : ""}`}
              />
              Refresh
            </button>

            {/* DELETE ALL BUTTON */}
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll || notifications.length === 0}
              className="btn btn-outline-danger px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{
                borderColor: "#FCA5A5",
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
              }}
              title="Permanently delete all notifications from server"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className={`me-1.5 ${deletingAll ? "fa-spin" : ""}`}
              />
              {deletingAll ? "Deleting All..." : "Delete All"}
            </button>

            {/* ADD NOTIFICATION BUTTON */}
            <button
              onClick={() => navigate("/notification")}
              className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition d-inline-flex align-items-center"
              style={{
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1.5" />
              Add Notification
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
                placeholder="Search by title, message, audience..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="col-12 col-md-7 d-flex justify-content-md-end flex-wrap gap-1.5">
            <span className="text-muted small align-self-center me-1 d-none d-lg-inline">
              <FontAwesomeIcon icon={faFilter} className="me-1 text-muted" /> Filter:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "buyer", label: "Buyers" },
              { id: "owner", label: "Owners" },
              { id: "builder", label: "Builders" },
            ].map((tab) => {
              const active = selectedAudience === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedAudience(tab.id);
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
          </div>
        </div>

        {/* Counter Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Total Broadcasts:{" "}
            <strong className="text-dark">{notifications.length}</strong>
            {searchQuery || selectedAudience !== "all" ? (
              <span className="text-muted ms-2">
                (Showing <strong>{filteredNotifications.length}</strong> matching)
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
              <span className="visually-hidden">Loading notifications...</span>
            </div>
            <p className="text-muted mt-2 small">Loading notification records...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
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
              <FontAwesomeIcon icon={faBell} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {notifications.length === 0
                ? "No Notifications Found"
                : "No Matching Notifications"}
            </h5>
            <p className="text-muted small mb-3">
              {notifications.length === 0
                ? "No notifications have been broadcast yet. Click below to compose one."
                : "Try adjusting your search criteria or audience filter."}
            </p>
            {notifications.length === 0 ? (
              <button
                onClick={() => navigate("/notification")}
                className="btn btn-sm text-white px-3.5 py-2 rounded-pill fw-semibold shadow-xs"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1.5" />
                Add Notification
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAudience("all");
                }}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Notifications Table */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="table-responsive rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
            <table className="table table-hover align-middle mb-0">
              <thead
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottom: "2px solid #E2E8F0",
                }}
              >
                <tr className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                  <th style={{ width: "50px" }} className="py-3 px-3 text-center">
                    #
                  </th>
                  <th style={{ minWidth: "200px" }} className="py-3">
                    <FontAwesomeIcon icon={faBell} className="me-1.5 text-muted" />
                    Title
                  </th>
                  <th style={{ minWidth: "300px" }} className="py-3">
                    <FontAwesomeIcon icon={faCommentDots} className="me-1.5 text-muted" />
                    Message
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon icon={faUsers} className="me-1.5 text-muted" />
                    Sent To
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon icon={faClock} className="me-1.5 text-muted" />
                    Timestamp
                  </th>
                  <th style={{ width: "90px" }} className="py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotifications.map((notification, index) => {
                  const rowNumber =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  const isDeleting = deletingId === notification._id;

                  return (
                    <tr
                      key={notification._id || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {rowNumber}
                      </td>
                      <td className="py-3">
                        <span className="fw-semibold text-dark d-block">
                          {notification.notification_title || "Untitled"}
                        </span>
                      </td>
                      <td className="py-3">
                        <p
                          className="text-muted small mb-0"
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
                      <td className="py-3">
                        {renderAudiencePills(notification.send_to)}
                      </td>
                      <td className="py-3 text-muted small">
                        {formatDate(notification.timestamp)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDeleteSingle(notification._id)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-outline-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderColor: "#FCA5A5",
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                          }}
                          title="Delete this notification from server"
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
                {Math.min(currentPage * itemsPerPage, filteredNotifications.length)}
              </strong>{" "}
              of <strong>{filteredNotifications.length}</strong> items
            </span>

            <nav aria-label="Notification pagination">
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

export default NotificationList;
