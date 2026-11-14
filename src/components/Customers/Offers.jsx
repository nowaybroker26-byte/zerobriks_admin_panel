import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
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
  faArrowLeft,
  faSyncAlt,
  faExclamationTriangle,
  faFilter,
  faBuilding,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { MyContext } from "../../App";

const Offers = () => {
  /*
  |--------------------------------------------------------------------------
  | Context & Permissions
  |--------------------------------------------------------------------------
  */
  const { can } = useContext(MyContext) || {};
  const canApprove = typeof can === "function" ? can("offers", "approve") : true;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /*
  |--------------------------------------------------------------------------
  | Fetch Offers
  |--------------------------------------------------------------------------
  */
  const fetchOffers = async () => {
    setLoading(true);
    setErrors("");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/get_offers`
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

  /*
  |--------------------------------------------------------------------------
  | Handle Approve / Disapprove
  |--------------------------------------------------------------------------
  */
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
      });

      proceed = confirmResult.isConfirmed;
    }

    if (proceed) {
      try {
        setSuccess("");
        setErrors("");

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/update_offer_status`,
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
        });
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire({
          title: "Error",
          text: "Something went wrong updating the status.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#7A0E2E",
        });
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Helpers & Computed Properties
  |--------------------------------------------------------------------------
  */
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
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
      const q = searchQuery.toLowerCase();
      return (
        offer.offer_name?.toLowerCase().includes(q) ||
        offer.developer_name?.toLowerCase().includes(q) ||
        offer.offer_description?.toLowerCase().includes(q) ||
        offer.status?.toLowerCase().includes(q)
      );
    });
  }, [offers, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage) || 1;
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOffers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOffers, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Error Alert */}
      {errors && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div className="flex-grow-1">{errors}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrors("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Success Alert */}
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
                Marketing & Promotions
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
                <FontAwesomeIcon icon={faGift} />
              </span>
              Promotional Offers
            </h3>
            <p className="text-muted small mb-0">
              Review, moderate, and approve exclusive customer offers submitted by developers.
            </p>
          </div>

          {/* Action & Refresh */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 flex-wrap">
            <button
              onClick={fetchOffers}
              disabled={loading}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
              title="Refresh offers"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`me-1.5 ${loading ? "fa-spin" : ""}`}
              />
              Refresh Offers
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
                placeholder="Search by offer name, developer, description..."
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
              <FontAwesomeIcon icon={faFilter} className="me-1 text-muted" /> Status:
            </span>
            {[
              { id: "all", label: "All", count: statusCounts.total },
              { id: "Pending", label: "Pending", count: statusCounts.pending },
              { id: "Approved", label: "Approved", count: statusCounts.approved },
              { id: "Disapproved", label: "Disapproved", count: statusCounts.disapproved },
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
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Total Offers: <strong className="text-dark">{offers.length}</strong>
            {searchQuery || statusFilter !== "all" ? (
              <span className="text-muted ms-2">
                (Showing <strong>{filteredOffers.length}</strong> matching)
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
              <span className="visually-hidden">Loading offers...</span>
            </div>
            <p className="text-muted mt-2 small">Loading promotional offers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOffers.length === 0 && (
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
              <FontAwesomeIcon icon={faGift} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {offers.length === 0 ? "No Promotional Offers Found" : "No Matching Offers"}
            </h5>
            <p className="text-muted small mb-3">
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
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={fetchOffers}
                className="btn btn-sm text-white px-3.5 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Reload
              </button>
            )}
          </div>
        )}

        {/* Offers Table */}
        {!loading && filteredOffers.length > 0 && (
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
                  <th style={{ width: "90px" }} className="py-3 text-center">
                    <FontAwesomeIcon icon={faImage} className="me-1 text-muted" />
                    Visual
                  </th>
                  <th style={{ minWidth: "200px" }} className="py-3">
                    <FontAwesomeIcon icon={faTag} className="me-1.5 text-muted" />
                    Offer & Developer
                  </th>
                  <th style={{ minWidth: "260px" }} className="py-3">
                    <FontAwesomeIcon icon={faFileAlt} className="me-1.5 text-muted" />
                    Description
                  </th>
                  <th style={{ minWidth: "140px" }} className="py-3 text-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1.5 text-muted" />
                    Status
                  </th>
                  {canApprove && (
                    <th style={{ width: "130px" }} className="py-3 text-center">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedOffers.map((offer, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const imgSrc = getImageUrl(offer.offer_img);

                  return (
                    <tr
                      key={offer._id || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {rowNumber}
                      </td>

                      {/* Visual Thumbnail */}
                      <td className="py-3 text-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={offer.offer_name || "Offer"}
                            className="rounded-3 border object-fit-cover shadow-xs"
                            style={{
                              width: "56px",
                              height: "56px",
                              borderColor: "#E2E8F0",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-3 d-inline-flex align-items-center justify-content-center bg-light border text-muted"
                            style={{ width: "56px", height: "56px" }}
                          >
                            <FontAwesomeIcon icon={faGift} className="opacity-50" />
                          </div>
                        )}
                      </td>

                      {/* Offer & Developer Name */}
                      <td className="py-3">
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: "14px" }}>
                          {offer.offer_name || "Untitled Offer"}
                        </span>
                        {offer.developer_name && (
                          <span
                            className="badge rounded-pill px-2 py-0.5 fw-semibold mt-1 d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "rgba(166, 129, 57, 0.12)",
                              color: "#85621e",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faBuilding} className="me-1" size="xs" />
                            {offer.developer_name}
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3">
                        <p
                          className="text-muted small mb-0"
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
                      <td className="py-3 text-center">
                        {offer.status === "Pending" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "rgba(245, 158, 11, 0.12)",
                              color: "#b45309",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faSpinner} spin className="me-1.5" />
                            Pending
                          </span>
                        )}

                        {offer.status === "Approved" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "rgba(16, 185, 129, 0.12)",
                              color: "#059669",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} className="me-1.5" />
                            Approved
                          </span>
                        )}

                        {offer.status === "Disapproved" && (
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: "#dc2626",
                              fontSize: "11px",
                            }}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} className="me-1.5" />
                            Disapproved
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      {canApprove && (
                        <td className="py-3 text-center">
                          {offer.status === "Approved" ? (
                            <button
                              className="btn btn-sm btn-outline-danger px-3 py-1 rounded-pill fw-semibold shadow-xs transition d-inline-flex align-items-center"
                              style={{ fontSize: "12px" }}
                              onClick={() => handleApproval("Disapproved", offer._id)}
                              title="Disapprove this offer"
                            >
                              <FontAwesomeIcon icon={faTimes} className="me-1" />
                              Disapprove
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm text-white px-3 py-1 rounded-pill fw-semibold shadow-xs transition d-inline-flex align-items-center"
                              style={{
                                backgroundColor: "#059669",
                                borderColor: "#059669",
                                fontSize: "12px",
                              }}
                              onClick={() => handleApproval("Approved", offer._id)}
                              title="Approve this offer"
                            >
                              <FontAwesomeIcon icon={faCheck} className="me-1" />
                              Approve
                            </button>
                          )}
                        </td>
                      )}
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
                {Math.min(currentPage * itemsPerPage, filteredOffers.length)}
              </strong>{" "}
              of <strong>{filteredOffers.length}</strong> offers
            </span>

            <nav aria-label="Offers pagination">
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

export default Offers;
