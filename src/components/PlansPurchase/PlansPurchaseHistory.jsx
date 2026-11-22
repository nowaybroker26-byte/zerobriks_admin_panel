import { EP } from '../../Api/endpoints';
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faUser,
  faCreditCard,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSearch,
  faArrowLeft,
  faSyncAlt,
  faExclamationTriangle,
  faFilter,
  faCopy,
  faCheck,
  faReceipt,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = `${EP.API_PLAN_PURCHASE_HISTORY}`;

const PlansPurchaseHistory = () => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'Active', 'Expired'
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Fetch purchase history from API
  const fetchPurchaseHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_URL);
      if (
        response.data &&
        (response.data.status === 1 || response.data.status === "1") &&
        Array.isArray(response.data.data)
      ) {
        setPurchaseHistory(response.data.data);
      } else {
        setPurchaseHistory([]);
      }
    } catch (err) {
      console.error("Error fetching purchase history:", err);
      if (err.response && err.response.status === 204) {
        setPurchaseHistory([]);
      } else {
        setError("Failed to fetch purchase history from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  // Copy transaction ID
  const handleCopy = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats computation
  const stats = useMemo(() => {
    const total = purchaseHistory.length;
    const active = purchaseHistory.filter(
      (p) => (p.plan_status || "").toLowerCase() === "active"
    ).length;
    const expired = purchaseHistory.filter(
      (p) => (p.plan_status || "").toLowerCase() === "expired"
    ).length;
    const success = purchaseHistory.filter(
      (p) => (p.transaction_status || "").toLowerCase() === "success"
    ).length;
    return { total, active, expired, success };
  }, [purchaseHistory]);

  // Filter & Search
  const filteredHistory = useMemo(() => {
    return purchaseHistory.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if ((item.plan_status || "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.plan_name?.toLowerCase().includes(q) ||
        item.user_name?.toLowerCase().includes(q) ||
        item.category_type?.toLowerCase().includes(q) ||
        item.user_type?.toLowerCase().includes(q) ||
        item.payment_mode?.toLowerCase().includes(q) ||
        item.transaction_id?.toLowerCase().includes(q) ||
        item.plan_purchase_date?.toLowerCase().includes(q) ||
        item.plan_expiry_date?.toLowerCase().includes(q)
      );
    });
  }, [purchaseHistory, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

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
                Billing & Subscriptions
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
                <FontAwesomeIcon icon={faClock} />
              </span>
              Plans Purchase History
            </h3>
            <p className="text-muted small mb-0">
              Audit log of customer subscription plan orders, transaction statuses, and expiration timelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 flex-wrap">
            <button
              onClick={() => navigate("/plans-purchase")}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              Subscription Plans
            </button>

            <button
              onClick={fetchPurchaseHistory}
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
              Refresh History
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div
              className="p-3 rounded-3 border bg-light"
              style={{ borderColor: "#E2E8F0" }}
            >
              <span className="text-muted small d-block mb-1 fw-semibold">
                Total Orders
              </span>
              <h4 className="fw-bold text-dark mb-0">{stats.total}</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="p-3 rounded-3 border"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.06)",
                borderColor: "rgba(16, 185, 129, 0.2)",
              }}
            >
              <span
                className="small d-block mb-1 fw-semibold"
                style={{ color: "#059669" }}
              >
                Active Plans
              </span>
              <h4 className="fw-bold mb-0" style={{ color: "#059669" }}>
                {stats.active}
              </h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="p-3 rounded-3 border"
              style={{
                backgroundColor: "rgba(100, 116, 139, 0.06)",
                borderColor: "rgba(100, 116, 139, 0.2)",
              }}
            >
              <span className="text-muted small d-block mb-1 fw-semibold">
                Expired Plans
              </span>
              <h4 className="fw-bold text-muted mb-0">{stats.expired}</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="p-3 rounded-3 border"
              style={{
                backgroundColor: "rgba(166, 129, 57, 0.08)",
                borderColor: "rgba(166, 129, 57, 0.25)",
              }}
            >
              <span
                className="small d-block mb-1 fw-semibold"
                style={{ color: "#85621e" }}
              >
                Successful Txns
              </span>
              <h4 className="fw-bold mb-0" style={{ color: "#85621e" }}>
                {stats.success}
              </h4>
            </div>
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
                placeholder="Search by plan, subscriber, payment, transaction ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="col-12 col-md-7 d-flex justify-content-md-end flex-wrap gap-1.5 align-items-center">
            <span className="text-muted small me-1 d-none d-lg-inline">
              <FontAwesomeIcon icon={faFilter} className="me-1 text-muted" /> Filter:
            </span>
            {[
              { id: "all", label: "All Orders" },
              { id: "Active", label: "Active" },
              { id: "Expired", label: "Expired" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
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
            Total Orders: <strong className="text-dark">{purchaseHistory.length}</strong>
            {searchQuery || statusFilter !== "all" ? (
              <span className="text-muted ms-2">
                (Showing <strong>{filteredHistory.length}</strong> matching)
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
              <span className="visually-hidden">Loading history...</span>
            </div>
            <p className="text-muted mt-2 small">Loading order history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHistory.length === 0 && (
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
              <FontAwesomeIcon icon={faReceipt} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {purchaseHistory.length === 0
                ? "No Purchase History Found"
                : "No Matching Orders"}
            </h5>
            <p className="text-muted small mb-3">
              {purchaseHistory.length === 0
                ? "Plan subscriptions purchased by users will be recorded here."
                : "Try adjusting your search query or status filter."}
            </p>
            {searchQuery || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={fetchPurchaseHistory}
                className="btn btn-sm text-white px-3.5 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Reload
              </button>
            )}
          </div>
        )}

        {/* Purchase History Table */}
        {!loading && filteredHistory.length > 0 && (
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
                    <FontAwesomeIcon icon={faBox} className="me-1.5 text-muted" />
                    Plan Name
                  </th>
                  <th style={{ minWidth: "170px" }} className="py-3">
                    <FontAwesomeIcon icon={faUser} className="me-1.5 text-muted" />
                    Subscriber
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon icon={faCreditCard} className="me-1.5 text-muted" />
                    Payment Info
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1.5 text-muted" />
                    Purchased On
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1.5 text-muted" />
                    Expires On
                  </th>
                  <th style={{ minWidth: "130px" }} className="py-3 text-center">
                    Txn Status
                  </th>
                  <th style={{ minWidth: "110px" }} className="py-3 text-center">
                    Plan Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((plan, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const isSuccessTxn = (plan.transaction_status || "").toLowerCase() === "success";
                  const isActivePlan = (plan.plan_status || "").toLowerCase() === "active";
                  const isExpiredPlan = (plan.plan_status || "").toLowerCase() === "expired";
                  const isCopied = copiedId === plan.transaction_id;

                  return (
                    <tr
                      key={plan._id || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {rowNumber}
                      </td>

                      {/* Plan Name & Category */}
                      <td className="py-3">
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: "13px" }}>
                          {plan.plan_name || "Standard Plan"}
                        </span>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {plan.category_type && (
                            <span
                              className="badge rounded-pill px-2 py-0.5 fw-semibold"
                              style={{
                                backgroundColor: "rgba(166, 129, 57, 0.12)",
                                color: "#85621e",
                                fontSize: "10px",
                              }}
                            >
                              {plan.category_type}
                            </span>
                          )}
                          {plan.user_type && (
                            <span
                              className="badge rounded-pill px-2 py-0.5 fw-semibold"
                              style={{
                                backgroundColor: "rgba(122, 14, 46, 0.08)",
                                color: "#7A0E2E",
                                fontSize: "10px",
                              }}
                            >
                              {plan.user_type}
                            </span>
                          )}
                          {plan.no_of_units ? (
                            <span
                              className="badge rounded-pill px-2 py-0.5 text-muted bg-light border"
                              style={{ fontSize: "10px" }}
                            >
                              {plan.no_of_units} units
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Subscriber / User */}
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
                            {(plan.user_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "13px" }}>
                              {plan.user_name || "Subscriber"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Mode & Txn ID */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-1">
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold align-self-start"
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#334155",
                              border: "1px solid #CBD5E1",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faCoins} className="me-1 text-muted" size="xs" />
                            {plan.payment_mode || "Online Gateway"}
                          </span>

                          {plan.transaction_id && (
                            <button
                              onClick={() => handleCopy(plan.transaction_id)}
                              className="btn btn-link p-0 text-muted small text-decoration-none d-inline-flex align-items-center"
                              style={{ fontSize: "11px" }}
                              title="Click to copy Transaction ID"
                            >
                              <FontAwesomeIcon
                                icon={isCopied ? faCheck : faCopy}
                                className={`me-1 ${isCopied ? "text-success" : ""}`}
                              />
                              {isCopied ? "Copied" : `#${String(plan.transaction_id).slice(-8)}`}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Purchased Date */}
                      <td className="py-3 text-muted small" style={{ fontSize: "12px" }}>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" size="xs" />
                        {plan.plan_purchase_date || "—"}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 text-muted small" style={{ fontSize: "12px" }}>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" size="xs" />
                        {plan.plan_expiry_date || "—"}
                      </td>

                      {/* Transaction Status */}
                      <td className="py-3 text-center">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                          style={{
                            backgroundColor: isSuccessTxn
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(239, 68, 68, 0.1)",
                            color: isSuccessTxn ? "#059669" : "#dc2626",
                            fontSize: "11px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={isSuccessTxn ? faCheckCircle : faTimesCircle}
                            className="me-1"
                          />
                          {plan.transaction_status || "Success"}
                        </span>
                      </td>

                      {/* Plan Status */}
                      <td className="py-3 text-center">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                          style={{
                            backgroundColor: isActivePlan
                              ? "rgba(16, 185, 129, 0.12)"
                              : isExpiredPlan
                              ? "rgba(100, 116, 139, 0.1)"
                              : "rgba(245, 158, 11, 0.12)",
                            color: isActivePlan
                              ? "#059669"
                              : isExpiredPlan
                              ? "#64748b"
                              : "#b45309",
                            fontSize: "11px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={isActivePlan ? faCheckCircle : faTimesCircle}
                            className="me-1"
                          />
                          {plan.plan_status || "Active"}
                        </span>
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
                {Math.min(currentPage * itemsPerPage, filteredHistory.length)}
              </strong>{" "}
              of <strong>{filteredHistory.length}</strong> orders
            </span>

            <nav aria-label="Purchase history pagination">
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

export default PlansPurchaseHistory;
