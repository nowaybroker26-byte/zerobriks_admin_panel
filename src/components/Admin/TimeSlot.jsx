import { EP } from '../../Api/endpoints';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faPlus,
  faTrash,
  faCheck,
  faTimes,
  faArrowLeft,
  faCalendarAlt,
  faCheckCircle,
  faExclamationTriangle,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";

const TimeSlot = () => {
  const [fetchedTimeSlots, setFetchedTimeSlots] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const backPath = isAdminPath ? "/admin/admin-settings" : "/admin-settings";
  const userId = "6717701e821a4461403531d8";

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${EP.CUST_API_GET_TIMESLOT}`,
        { user_id: userId }
      );

      if (response.status === 200 && response.data?.data) {
        setFetchedTimeSlots(response.data.data);
      } else {
        setFetchedTimeSlots([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setFetchedTimeSlots([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Format time to 12-hour AM/PM string
  const formatTimeTo12Hour = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const handleAddTimeSlot = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fromTime || !toTime) {
      setError("Please select both 'From Time' and 'To Time'.");
      return;
    }

    const formattedFromTime = formatTimeTo12Hour(fromTime);
    const formattedToTime = formatTimeTo12Hour(toTime);
    const timeslot = `${formattedFromTime} - ${formattedToTime}`;

    setAddingSlot(true);
    try {
      const response = await axios.post(
        `${EP.CUST_API_ADD_TIMESLOT}`,
        {
          user_id: userId,
          timeslot,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess("Timeslot added successfully!");
        setFromTime("");
        setToTime("");
        setShowAddModal(false);
        fetchTimeSlots();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to add timeslot. Please try again.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("An error occurred while adding the timeslot.");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteTimeSlot = async () => {
    if (!deleteConfirmationId) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(
        `${EP.CUST_API_DELETE_TIMESLOT}`,
        {
          data: { timeslot_id: deleteConfirmationId },
        }
      );

      if (response.status === 200) {
        setSuccess("Timeslot deleted successfully!");
        fetchTimeSlots();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to delete timeslot. Please try again.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("An error occurred while deleting the timeslot.");
    } finally {
      setDeleteConfirmationId(null);
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Alerts */}
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
            onClick={() => setError(null)}
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
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to={backPath}
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Settings Hub
              </Link>
              <span className="text-muted small">•</span>
              <span
                className="badge rounded-pill px-2.5 py-0.5 fw-bold text-uppercase"
                style={{
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  color: "#1d4ed8",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                Scheduling Engine
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  color: "#1d4ed8",
                }}
              >
                <FontAwesomeIcon icon={faClock} />
              </span>
              Virtual Tour Time Slots
            </h3>
            <p className="text-muted small mb-0">
              Configure standard inspection and virtual walkthrough time windows available for bookings.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchTimeSlots}
              disabled={fetchLoading}
              className="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`me-1.5 ${fetchLoading ? "fa-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1.5" />
              Add Time Slot
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small fw-semibold">
            Active Scheduling Slots: <strong className="text-dark">{fetchedTimeSlots.length}</strong>
          </span>
        </div>

        {/* Loading Spinner */}
        {fetchLoading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading timeslots...</span>
            </div>
            <p className="text-muted mt-2 small">Loading time slot windows...</p>
          </div>
        )}

        {/* Empty State */}
        {!fetchLoading && fetchedTimeSlots.length === 0 && (
          <div className="text-center py-5 border rounded-4 bg-light my-2">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                color: "#1d4ed8",
              }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
            </div>
            <h5 className="fw-bold text-dark mb-1">No Time Slots Configured</h5>
            <p className="text-muted small mb-3">
              Add your first appointment slot window so users can schedule live walkthroughs.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-sm text-white px-3.5 py-2 rounded-pill fw-semibold shadow-xs"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1.5" />
              Add Time Slot
            </button>
          </div>
        )}

        {/* Timeslots List / Grid */}
        {!fetchLoading && fetchedTimeSlots.length > 0 && (
          <div className="row g-3">
            {fetchedTimeSlots.map((slot) => {
              const isDeleting = deleteConfirmationId === slot._id;

              return (
                <div key={slot._id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="p-3.5 rounded-3 border bg-white shadow-xs transition d-flex align-items-center justify-content-between"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: "rgba(122, 14, 46, 0.1)",
                          color: "#7A0E2E",
                        }}
                      >
                        <FontAwesomeIcon icon={faClock} size="sm" />
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: "14px" }}>
                          {slot.timeslot}
                        </span>
                        <span
                          className="badge rounded-pill px-2 py-0.5 fw-semibold"
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            color: "#059669",
                            fontSize: "10px",
                          }}
                        >
                          Available Window
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      {isDeleting ? (
                        <div className="d-flex gap-1.5 align-items-center">
                          <button
                            className="btn btn-danger btn-sm rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                            style={{ fontSize: "11px" }}
                            onClick={handleDeleteTimeSlot}
                          >
                            <FontAwesomeIcon icon={faCheck} className="me-1" /> Yes
                          </button>
                          <button
                            className="btn btn-light btn-sm border rounded-pill px-2 py-1 fw-semibold text-muted"
                            style={{ fontSize: "11px" }}
                            onClick={() => setDeleteConfirmationId(null)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderColor: "#FCA5A5",
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                          }}
                          onClick={() => setDeleteConfirmationId(slot._id)}
                          title="Delete this slot"
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add TimeSlot Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-1">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "rgba(122, 14, 46, 0.1)",
                      color: "#7A0E2E",
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} size="xs" />
                  </div>
                  <h5 className="modal-title fw-bold text-dark">Add New Time Slot</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <div className="modal-body pt-2">
                <p className="text-muted small mb-3">
                  Select start and end time window for live virtual property tours.
                </p>

                <form onSubmit={handleAddTimeSlot}>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="fromTime" className="form-label small fw-semibold text-dark">
                        From Time
                      </label>
                      <input
                        type="time"
                        id="fromTime"
                        value={fromTime}
                        onChange={(e) => setFromTime(e.target.value)}
                        className="form-control rounded-3 shadow-none"
                        style={{ borderColor: "#CBD5E1" }}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="toTime" className="form-label small fw-semibold text-dark">
                        To Time
                      </label>
                      <input
                        type="time"
                        id="toTime"
                        value={toTime}
                        onChange={(e) => setToTime(e.target.value)}
                        className="form-control rounded-3 shadow-none"
                        style={{ borderColor: "#CBD5E1" }}
                        required
                      />
                    </div>
                  </div>

                  {fromTime && toTime && (
                    <div
                      className="p-2.5 rounded-3 mb-3 border text-center"
                      style={{
                        backgroundColor: "rgba(122, 14, 46, 0.06)",
                        borderColor: "rgba(122, 14, 46, 0.2)",
                      }}
                    >
                      <span className="text-muted small d-block">Slot Preview:</span>
                      <strong style={{ color: "#7A0E2E" }}>
                        {formatTimeTo12Hour(fromTime)} - {formatTimeTo12Hour(toTime)}
                      </strong>
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingSlot}
                      className="btn text-white rounded-pill px-4 py-1.5 fw-semibold shadow-xs"
                      style={{ backgroundColor: "#7A0E2E" }}
                    >
                      {addingSlot ? "Adding..." : "Add Time Slot"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlot;
