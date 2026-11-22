import { EP, API_BASE_URL } from '../../Api/endpoints';
import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faSpinner,
  faGift,
  faTag,
  faFileAlt,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faSyncAlt,
  faExclamationTriangle,
  faBuilding,
  faImage,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { MyContext } from "../../App";

const Offers = () => {
  const { can } = useContext(MyContext) || {};
  const canApprove = typeof can === "function" ? can("offers", "approve") : true;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Offers
  const fetchOffers = async () => {
    setLoading(true);
    setErrors("");
    try {
      const response = await fetch(
        `${EP.API_GET_OFFERS}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }

      const result = await response.json();

      if (result.status === 1 && Array.isArray(result.data)) {
        const offersStatus = result.data.map((offer) => ({
          ...offer,
          status: offer.status || "Pending",
        }));
        setOffers(offersStatus);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOffers([]);
      setErrors("No promotional offers available or failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle Approve / Disapprove
  const handleApproval = async (newStatus, _id) => {
    let proceed = false;
    let reason = "";

    if (newStatus === "Disapproved") {
      const { value: inputReason } = await Swal.fire({
        title: "Reason for Disapproval",
        input: "textarea",
        inputLabel: "Please provide a reason for disapproving this offer",
        inputPlaceholder: "Enter reason here...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7A0E2E",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
        },
        inputValidator: (value) => {
          if (!value || value.trim() === "") {
            return "A reason is required to disapprove the offer";
          }
        },
      });

      if (!inputReason) {
        return;
      }

      reason = inputReason;

      const confirmResult = await Swal.fire({
        title: "Confirm Status Change",
        text: `Are you sure you want to change the status to ${newStatus}? Reason: ${reason}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, change it!",
        cancelButtonText: "No, cancel",
        confirmButtonColor: "#7A0E2E",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
        },
      });

      proceed = confirmResult.isConfirmed;
    } else {
      const confirmResult = await Swal.fire({
        title: "Confirm Status Change",
        text: `Are you sure you want to change the status to ${newStatus}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, change it!",
        cancelButtonText: "No, cancel",
        confirmButtonColor: "#7A0E2E",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
        },
      });

      proceed = confirmResult.isConfirmed;
    }

    if (proceed) {
      try {
        setSuccess("");
        setErrors("");

        const response = await fetch(
          `${EP.API_UPDATE_OFFER_STATUS}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              offer_id: _id,
              status: newStatus,
              reason: newStatus === "Disapproved" ? reason : undefined,
            }),
          }
        );

        fetchOffers();

        if (!response.ok) {
          throw new Error("Failed to update status.");
        }

        Swal.fire({
          title: "Success",
          text:
            newStatus === "Approved"
              ? "The status has been successfully updated to Approved."
              : `The status has been successfully updated to Disapproved. Reason: ${reason}`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#7A0E2E",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          },
        });
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire({
          title: "Error",
          text: "Something went wrong updating the status.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#7A0E2E",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          },
        });
      }
    }
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
    const baseUrl = API_BASE_URL || "";
    const prefix = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const path = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    return `${prefix}${path}`;
  };

  const statusCounts = useMemo(() => {
    return {
      total: offers.length,
      pending: offers.filter((o) => o.status === "Pending").length,
      approved: offers.filter((o) => o.status === "Approved").length,
      disapproved: offers.filter((o) => o.status === "Disapproved").length,
    };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Status filter
      if (statusFilter !== "all" && offer.status !== statusFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        offer.offer_name?.toLowerCase().includes(q) ||
        offer.developer_name?.toLowerCase().includes(q) ||
        offer.offer_description?.toLowerCase().includes(q) ||
        offer.status?.toLowerCase().includes(q)
      );
    });
  }, [offers, searchQuery, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOffers.slice(startIndex, startIndex + pageSize);
  }, [filteredOffers, currentPage, pageSize]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6" style={{ minHeight: "100vh" }}>
      {/* Error Alert */}
      {errors && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm rounded-xl mb-3 d-flex align-items-center text-sm"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div className="flex-grow-1">{errors}</div>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setErrors("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Success Alert */}
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
                icon={faGift}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Promotional Offers
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
                  {offers.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Review, moderate, and approve exclusive customer offers submitted by developers
              </p>
            </div>
          </div>

          {/* Action & Stats Summary */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusCounts.pending > 0 && (
              <span
                className="badge rounded-pill px-2.5 py-1 font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  color: "#b45309",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                }}
              >
                <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
                <span>{statusCounts.pending} Pending Review</span>
              </span>
            )}

            <button
              onClick={fetchOffers}
              disabled={loading}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
              style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
              title="Refresh offers"
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
                placeholder="Search by offer name, developer, description..."
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

            {/* Status Filter Dropdown */}
            <div style={{ flex: "0 1 160px", minWidth: "135px" }}>
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
                <option value="all">All Status ({statusCounts.total})</option>
                <option value="Pending">Pending ({statusCounts.pending})</option>
                <option value="Approved">Approved ({statusCounts.approved})</option>
                <option value="Disapproved">Disapproved ({statusCounts.disapproved})</option>
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
              Showing <strong className="text-gray-900">{filteredOffers.length}</strong> of{" "}
              <strong className="text-gray-900">{offers.length}</strong>
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
            OFFERS DATA TABLE (With In-Table Loader & Empty State)
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
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", width: "80px" }}
                >
                  <FontAwesomeIcon icon={faImage} className="mr-1 text-amber-300" />
                  Visual
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "200px" }}
                >
                  <FontAwesomeIcon icon={faTag} className="mr-1.5 text-amber-300" />
                  Offer & Developer
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "260px" }}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="mr-1.5 text-amber-300" />
                  Description
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "130px" }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 text-amber-300" />
                  Status
                </th>
                {canApprove && (
                  <th
                    className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#7A0E2E", width: "120px" }}
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canApprove ? 6 : 5} className="text-center py-12">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2.2rem", height: "2.2rem" }}
                    >
                      <span className="visually-hidden">Loading offers...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading promotional offers...
                    </p>
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={canApprove ? 6 : 5} className="text-center py-12">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: "rgba(122, 14, 46, 0.08)",
                        color: "#7A0E2E",
                      }}
                    >
                      <FontAwesomeIcon icon={faGift} className="text-base" />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {offers.length === 0 ? "No Promotional Offers Found" : "No Matching Offers Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
                      {offers.length === 0
                        ? "Promotional offers created by developers will appear here for review."
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
                        onClick={fetchOffers}
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
                paginatedOffers.map((offer, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const imgSrc = getImageUrl(offer.offer_img);

                  return (
                    <tr
                      key={offer._id || index}
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>

                      {/* Visual Thumbnail */}
                      <td className="py-3 px-2 text-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={offer.offer_name || "Offer"}
                            className="rounded-lg border object-cover shadow-xs inline-block"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderColor: "#E2E8F0",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-lg inline-flex items-center justify-center bg-gray-50 border text-gray-400"
                            style={{ width: "48px", height: "48px" }}
                          >
                            <FontAwesomeIcon icon={faGift} className="opacity-40" />
                          </div>
                        )}
                      </td>

                      {/* Offer & Developer Name */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 text-xs block">
                          {offer.offer_name || "Untitled Offer"}
                        </span>
                        {offer.developer_name && (
                          <span
                            className="badge rounded-pill px-2 py-0.5 font-semibold mt-1 inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(166, 129, 57, 0.12)",
                              color: "#85621e",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
                            <span>{offer.developer_name}</span>
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3">
                        <p
                          className="text-gray-600 text-xs mb-0"
                          style={{
                            maxWidth: "360px",
                            lineHeight: "1.45",
                            wordBreak: "break-word",
                          }}
                        >
                          {offer.offer_description || "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {offer.status === "Pending" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 font-semibold inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(245, 158, 11, 0.12)",
                              color: "#b45309",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
                            <span>Pending</span>
                          </span>
                        )}

                        {offer.status === "Approved" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 font-semibold inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(16, 185, 129, 0.12)",
                              color: "#059669",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                            <span>Approved</span>
                          </span>
                        )}

                        {offer.status === "Disapproved" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 font-semibold inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: "#dc2626",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} className="text-[10px]" />
                            <span>Disapproved</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      {canApprove && (
                        <td className="py-3 px-3 text-center">
                          {offer.status === "Approved" ? (
                            <button
                              className="btn btn-sm btn-outline-danger px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                              onClick={() => handleApproval("Disapproved", offer._id)}
                              title="Disapprove this offer"
                            >
                              <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                              <span>Disapprove</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                              style={{
                                backgroundColor: "#059669",
                                borderColor: "#059669",
                              }}
                              onClick={() => handleApproval("Approved", offer._id)}
                              title="Approve this offer"
                            >
                              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                              <span>Approve</span>
                            </button>
                          )}
                        </td>
                      )}
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
        {!loading && filteredOffers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredOffers.length)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredOffers.length}</strong> offers
            </div>

            <div className="flex items-center gap-2">
              <nav aria-label="Offers pagination">
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

export default Offers;
