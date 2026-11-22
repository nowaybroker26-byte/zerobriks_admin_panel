import { EP, API_BASE_URL } from '../../Api/endpoints';
import React, { useEffect, useState, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faEnvelope,
  faUserTag,
  faCity,
  faFlag,
  faUsers,
  faUndo,
  faEye,
  faChartLine,
  faSearch,
  faIdBadge,
  faCopy,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import { MyContext } from "../../App";
import UserTrackingModal from "./UserTrackingModal";

// Groups shown in the admin. Agent and Cp have no exact group yet: they are
// grouped with Buyer / Tenant here; change this table if they belong elsewhere.
const USER_TYPE_GROUPS = {
  Builder: "Builder / Developer",
  Owner: "Owner",
  Agent: "Buyer / Tenant",
  Cp: "Buyer / Tenant",
  Buyer: "Buyer / Tenant",
  Tenant: "Buyer / Tenant",
};

const userTypeGroup = (value) => (value ? USER_TYPE_GROUPS[value] || value : "Not set");

// API timestamps (created_at) are stored in UTC without a zone suffix.
const parseApiDate = (value) => {
  if (!value) return null;
  const text = String(value);
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const date = new Date(hasZone ? text : `${text}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatSignupDate = (value) => {
  const date = parseApiDate(value);
  if (!date) return { main: "Not recorded", sub: "" };
  const main = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
  return { main, sub: `${time} IST` };
};

const timeAgo = (value) => {
  const date = parseApiDate(value);
  if (!date) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

const getCustomerId = (customer) => {
  if (customer?.customer_id && String(customer.customer_id).trim()) {
    return String(customer.customer_id).trim().toUpperCase();
  }
  const rawId = String(customer?._id || customer?.id || "");
  if (rawId.toUpperCase().startsWith("ZB-CU-")) {
    return rawId.toUpperCase();
  }
  const suffix = rawId.slice(-6).toUpperCase() || "000000";
  return `ZB-CU-${suffix}`;
};

const CustomerList = () => {
  const { can } = useContext(MyContext) || { can: () => true };
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // User 360° Tracking Dossier Modal State
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Sync URL query params (?search=ZB-CU-2B379E&track=ZB-CU-2B379E)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || params.get("customer_id") || "";
    if (q) {
      setSearchQuery(q);
      setSelectedStatusFilter("All");
    }
  }, [location.search]);

  useEffect(() => {
    fetchCustomers(selectedStatusFilter);
  }, [selectedStatusFilter]);

  // If URL has ?track=ZB-CU-2B379E, auto-open that user's tracking modal once loaded
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trackId = (params.get("track") || "").trim().toUpperCase();
    if (trackId && customers.length > 0) {
      const matched = customers.find((c) => {
        const cid = getCustomerId(c);
        return (
          cid === trackId ||
          cid.endsWith(trackId) ||
          String(c._id || "").toUpperCase() === trackId
        );
      });
      if (matched) {
        setSelectedUserForTracking(matched);
        setIsTrackingModalOpen(true);
      }
    }
  }, [location.search, customers]);

  const fetchCustomers = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${EP.API_GET_USERS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter_by_status: status === "All" ? null : status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers.");
      }

      const result = await response.json();

      if (result.status === 1 && Array.isArray(result.data)) {
        const normalized = result.data.map((u) => ({
          ...u,
          customer_id: getCustomerId(u),
        }));
        setCustomers(normalized);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered customers by search query (Customer ID ZB-CU-XXXXXX, Name, Mobile, Email, City, User Type)
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const cid = getCustomerId(c).toLowerCase();
      const rawId = String(c._id || "").toLowerCase();
      const name = String(c.full_name || "").toLowerCase();
      const mobile = String(c.mobile_number || "").toLowerCase();
      const email = String(c.email || "").toLowerCase();
      const city = String(c.city || "").toLowerCase();
      const type = String(c.user_type || "").toLowerCase();
      return (
        cid.includes(q) ||
        rawId.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        email.includes(q) ||
        city.includes(q) ||
        type.includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Reset to page 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleOpenUserTracking = (customer) => {
    setSelectedUserForTracking({
      ...customer,
      customer_id: getCustomerId(customer),
    });
    setIsTrackingModalOpen(true);
  };

  const handleCopyId = (e, cid) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cid);
      setCopiedId(cid);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleStatusChange = async (currentStatus, _id) => {
    const newStatus = currentStatus === "Verified" ? "Block" : "Verified";

    if (
      window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    ) {
      try {
        setSuccess("");
        setErrors("");

        await fetch(
          `${EP.API_UPDATE_USER_STATUS}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: _id,
              status: newStatus,
            }),
          }
        );

        setCustomers((prev) =>
          prev.map((c) => (c._id === _id ? { ...c, status: newStatus } : c))
        );

        if (newStatus === "Verified") {
          setSuccess("The user has been unblocked successfully.");
        } else {
          setErrors("The user has been blocked successfully.");
        }

        fetchCustomers(selectedStatusFilter);
      } catch (error) {
        console.error("Error updating customer status:", error);
        setCustomers((prev) =>
          prev.map((c) => (c._id === _id ? { ...c, status: newStatus } : c))
        );
      }
    }
  };

  const handleRestoreUser = async (_id) => {
    const confirm = await Swal.fire({
      title: "Restore User?",
      text: "Are you sure you want to restore this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, restore!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${EP.CUST_API_RESTORE_USER}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: _id,
            }),
          }
        );

        const result = await response.json();

        if (result.status === 1) {
          Swal.fire("Restored!", "User has been restored.", "success");
          fetchCustomers(selectedStatusFilter);
        } else {
          Swal.fire(
            "Error",
            result.message || "Failed to restore user.",
            "error"
          );
        }
      } catch (error) {
        console.error("Restore error:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  if (isTrackingModalOpen && selectedUserForTracking) {
    return (
      <UserTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          if (location.search.includes("track=")) {
            navigate("/customers", { replace: true });
          }
        }}
        user={selectedUserForTracking}
        onStatusChange={(userId, newStatus) => {
          setCustomers((prev) =>
            prev.map((c) =>
              c._id === userId ? { ...c, status: newStatus } : c
            )
          );
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Notifications */}
      {errors && (
        <div className="alert alert-danger shadow-sm rounded-xl mb-4 text-sm flex items-center justify-between">
          <span>{errors}</span>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setErrors("")}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success shadow-sm rounded-xl mb-4 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button
            type="button"
            className="btn-close text-xs"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* ================================================================
            PAGE HEADER & HERO BADGE
        ================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-lg text-amber-300"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight m-0">
                  User Intelligence & Tracking Portal
                </h2>
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  Search any user by their unique ID (e.g.{" "}
                  <span className="font-mono font-bold text-[#7A0E2E]">
                    ZB-CU-2B379E
                  </span>
                  ), Name, Mobile, Email, or City, or click a row to open their
                  360° profile.
                </p>
              </div>
            </div>
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 mr-1 hidden sm:inline">
              Filter:
            </span>
            {["All", "Verified", "Unverified", "Block"].map((status) => {
              const isSelected = selectedStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                    isSelected
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }
                      : {}
                  }
                >
                  {status === "Block" ? "Blocked" : status}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================
            SEARCH BY UNIQUE CUSTOMER ID (ZB-CU-XXXXXX) / NAME / MOBILE / CITY
        ================================================================= */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200/80">
          <div className="relative flex-1 max-w-xl">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (location.search) {
                  navigate("/customers", { replace: true });
                }
              }}
              placeholder="Search by Unique User ID (e.g. ZB-CU-2B379E), Name, Mobile, Email, City..."
              className="w-full pl-9 pr-9 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7A0E2E] shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  if (location.search) {
                    navigate("/customers", { replace: true });
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                title="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>
              Showing{" "}
              <strong className="text-gray-900">
                {filteredCustomers.length}
              </strong>{" "}
              of <strong className="text-gray-900">{customers.length}</strong>{" "}
              users
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#7A0E2E]"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Quick Instructions Notice Banner */}
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/70 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="text-[#7A0E2E]" />
            <span className="text-gray-700">
              <strong className="text-[#7A0E2E]">
                Unique Customer ID Active:
              </strong>{" "}
              Every user has a permanent database ID (e.g.{" "}
              <code className="font-mono font-bold text-[#7A0E2E]">
                ZB-CU-2B379E
              </code>
              ). Click any row to inspect their 360° dossier.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] text-[#52091D] hidden md:inline">
            ZEROBRIKS CRM
          </span>
        </div>

        {/* ================================================================
            CUSTOMER DATA TABLE
        ================================================================= */}
        <div className="overflow-x-auto mt-4">
          <table
            className="table table-hover align-middle border-separate border-spacing-0 w-full"
            style={{ borderRadius: "10px", overflow: "hidden" }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#7A0E2E",
                  color: "#FFFFFF",
                }}
              >
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-center text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  #
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faIdBadge}
                    className="mr-1.5 text-amber-300"
                  />
                  Customer ID
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="mr-1.5 text-amber-300"
                  />
                  Profile & Name
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mr-1.5 text-amber-300"
                  />
                  Contact & City
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faUserTag}
                    className="mr-1.5 text-amber-300"
                  />
                  User Type
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  Signed Up
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="mr-1.5 text-amber-300"
                  />
                  Status
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-center text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  Actions & Tracking
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-xs text-gray-500 font-semibold"
                  >
                    Loading users from database...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-xs text-gray-500 font-semibold"
                  >
                    No users found matching{" "}
                    {searchQuery ? `"${searchQuery}"` : "the selected filter"}.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => {
                  const isVerified = customer.status === "Verified";
                  const cid = getCustomerId(customer);
                  const rowNum = (currentPage - 1) * pageSize + index + 1;
                  const signup = formatSignupDate(customer.created_at);
                  const signedAgo = timeAgo(customer.created_at);

                  return (
                    <tr
                      key={customer._id || index}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group border-b border-gray-100"
                      onClick={() => handleOpenUserTracking(customer)}
                    >
                      {/* Index */}
                      <td className="text-center text-xs font-semibold text-gray-500 py-3.5 px-3">
                        {rowNum}
                      </td>

                      {/* Unique Customer ID (e.g. ZB-CU-2B379E) */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/80 border border-[#7A0E2E]/20">
                          <span className="font-mono text-xs font-bold text-[#7A0E2E] tracking-tight">
                            {cid}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, cid)}
                            className="text-gray-400 hover:text-[#7A0E2E] transition-colors"
                            title="Copy Customer ID"
                          >
                            <FontAwesomeIcon
                              icon={copiedId === cid ? faCheck : faCopy}
                              className={`text-[11px] ${
                                copiedId === cid ? "text-emerald-600" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Profile & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-rose-50 border border-[#7A0E2E]/20 text-[#7A0E2E] flex items-center justify-center font-bold text-sm shadow-sm select-none">
                              {(customer.full_name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {customer.profile_image && (
                              <img
                                src={
                                  customer.profile_image.startsWith("http")
                                    ? customer.profile_image
                                    : `${API_BASE_URL}/${customer.profile_image}`
                                }
                                alt=""
                                className="absolute inset-0 w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                isVerified ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-[#7A0E2E] transition-colors flex items-center gap-1.5">
                              {customer.full_name || "Unnamed User"}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-[#7A0E2E] font-semibold border border-amber-300">
                                Track 360°
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 block">
                              {customer.company_name || "Individual"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details & City */}
                      <td className="py-3.5 px-3 text-xs">
                        <div className="font-semibold text-gray-800">
                          {customer.mobile_number || "No contact"}
                        </div>
                        <div className="text-gray-500 text-[11px] truncate max-w-xs">
                          {customer.email || "No email"}
                        </div>
                        <div className="text-gray-600 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                          <FontAwesomeIcon
                            icon={faCity}
                            className="text-[#7A0E2E] text-[10px]"
                          />
                          {customer.city || "Not set"}
                        </div>
                      </td>

                      {/* User Type */}
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {userTypeGroup(customer.user_type)}
                        </span>
                      </td>

                      {/* Sign-up date */}
                      <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                        <div className="font-semibold text-gray-800">{signup.main}</div>
                        <div className="text-[11px] text-gray-500">
                          {[signup.sub, signedAgo].filter(Boolean).join(" · ")}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : customer.status === "Block"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVerified
                                ? "bg-emerald-500"
                                : customer.status === "Block"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          ></span>
                          {customer.status || "Not set"}
                        </span>
                      </td>

                      {/* Actions & Tracking Button */}
                      <td className="py-3.5 px-3 text-center">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Track User Button */}
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all flex items-center gap-1"
                            style={{ backgroundColor: "#7A0E2E" }}
                            onClick={() => handleOpenUserTracking(customer)}
                            title="Open 360° User Tracking Dossier"
                          >
                            <FontAwesomeIcon
                              icon={faEye}
                              className="text-[11px] text-amber-300"
                            />
                            <span>Track User</span>
                          </button>

                          {/* Block / Unblock Button */}
                          {customer.deleted_at ? (
                            can("users", "approve") && (
                              <button
                                className="btn btn-warning btn-sm text-xs py-1 px-2"
                                title="Restore User"
                                onClick={() => handleRestoreUser(customer._id)}
                              >
                                <FontAwesomeIcon icon={faUndo} /> Restore
                              </button>
                            )
                          ) : (
                            <button
                              className={`btn btn-sm text-xs py-1 px-2.5 ${
                                isVerified
                                  ? "btn-outline-danger"
                                  : "btn-outline-success"
                              }`}
                              onClick={() =>
                                handleStatusChange(
                                  customer.status,
                                  customer._id
                                )
                              }
                              title={isVerified ? "Block User" : "Unblock User"}
                            >
                              {isVerified ? "Block" : "Unblock"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-xs text-gray-600">
            <div>
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white font-semibold disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white font-semibold disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
