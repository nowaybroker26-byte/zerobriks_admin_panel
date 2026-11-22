import { EP } from '../../Api/endpoints';
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faUser,
  faCreditCard,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faSyncAlt,
  faExclamationTriangle,
  faCopy,
  faCheck,
  faReceipt,
  faCoins,
  faTimes,
  faUndo,
  faLayerGroup,
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
  const [pageSize, setPageSize] = useState(10);

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
      const q = searchQuery.toLowerCase().trim();
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

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
                icon={faReceipt}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Plans Purchase History
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
                  {purchaseHistory.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Audit log of customer subscription plan orders, transaction statuses, and expiration timelines
              </p>
            </div>
          </div>

          {/* Action Buttons (Compact, Clean, Professional) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("/plans-purchase")}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
              style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
              title="Manage subscription plans"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
              <span>Subscription Plans</span>
            </button>

            <button
              onClick={fetchPurchaseHistory}
              disabled={loading}
              className="btn btn-sm text-white d-inline-flex align-items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold shadow-xs"
              style={{
                height: "36px",
                fontSize: "12px",
                borderRadius: "8px",
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
              }}
              title="Refresh history"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`text-xs ${loading ? "fa-spin" : ""}`}
              />
              <span>Refresh History</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Pills (Compact, Space-Saving) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
          <div className="p-2.5 rounded-xl border border-gray-200/80 bg-gray-50/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Orders</span>
            <span className="text-xs font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-xs">
              {stats.total}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/30 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-medium">Active Plans</span>
            <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs">
              {stats.active}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Expired Plans</span>
            <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
              {stats.expired}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-amber-200/60 bg-amber-50/30 flex items-center justify-between">
            <span className="text-xs text-amber-800 font-medium">Success Txns</span>
            <span className="text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-xs">
              {stats.success}
            </span>
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
          className="p-2.5 rounded-xl mb-3 border bg-gray-50/80 shadow-xs"
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
                placeholder="Search by plan, subscriber, payment, transaction ID..."
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

            {/* Plan Status Dropdown */}
            <div style={{ flex: "0 1 150px", minWidth: "130px" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm bg-white border-secondary-subtle text-gray-700 font-medium cursor-pointer"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              >
                <option value="all">All Orders</option>
                <option value="Active">Active Plans</option>
                <option value="Expired">Expired Plans</option>
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
              Showing <strong className="text-gray-900">{filteredHistory.length}</strong> of{" "}
              <strong className="text-gray-900">{purchaseHistory.length}</strong>
            </div>

            {/* Reset Button */}
            {(searchQuery || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
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
            PURCHASE HISTORY TABLE (With In-Table Loader & Empty State)
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
                  <FontAwesomeIcon icon={faBox} className="mr-1.5 text-amber-300" />
                  Plan Name
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "170px" }}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 text-amber-300" />
                  Subscriber
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "160px" }}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-1.5 text-amber-300" />
                  Payment Info
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 text-amber-300" />
                  Purchased On
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 text-amber-300" />
                  Expires On
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "110px" }}
                >
                  Txn Status
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "110px" }}
                >
                  Plan Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2.2rem", height: "2.2rem" }}
                    >
                      <span className="visually-hidden">Loading history...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading order history...
                    </p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: "rgba(122, 14, 46, 0.08)",
                        color: "#7A0E2E",
                      }}
                    >
                      <FontAwesomeIcon icon={faReceipt} className="text-base" />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {purchaseHistory.length === 0
                        ? "No Purchase History Found"
                        : "No Matching Orders Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
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
                        className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={fetchPurchaseHistory}
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
                paginatedHistory.map((plan, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isSuccessTxn =
                    (plan.transaction_status || "").toLowerCase() === "success";
                  const isActivePlan =
                    (plan.plan_status || "").toLowerCase() === "active";
                  const isExpiredPlan =
                    (plan.plan_status || "").toLowerCase() === "expired";
                  const isCopied = copiedId === plan.transaction_id;

                  return (
                    <tr
                      key={plan._id || index}
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>

                      {/* Plan Name & Category */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 text-xs block">
                          {plan.plan_name || "Standard Plan"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.category_type && (
                            <span
                              className="badge rounded-pill px-2 py-0.5 font-semibold text-[10px]"
                              style={{
                                backgroundColor: "rgba(166, 129, 57, 0.12)",
                                color: "#85621e",
                              }}
                            >
                              {plan.category_type}
                            </span>
                          )}
                          {plan.user_type && (
                            <span
                              className="badge rounded-pill px-2 py-0.5 font-semibold text-[10px]"
                              style={{
                                backgroundColor: "rgba(122, 14, 46, 0.08)",
                                color: "#7A0E2E",
                              }}
                            >
                              {plan.user_type}
                            </span>
                          )}
                          {plan.no_of_units ? (
                            <span className="badge rounded-pill px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 text-[10px]">
                              {plan.no_of_units} units
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Subscriber / User */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0 shadow-xs select-none"
                            style={{ backgroundColor: "#7A0E2E" }}
                          >
                            {(plan.user_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {plan.user_name || "Subscriber"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Mode & Txn ID */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className="badge rounded-pill px-2 py-0.5 font-semibold text-[11px]"
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#334155",
                              border: "1px solid #CBD5E1",
                            }}
                          >
                            <FontAwesomeIcon icon={faCoins} className="me-1 text-gray-400 text-[10px]" />
                            {plan.payment_mode || "Online Gateway"}
                          </span>

                          {plan.transaction_id && (
                            <button
                              onClick={() => handleCopy(plan.transaction_id)}
                              className="btn btn-link p-0 text-gray-500 hover:text-gray-800 text-[11px] text-decoration-none inline-flex items-center gap-1"
                              title="Copy Transaction ID"
                            >
                              <FontAwesomeIcon
                                icon={isCopied ? faCheck : faCopy}
                                className={`text-[10px] ${isCopied ? "text-emerald-600" : ""}`}
                              />
                              <span>
                                {isCopied ? "Copied" : `#${String(plan.transaction_id).slice(-8)}`}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Purchased Date */}
                      <td className="py-3 px-3 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px] text-gray-400" />
                          <span>{plan.plan_purchase_date || "—"}</span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px] text-gray-400" />
                          <span>{plan.plan_expiry_date || "—"}</span>
                        </div>
                      </td>

                      {/* Transaction Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className="badge rounded-pill px-2.5 py-1 font-semibold inline-flex items-center gap-1"
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
                            className="text-[10px]"
                          />
                          <span>{plan.transaction_status || "Success"}</span>
                        </span>
                      </td>

                      {/* Plan Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className="badge rounded-pill px-2.5 py-1 font-semibold inline-flex items-center gap-1"
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
                            className="text-[10px]"
                          />
                          <span>{plan.plan_status || "Active"}</span>
                        </span>
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
        {!loading && filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredHistory.length)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredHistory.length}</strong> orders
            </div>

            <div className="flex items-center gap-2">
              <nav aria-label="Purchase history pagination">
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

                  {/* Numbered Page Buttons */}
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

export default PlansPurchaseHistory;
