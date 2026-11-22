import { EP, API_BASE_URL } from "../../Api/endpoints";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faEye,
  faIdBadge,
  faSearch,
  faCity,
  faBuilding,
  faCheckCircle,
  faCalendarAlt,
  faTimes,
  faUndo,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import UserTrackingModal from "./UserTrackingModal";

const getCustomerId = (item) => {
  if (item?.customer_id && String(item.customer_id).trim()) {
    return String(item.customer_id).trim().toUpperCase();
  }
  const rawId = String(item?._id || item?.id || "");
  return `ZB-CU-${rawId.slice(-6).toUpperCase() || "000000"}`;
};

const formatRegDate = (dateStr) => {
  if (!dateStr) return "�";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const DeveloperList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Filters state (All filters EXCEPT user type, laid out horizontally)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedVerification, setSelectedVerification] = useState("All");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setErrors("");
      const response = await axios.post(
        `${EP?.API_GET_USERS || `${process.env.REACT_APP_API_BASE_URL}/api/get_users`}`,
        {
          user_type: "Builder",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === 1 && Array.isArray(response.data.data)) {
        const buildersWithStatus = response.data.data.map((customer) => ({
          ...customer,
          customer_id: getCustomerId(customer),
          status: customer.status || "Verified",
        }));
        setItems(buildersWithStatus);
      } else {
        setItems([]);
      }

    } catch (error) {
      console.error("Failed to fetch builders/developers:", error);
      setErrors("Failed to fetch builders & developers.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Available unique cities
  const availableCities = useMemo(() => {
    const set = new Set();
    items.forEach((c) => {
      const city = String(c.city || "").trim();
      if (city) {
        const formatted = city
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        set.add(formatted);
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Active filters detection and count
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCity !== "All" ||
    selectedVerification !== "All" ||
    selectedAccountStatus !== "All" ||
    selectedDateRange !== "All" ||
    Boolean(customStartDate) ||
    Boolean(customEndDate) ||
    sortBy !== "latest";

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCity !== "All") count++;
    if (selectedVerification !== "All") count++;
    if (selectedAccountStatus !== "All") count++;
    if (selectedDateRange !== "All") count++;
    if (customStartDate || customEndDate) count++;
    if (sortBy !== "latest") count++;
    return count;
  }, [
    searchQuery,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedCity("All");
    setSelectedVerification("All");
    setSelectedAccountStatus("All");
    setSelectedDateRange("All");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("latest");
    setCurrentPage(1);
  };

  // Filter items based on the 6 filters
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Search Query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const cid = getCustomerId(item).toLowerCase();
        const rawId = String(item._id || "").toLowerCase();
        const name = String(item.full_name || item.developer_name || "").toLowerCase();
        const company = String(item.company_name || "").toLowerCase();
        const email = String(item.email || "").toLowerCase();
        const mobile = String(item.mobile_number || "").toLowerCase();
        const city = String(item.city || "").toLowerCase();
        return (
          cid.includes(q) ||
          rawId.includes(q) ||
          name.includes(q) ||
          company.includes(q) ||
          email.includes(q) ||
          mobile.includes(q) ||
          city.includes(q)
        );
      });
    }

    // 2. City
    if (selectedCity !== "All") {
      result = result.filter((item) => {
        const cCity = String(item.city || "").trim().toLowerCase();
        return cCity === selectedCity.toLowerCase();
      });
    }

    // 3. Verification Status
    if (selectedVerification !== "All") {
      result = result.filter((item) => {
        const statusLower = String(item.status || "").trim().toLowerCase();
        const isVerified = statusLower === "verified";
        if (selectedVerification === "Verified") return isVerified;
        if (selectedVerification === "Unverified") return !isVerified;
        return true;
      });
    }

    // 4. Account Status
    if (selectedAccountStatus !== "All") {
      result = result.filter((item) => {
        const statusLower = String(item.status || "").trim().toLowerCase();
        const isBlocked = statusLower === "block" || statusLower === "blocked";
        const isInactive = Boolean(item.deleted_at) || statusLower === "inactive";
        const isActive = !isBlocked && !isInactive;

        if (selectedAccountStatus === "Blocked") return isBlocked;
        if (selectedAccountStatus === "Inactive") return isInactive;
        if (selectedAccountStatus === "Active") return isActive;
        return true;
      });
    }

    // 5. Registration Date
    if (selectedDateRange !== "All") {
      const now = new Date();
      result = result.filter((item) => {
        if (!item.created_at) return false;
        const regDate = new Date(item.created_at);
        if (isNaN(regDate.getTime())) return true;

        if (selectedDateRange === "today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return regDate >= startOfToday;
        }
        if (selectedDateRange === "last_7_days") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return regDate >= sevenDaysAgo;
        }
        if (selectedDateRange === "last_30_days") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return regDate >= thirtyDaysAgo;
        }
        if (selectedDateRange === "custom") {
          if (customStartDate) {
            const targetDate = new Date(customStartDate + "T00:00:00");
            const startOfDay = new Date(
              targetDate.getFullYear(),
              targetDate.getMonth(),
              targetDate.getDate(),
              0,
              0,
              0,
              0
            );
            const endOfDay = new Date(
              targetDate.getFullYear(),
              targetDate.getMonth(),
              targetDate.getDate(),
              23,
              59,
              59,
              999
            );
            return regDate >= startOfDay && regDate <= endOfDay;
          }
          return true;
        }
        if (selectedDateRange === "date_range") {
          if (customStartDate) {
            const cStart = new Date(customStartDate + "T00:00:00");
            if (regDate < cStart) return false;
          }
          if (customEndDate) {
            const cEnd = new Date(customEndDate + "T23:59:59.999");
            if (regDate > cEnd) return false;
          }
          return true;
        }
        return true;
      });
    }

    // 6. Sort By
    result.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === "oldest") {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    return result;
  }, [
    items,
    searchQuery,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
    pageSize,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {errors && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          <span>{errors}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrors("")}
          ></button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl text-white shadow-xs"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faBuilding} className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-gray-900 m-0">
                  Builders & Developers List
                </h4>
                <span
                  className="badge rounded-pill fw-semibold"
                  style={{
                    backgroundColor: "rgba(122, 14, 46, 0.08)",
                    color: "#7A0E2E",
                    fontSize: "12px",
                    padding: "4px 9px",
                  }}
                >
                  {items.length} Total
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Manage, search, track, and view registered builder & developer partners
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredItems.length}</strong> of{" "}
            <strong className="text-gray-900">{items.length}</strong> builders
          </div>
        </div>

        {/* ================================================================
            HORIZONTAL SCROLLABLE FILTER TOOLBAR (WITH TOP RESET BUTTON)
        ================================================================= */}
        <div className="bg-gray-50/90 border border-gray-200/90 rounded-2xl p-2.5 sm:p-3 mb-4 mt-3 shadow-xs">
          {/* Top Bar: Always Visible Reset Button & Filter Status */}
          <div className="flex items-center justify-between gap-3 mb-2.5 px-0.5 border-b border-gray-200/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFilter} className="text-[#7A0E2E] text-xs" />
                <span>Filter & Search</span>
              </span>
              {hasActiveFilters && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#7A0E2E]/10 text-[#7A0E2E]">
                  {activeFiltersCount} active
                </span>
              )}
            </div>

            {/* Reset Button - Prominently at Top */}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer hover:opacity-95"
                style={{ backgroundColor: "#7A0E2E" }}
                title="Reset all filters to default"
              >
                <FontAwesomeIcon icon={faUndo} className="text-xs" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60"
                title="No active filters to reset"
              >
                <FontAwesomeIcon icon={faUndo} className="text-xs" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-1"
            style={{
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* 1. Search */}
            <div className="flex-shrink-0" style={{ width: "230px" }}>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, Name, Mobile, Email..."
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7A0E2E]"
                  style={{ height: "36px" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. City */}
            <div className="flex-shrink-0" style={{ width: "145px" }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Verification Status */}
            <div className="flex-shrink-0" style={{ width: "145px" }}>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            {/* 4. Account Status */}
            <div className="flex-shrink-0" style={{ width: "145px" }}>
              <select
                value={selectedAccountStatus}
                onChange={(e) => setSelectedAccountStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* 5. Registration Date */}
            <div className="flex-shrink-0" style={{ width: "155px" }}>
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  if (
                    e.target.value === "All" ||
                    e.target.value === "today" ||
                    e.target.value === "last_7_days" ||
                    e.target.value === "last_30_days"
                  ) {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">All Dates</option>
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="custom">Custom Date</option>
                <option value="date_range">Date Range</option>
              </select>
            </div>

            {/* Custom Single Date (Particular Date) with Calendar Picker */}
            {selectedDateRange === "custom" && (
              <div className="flex-shrink-0" style={{ width: "175px" }}>
                <div
                  className="relative flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#7A0E2E] focus-within:border-[#7A0E2E] transition-colors"
                  style={{ height: "36px" }}
                  onClick={(e) => {
                    const inp = e.currentTarget.querySelector("input[type='date']");
                    if (inp && inp.showPicker) {
                      try {
                        inp.showPicker();
                      } catch (_) {}
                    }
                  }}
                  title="Click to open calendar and select particular date"
                >
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-[#7A0E2E] text-xs mr-2 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                  />
                  {customStartDate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomStartDate("");
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-1 p-0.5"
                      title="Clear date"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom Date Range (From - To) with Calendar Pickers */}
            {selectedDateRange === "date_range" && (
              <>
                <div className="flex-shrink-0" style={{ width: "165px" }}>
                  <div
                    className="relative flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#7A0E2E] focus-within:border-[#7A0E2E] transition-colors"
                    style={{ height: "36px" }}
                    onClick={(e) => {
                      const inp = e.currentTarget.querySelector("input[type='date']");
                      if (inp && inp.showPicker) {
                        try {
                          inp.showPicker();
                        } catch (_) {}
                      }
                    }}
                    title="From Date"
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-[#7A0E2E] text-xs mr-2 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                    />
                    {customStartDate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomStartDate("");
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-1 p-0.5"
                        title="Clear start date"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0" style={{ width: "165px" }}>
                  <div
                    className="relative flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#7A0E2E] focus-within:border-[#7A0E2E] transition-colors"
                    style={{ height: "36px" }}
                    onClick={(e) => {
                      const inp = e.currentTarget.querySelector("input[type='date']");
                      if (inp && inp.showPicker) {
                        try {
                          inp.showPicker();
                        } catch (_) {}
                      }
                    }}
                    title="To Date"
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-[#7A0E2E] text-xs mr-2 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                    />
                    {customEndDate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomEndDate("");
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-1 p-0.5"
                        title="Clear end date"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 6. Sort By */}
            <div className="flex-shrink-0" style={{ width: "155px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="latest">Latest Registered</option>
                <option value="oldest">Oldest Registered</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="flex-shrink-0" style={{ width: "105px" }}>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto mt-4">
          <table className="table table-hover align-middle border-separate border-spacing-0 w-full mb-0">
            <thead style={{ backgroundColor: "#7A0E2E", color: "#fff" }}>
              <tr>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E", width: "45px" }}
                >
                  #
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faIdBadge} className="mr-1.5 text-amber-300" />
                  Customer ID
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 text-amber-300" />
                  Builder / Developer
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-1.5 text-amber-300" />
                  Email
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-1.5 text-amber-300" />
                  Mobile Number
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faCity} className="mr-1.5 text-amber-300" />
                  City
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 text-amber-300" />
                  Status
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 text-amber-300" />
                  Registered Date
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-center text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon icon={faEye} className="mr-1.5 text-amber-300" />
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                      style={{ color: "#7A0E2E", width: "2rem", height: "2rem" }}
                    >
                      <span className="visually-hidden">Loading builders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length ? (
                paginatedItems.map((item, index) => {
                  const cid = getCustomerId(item);
                  const isVerified = (item.status || "").toLowerCase() === "verified";
                  const rowNum = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-amber-50/40 cursor-pointer"
                      onClick={() => {
                        setSelectedUserForTracking(item);
                        setIsTrackingModalOpen(true);
                      }}
                    >
                      <td className="py-3 px-3 text-xs font-semibold text-gray-500">
                        {rowNum}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-rose-50 text-[#7A0E2E] border border-[#7A0E2E]/20">
                          {cid}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-gray-900">
                        <div>{item.full_name || item.developer_name || "Builder / Developer"}</div>
                        {item.company_name && (
                          <div className="text-gray-500 font-normal text-[11px]">
                            {item.company_name}
                          </div>
                        )}
                        {item.account_type && (
                          <span className="badge bg-light text-muted border text-[10px] mt-0.5">
                            {item.account_type}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {item.email || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-gray-800">
                        {item.mobile_number || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-700">
                        {item.city || "Pune"}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "Block"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVerified
                                ? "bg-emerald-500"
                                : item.status === "Block"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {item.status || "Verified"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs whitespace-nowrap font-medium text-gray-700">
                        {formatRegDate(item.created_at)}
                      </td>
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-xs"
                            style={{ backgroundColor: "#7A0E2E" }}
                            onClick={() => {
                              setSelectedUserForTracking(item);
                              setIsTrackingModalOpen(true);
                            }}
                            title="View 360° Tracking Dossier"
                          >
                            Track
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm text-xs py-1 px-2.5 rounded-lg"
                            onClick={() => navigate(`/properties/${item._id}`)}
                            title="View properties added by this user"
                          >
                            Properties
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm text-xs py-1 px-2.5 rounded-lg"
                            onClick={() => navigate(`/admin/projects`)}
                            title="View Builder Projects"
                          >
                            Projects
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-xs text-gray-500 font-semibold">
                    No Builder / Developer partners found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination at bottom */}
        {!loading && filteredItems.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredItems.length)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredItems.length}</strong> builders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-semibold text-gray-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User 360° Tracking Dossier Modal */}
      {isTrackingModalOpen && selectedUserForTracking && (
        <UserTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          user={selectedUserForTracking}
          onStatusChange={fetchItems}
        />
      )}
    </div>
  );
};

export default DeveloperList;
