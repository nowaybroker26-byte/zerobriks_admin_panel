import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEnvelope,
  faTimesCircle,
  faSquareArrowUpRight,
  faUserTie,
  faHandshake,
  faUsers,
  faCommentDots,
  faArrowLeft,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { MyContext } from "../../App";

const NotificationForm = () => {
  const { can } = useContext(MyContext) || { can: () => true };
  const navigate = useNavigate();

  const [notification_title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [send_to, setSendTo] = useState(["Owner", "Builder", "Buyer"]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const options = [
    {
      label: "Owners",
      value: "Owner",
      icon: faUserTie,
      description: "Property owners and individual sellers",
    },
    {
      label: "Builders",
      value: "Builder",
      icon: faHandshake,
      description: "Real estate developers and project managers",
    },
    {
      label: "Buyers & Tenants",
      value: "Buyer",
      icon: faUsers,
      description: "Home seekers, buyers, and rental tenants",
    },
  ];

  // Toggle individual audience option
  const handleToggleOption = (value) => {
    if (send_to.includes(value)) {
      setSendTo(send_to.filter((item) => item !== value));
    } else {
      setSendTo([...send_to, value]);
    }
  };

  // Toggle all audience options
  const handleToggleAll = () => {
    if (send_to.length === options.length) {
      setSendTo([]);
    } else {
      setSendTo(options.map((opt) => opt.value));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!notification_title.trim()) {
      setError("Please enter a notification title.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a notification message.");
      return;
    }

    if (send_to.length === 0) {
      setError("Please select at least one recipient audience group.");
      return;
    }

    setError("");
    setIsSending(true);

    const sendToString = send_to.join("|");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/send_notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notification_title: notification_title.trim(),
            message: message.trim(),
            send_to: sendToString,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok || responseData.status === 1) {
        await Swal.fire({
          icon: "success",
          title: "Notification Sent!",
          text: "Broadcast notification dispatched successfully to selected users.",
          confirmButtonColor: "#7A0E2E",
          confirmButtonText: "View History",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          },
        });

        navigate("/notificationsList");
      } else {
        const errorMsg =
          responseData?.msg ||
          responseData?.detail ||
          responseData?.error ||
          "Failed to send notification.";

        setError(errorMsg);

        Swal.fire({
          icon: "error",
          title: "Dispatch Failed",
          text: errorMsg,
          confirmButtonColor: "#7A0E2E",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
          },
        });
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      const errMsg = "Network or server error while dispatching notification.";
      setError(errMsg);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errMsg,
        confirmButtonColor: "#7A0E2E",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" style={{ minHeight: "100vh" }}>
      {/* Alert Error Message */}
      {error && (
        <div className="alert alert-danger shadow-sm rounded-xl mb-4 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* ================================================================
            PAGE HEADER (Compact, Theme-Matched #7A0E2E)
        ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
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
                  Send Push Notification
                </h2>
                <span
                  className="badge rounded-pill fw-semibold"
                  style={{
                    backgroundColor: "rgba(122, 14, 46, 0.08)",
                    color: "#7A0E2E",
                    fontSize: "11px",
                    padding: "3px 8px",
                  }}
                >
                  Live Broadcast
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Compose and dispatch mobile push alerts to registered app users
              </p>
            </div>
          </div>

          <Link
            to="/notificationsList"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
            style={{ height: "36px", fontSize: "12px", borderRadius: "8px" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Back to Notifications</span>
          </Link>
        </div>

        {/* ================================================================
            FORM BODY (Clean, Full-Width, Theme-Aligned)
        ================================================================= */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 01 Target Audience Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block m-0">
                <FontAwesomeIcon icon={faUsers} className="mr-1.5 text-[#7A0E2E]" />
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-xs font-semibold text-[#7A0E2E] hover:underline"
              >
                {send_to.length === options.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {options.map((opt) => {
                const isSelected = send_to.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggleOption(opt.value)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                      isSelected
                        ? "border-[#7A0E2E] bg-rose-50/30 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border ${
                        isSelected
                          ? "bg-[#7A0E2E] border-[#7A0E2E] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon
                          icon={opt.icon}
                          className={`text-xs ${
                            isSelected ? "text-[#7A0E2E]" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-[#7A0E2E]" : "text-gray-800"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 m-0 mt-0.5 leading-tight">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 02 Notification Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="notification_title"
                className="text-xs font-bold text-gray-800 uppercase tracking-wider block m-0"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-1.5 text-[#7A0E2E]" />
                Notification Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {notification_title.length}/100
              </span>
            </div>
            <input
              type="text"
              id="notification_title"
              maxLength={100}
              value={notification_title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exclusive Weekend Discount on 2 & 3 BHK Apartments!"
              disabled={isSending}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7A0E2E] focus:ring-1 focus:ring-[#7A0E2E] shadow-xs"
              required
            />
          </div>

          {/* 03 Notification Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="message"
                className="text-xs font-bold text-gray-800 uppercase tracking-wider block m-0"
              >
                <FontAwesomeIcon icon={faCommentDots} className="mr-1.5 text-[#7A0E2E]" />
                Message Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {message.length}/400
              </span>
            </div>
            <textarea
              id="message"
              rows={5}
              maxLength={400}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your broadcast announcement message here. Keep it crisp, compelling, and relevant to app users..."
              disabled={isSending}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7A0E2E] focus:ring-1 focus:ring-[#7A0E2E] shadow-xs"
              required
            />
          </div>

          {/* 04 Action Buttons with Loader during API Calling */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            {can("notifications", "add") && (
              <button
                type="submit"
                disabled={isSending}
                className="btn btn-sm text-white px-4 py-2 font-semibold rounded-xl shadow-xs d-inline-flex align-items-center transition"
                style={{
                  height: "38px",
                  fontSize: "12.5px",
                  backgroundColor: "#7A0E2E",
                  borderColor: "#7A0E2E",
                  opacity: isSending ? 0.8 : 1,
                }}
              >
                {isSending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Dispatching Alert...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSquareArrowUpRight} className="me-2" />
                    <span>Send Broadcast Notification</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={isSending}
              onClick={() => navigate("/notificationsList")}
              className="btn btn-sm btn-outline-secondary px-3.5 py-2 font-semibold rounded-xl text-xs text-gray-600 hover:bg-gray-100"
              style={{ height: "38px", fontSize: "12.5px" }}
            >
              <FontAwesomeIcon icon={faTimesCircle} className="me-1.5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationForm;
