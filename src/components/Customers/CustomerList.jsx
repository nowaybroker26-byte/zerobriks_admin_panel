import React, { useEffect, useState, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCity,
  faUsers,
  faUndo,
  faEye,
  faSearch,
  faCopy,
  faCheck,
  faTimes,
  faCalendarAlt,
  faFilter,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { MyContext } from "../../App";
import UserTrackingModal from "./UserTrackingModal";

// Initialize pdfMake fonts
if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts) {
  pdfMake.vfs = pdfFonts;
}

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

const formatRegDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CustomerList = () => {
  const { can } = useContext(MyContext) || { can: () => true };
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 7 Filter States as requested
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedVerification, setSelectedVerification] = useState("All");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // User 360° Tracking Dossier Modal State
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Sync URL query params (?search=ZB-CU-2B379E&track=ZB-CU-2B379E)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || params.get("customer_id") || "";
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/get_users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
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

  // Dynamically extract unique cities from customer data
  const availableCities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
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
  }, [customers]);

  // User type options as requested: Buyer / Tenant, Property Owner, Builder / Developer
  const userTypeOptions = ["Buyer / Tenant", "Property Owner", "Builder / Developer"];

  // Active filters detection and count
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedUserType !== "All" ||
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
    if (selectedUserType !== "All") count++;
    if (selectedCity !== "All") count++;
    if (selectedVerification !== "All") count++;
    if (selectedAccountStatus !== "All") count++;
    if (selectedDateRange !== "All") count++;
    if (customStartDate || customEndDate) count++;
    if (sortBy !== "latest") count++;
    return count;
  }, [
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  // Reset all filters handler
  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedUserType("All");
    setSelectedCity("All");
    setSelectedVerification("All");
    setSelectedAccountStatus("All");
    setSelectedDateRange("All");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("latest");
    setCurrentPage(1);
    if (location.search) {
      navigate(location.pathname, { replace: true });
    }
  };

  // Export Filtered Customers to Tabular PDF
  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      if (!filteredCustomers || filteredCustomers.length === 0) {
        Swal.fire("Info", "No user records to export.", "info");
        setIsExporting(false);
        return;
      }

      const tableBody = [
        [
          { text: "#", style: "tableHeader", alignment: "center" },
          { text: "Customer ID", style: "tableHeader" },
          { text: "Profile & Name", style: "tableHeader" },
          { text: "Contact & City", style: "tableHeader" },
          { text: "User Type", style: "tableHeader" },
          { text: "Status", style: "tableHeader", alignment: "center" },
          { text: "Registered Date", style: "tableHeader" },
          { text: "Actions & Tracking", style: "tableHeader", alignment: "center" },
        ],
      ];

      filteredCustomers.forEach((c, idx) => {
        const cid = getCustomerId(c);
        const name = c.full_name || c.name || "N/A";
        const company = c.company_name || "Individual";
        const phone = c.mobile_number || c.mobile || "N/A";
        const email = c.email || "N/A";
        const city = c.city || "Pune";

        const uTypeRaw = String(c.user_type || c.type || "").trim();
        const uTypeLower = uTypeRaw.toLowerCase();
        let uType = "Property Owner";
        if (uTypeLower.includes("builder") || uTypeLower.includes("developer")) uType = "Builder / Developer";
        else if (uTypeLower.includes("buyer") || uTypeLower.includes("tenant")) uType = "Buyer / Tenant";
        else if (uTypeRaw) uType = uTypeRaw;

        const isBlocked = String(c.status || "").toLowerCase() === "block";
        const statusText = isBlocked ? "Block" : "Verified";

        let regDateFormatted = formatRegDate(c.created_at || c.date || c.registration_date);
        let regTimeFormatted = "";
        try {
          const rawDate = c.created_at || c.date || c.registration_date;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              regTimeFormatted = d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            }
          }
        } catch (_) { }

        tableBody.push([
          { text: String(idx + 1), alignment: "center", fontSize: 8 },
          { text: cid, bold: true, fontSize: 8, color: "#7A0E2E" },
          {
            stack: [
              { text: name, bold: true, fontSize: 8 },
              { text: company, fontSize: 7, color: "#64748B" },
            ],
          },
          {
            stack: [
              { text: phone, fontSize: 8 },
              { text: email, fontSize: 7, color: "#64748B" },
              { text: city, fontSize: 7, color: "#334155" },
            ],
          },
          { text: uType, fontSize: 8, bold: true },
          {
            text: statusText,
            fontSize: 8,
            alignment: "center",
            color: isBlocked ? "#BE123C" : "#047857",
            bold: true,
          },
          {
            stack: [
              { text: regDateFormatted, fontSize: 8 },
              ...(regTimeFormatted ? [{ text: regTimeFormatted, fontSize: 7, color: "#64748B" }] : []),
            ],
          },
          { text: "Tracked / Active", fontSize: 7, alignment: "center", color: "#475569" },
        ]);
      });

      const docDefinition = {
        pageOrientation: "landscape",
        pageSize: "A4",
        pageMargins: [20, 25, 20, 25],
        header: (currentPage, pageCount) => {
          return {
            columns: [
              { text: "ZEROBRIKS PLATFORM USERS DIRECTORY", fontSize: 8, color: "#94A3B8", margin: [20, 10, 0, 0] },
              { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: "#94A3B8", alignment: "right", margin: [0, 10, 20, 0] },
            ],
          };
        },
        content: [
          {
            columns: [
              {
                stack: [
                  { text: "ZEROBRIKS - ALL USERS DIRECTORY", fontSize: 14, bold: true, color: "#7A0E2E" },
                  { text: `Exported on: ${new Date().toLocaleString("en-IN")} | Total Records: ${filteredCustomers.length}`, fontSize: 8, color: "#64748B", margin: [0, 2, 0, 8] },
                ],
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: [20, 75, 110, 140, 100, 70, 80, 75],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex) => {
                if (rowIndex === 0) return "#7A0E2E";
                return rowIndex % 2 === 0 ? "#F8FAFC" : null;
              },
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#E2E8F0",
              vLineColor: () => "#E2E8F0",
              paddingLeft: () => 4,
              paddingRight: () => 4,
              paddingTop: () => 5,
              paddingBottom: () => 5,
            },
          },
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 8,
            color: "#FFFFFF",
          },
        },
      };

      pdfMake.createPdf(docDefinition).download(`ZeroBriks_Users_Directory_${new Date().toISOString().slice(0, 10)}.pdf`);
      setIsExporting(false);
    } catch (err) {
      console.error("PDF Export error:", err);
      Swal.fire("Error", "Failed to generate PDF. Please try again.", "error");
      setIsExporting(false);
    }
  };

  // Export Filtered Customers to Excel Spreadsheet with all separate individual fields
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      if (!filteredCustomers || filteredCustomers.length === 0) {
        Swal.fire("Info", "No user records to export.", "info");
        setIsExportingExcel(false);
        return;
      }

      const excelRows = filteredCustomers.map((c, idx) => {
        const cid = getCustomerId(c);
        const name = c.full_name || c.name || "N/A";
        const company = c.company_name || "Individual";
        const countryCode = c.country_code || "+91";
        const phone = c.mobile_number || c.mobile || "N/A";
        const email = c.email || "N/A";
        const city = c.city || "";

        const uTypeRaw = String(c.user_type || c.type || "").trim();
        const uTypeLower = uTypeRaw.toLowerCase();
        let uType = "Property Owner";
        if (uTypeLower.includes("builder") || uTypeLower.includes("developer")) {
          uType = "Builder / Developer";
        } else if (uTypeLower.includes("buyer") || uTypeLower.includes("tenant")) {
          uType = "Buyer / Tenant";
        } else if (uTypeRaw) {
          uType = uTypeRaw;
        }

        const statusRaw = String(c.status || "").trim();
        const isBlocked = statusRaw.toLowerCase() === "block" || statusRaw.toLowerCase() === "blocked";
        const accountStatus = isBlocked ? "Blocked" : (c.status || "Active");
        const verificationStatus = statusRaw.toLowerCase().includes("unverified")
          ? "Unverified"
          : "Verified";

        let regDateFormatted = "";
        let regTimeFormatted = "";
        try {
          const rawDate = c.created_at || c.date || c.registration_date;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              regDateFormatted = d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              regTimeFormatted = d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            }
          }
        } catch (_) { }

        return {
          "Sr No": idx + 1,
          "Customer ID": cid,
          "Full Name": name,
          "Company / Firm Name": company,
          "Country Code": countryCode,
          "Mobile Number": phone,
          "Email ID": email,
          "City": city || "—",
          "User Type": uType,
          "Verification Status": verificationStatus,
          "Account Status": accountStatus,
          "Registration Date": regDateFormatted || "—",
          "Registration Time": regTimeFormatted || "—",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      worksheet["!cols"] = [
        { wch: 8 },  // Sr No
        { wch: 16 }, // Customer ID
        { wch: 22 }, // Full Name
        { wch: 24 }, // Company
        { wch: 14 }, // Country Code
        { wch: 16 }, // Mobile Number
        { wch: 26 }, // Email ID
        { wch: 16 }, // City
        { wch: 20 }, // User Type
        { wch: 18 }, // Verification Status
        { wch: 16 }, // Account Status
        { wch: 16 }, // Registration Date
        { wch: 16 }, // Registration Time
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users Directory");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `ZeroBriks_Users_Directory_${dateStr}.xlsx`);
      setIsExportingExcel(false);
    } catch (err) {
      console.error("Excel export error:", err);
      Swal.fire("Error", "Failed to export Excel spreadsheet. Please try again.", "error");
      setIsExportingExcel(false);
    }
  };

  // Comprehensive 7-filter & Sorting Logic
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // 1. Search Query (Customer ID, Name, Mobile Number, Email ID)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((c) => {
        const cid = getCustomerId(c).toLowerCase();
        const rawId = String(c._id || "").toLowerCase();
        const name = String(c.full_name || "").toLowerCase();
        const mobile = String(c.mobile_number || "").toLowerCase();
        const email = String(c.email || "").toLowerCase();
        return (
          cid.includes(q) ||
          rawId.includes(q) ||
          name.includes(q) ||
          mobile.includes(q) ||
          email.includes(q)
        );
      });
    }

    // 2. User Type (Buyer / Tenant, Property Owner, Builder / Developer)
    if (selectedUserType !== "All") {
      const target = selectedUserType.toLowerCase();
      result = result.filter((c) => {
        const uType = String(c.user_type || "").trim().toLowerCase();
        if (target.includes("buyer") || target.includes("tenant")) {
          return uType.includes("buyer") || uType.includes("tenant");
        }
        if (target.includes("owner")) {
          return uType.includes("owner");
        }
        if (target.includes("builder") || target.includes("developer")) {
          return uType.includes("builder") || uType.includes("developer");
        }
        return uType.includes(target);
      });
    }

    // 3. City (All Cities / City-wise)
    if (selectedCity !== "All") {
      result = result.filter((c) => {
        const userCity = String(c.city || "").trim().toLowerCase();
        return userCity === selectedCity.toLowerCase();
      });
    }

    // 4. Verification Status (All, Verified, Unverified)
    if (selectedVerification !== "All") {
      result = result.filter((c) => {
        const statusLower = String(c.status || "").trim().toLowerCase();
        const isVerified = statusLower === "verified";
        if (selectedVerification === "Verified") return isVerified;
        if (selectedVerification === "Unverified") return !isVerified;
        return true;
      });
    }

    // 5. Account Status (Active, Inactive, Blocked)
    if (selectedAccountStatus !== "All") {
      result = result.filter((c) => {
        const statusLower = String(c.status || "").trim().toLowerCase();
        const isBlocked = statusLower === "block" || statusLower === "blocked";
        const isInactive = Boolean(c.deleted_at) || statusLower === "inactive";
        const isActive = !isBlocked && !isInactive;

        if (selectedAccountStatus === "Blocked") return isBlocked;
        if (selectedAccountStatus === "Inactive") return isInactive;
        if (selectedAccountStatus === "Active") return isActive;
        return true;
      });
    }

    // 6. Registration Date (Today, Last 7 Days, Last 30 Days, Custom Date)
    if (selectedDateRange !== "All") {
      const now = new Date();
      result = result.filter((c) => {
        if (!c.created_at) return false;
        const regDate = new Date(c.created_at);
        if (isNaN(regDate.getTime())) return true;

        if (selectedDateRange === "today") {
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          return regDate >= startOfToday;
        }
        if (selectedDateRange === "last_7_days") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          return regDate >= sevenDaysAgo;
        }
        if (selectedDateRange === "last_30_days") {
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
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

    // 7. Sort By (Latest Registered, Oldest Registered)
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
    customers,
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  // Reset to page 1 whenever any filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedVerification,
    selectedAccountStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    sortBy,
    pageSize,
  ]);

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
          `${process.env.REACT_APP_API_BASE_URL}/api/update_user_status`,
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

        fetchCustomers();
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
          `${process.env.REACT_APP_API_BASE_URL}/cust_api/restore_user`,
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
          fetchCustomers();
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
            PAGE HEADER & HERO BADGE (Compact & Sleek)
        ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon
                icon={faUsers}
                className="text-base text-amber-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  All Users Directory
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
                  {customers.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Manage, search, track, and monitor all registered users in tabular format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel || filteredCustomers.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              style={{
                height: "31px",
                fontSize: "11.5px",
                backgroundColor: "#059669",
                border: "1px solid #047857",
              }}
              title="Download Excel spreadsheet of users with all separate fields"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-xs" />
              <span>{isExportingExcel ? "Exporting..." : "Export Excel"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting || filteredCustomers.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              style={{
                height: "31px",
                fontSize: "11.5px",
                backgroundColor: "#7A0E2E",
                border: "1px solid #630B25",
              }}
              title="Download PDF report of users"
            >
              <FontAwesomeIcon icon={faFilePdf} className="text-xs" />
              <span>{isExporting ? "Generating PDF..." : "Export PDF"}</span>
            </button>

            <div className="text-xs text-gray-500 font-medium ml-1">
              Showing <strong className="text-gray-900">{filteredCustomers.length}</strong> of{" "}
              <strong className="text-gray-900">{customers.length}</strong> users
            </div>
          </div>
        </div>

        {/* Scoped CSS for scrollbar hiding if screen narrows */}
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
            HORIZONTAL SCROLLABLE FILTER TOOLBAR (WITH TOP RESET BUTTON)
        ================================================================= */}
        <div className="bg-gray-50/90 border border-gray-200/90 rounded-2xl p-2.5 sm:p-3 mb-4 mt-3 shadow-xs">
          {/* Top Bar: Always Visible Reset Button & Filter Status */}
          <div className="flex items-center justify-between gap-3 mb-2.5 px-0.5 border-b border-gray-200/60 pb-2 flex-wrap">
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
            className="flex items-center gap-2.5 overflow-x-auto pb-1 filter-horizontal-scroll"
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

            {/* 2. User Type: Buyer / Tenant, Property Owner, Builder / Developer */}
            <div className="flex-shrink-0" style={{ width: "175px" }}>
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">User Type</option>
                {userTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. City */}
            <div className="flex-shrink-0" style={{ width: "145px" }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Verification Status */}
            <div className="flex-shrink-0" style={{ width: "155px" }}>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">Verification Status</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            {/* 5. Account Status */}
            <div className="flex-shrink-0" style={{ width: "145px" }}>
              <select
                value={selectedAccountStatus}
                onChange={(e) => setSelectedAccountStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">Account Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* 6. Registration Date */}
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
                <option value="All">Registration Date</option>
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
                      } catch (_) { }
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
                        } catch (_) { }
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
                        } catch (_) { }
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

            {/* 7. Sort By */}
            <div className="flex-shrink-0" style={{ width: "155px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="latest">Sort By</option>
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

        {/* ================================================================
            CUSTOMER DATA TABLE
        ================================================================= */}
        <div className="overflow-x-auto mt-4">
          <table
            className="table table-hover align-middle border-separate border-spacing-0 w-full"
            style={{ borderRadius: "10px", overflow: "hidden" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#7A0E2E" }}>
                <th
                  className="py-3 px-3 text-center text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", width: "48px" }}
                >
                  #
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "150px" }}
                >
                  Customer ID
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "180px" }}
                >
                  Profile & Name
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "160px" }}
                >
                  Contact & City
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  User Type
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "120px" }}
                >
                  Status
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  Registered Date
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "150px" }}
                >
                  Actions & Tracking
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
                      <span className="visually-hidden">Loading users...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading user directory...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-xs text-gray-500 font-semibold"
                  >
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => {
                  const isVerified = customer.status === "Verified";
                  const cid = getCustomerId(customer);
                  const rowNum = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={customer._id || index}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group border-b border-gray-100"
                      onClick={() => handleOpenUserTracking(customer)}
                    >
                      {/* Index */}
                      <td className="text-center text-xs font-semibold text-gray-500 py-3 px-3">
                        {rowNum}
                      </td>

                      {/* Unique Customer ID (e.g. ZB-CU-2B379E) */}
                      <td className="py-3 px-3">
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
                              className={`text-[11px] ${copiedId === cid ? "text-emerald-600" : ""
                                }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Profile & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-9 h-9 flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-rose-50 border border-[#7A0E2E]/20 text-[#7A0E2E] flex items-center justify-center font-bold text-xs shadow-sm select-none">
                              {(customer.full_name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {customer.profile_image && (
                              <img
                                src={
                                  customer.profile_image.startsWith("http")
                                    ? customer.profile_image
                                    : `${process.env.REACT_APP_API_BASE_URL}/${customer.profile_image}`
                                }
                                alt=""
                                className="absolute inset-0 w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isVerified ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 group-hover:text-[#7A0E2E] transition-colors">
                              {customer.full_name || "Unnamed User"}
                            </div>
                            <span className="text-[11px] text-gray-500 block">
                              {customer.company_name || "Individual"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details & City */}
                      <td className="py-3 px-3 text-xs">
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
                          {customer.city || "Pune"}
                        </div>
                      </td>

                      {/* User Type */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {customer.user_type || "Owner"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : customer.status === "Block"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isVerified
                              ? "bg-emerald-500"
                              : customer.status === "Block"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                              }`}
                          ></span>
                          {customer.status || "Verified"}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        <div className="font-semibold text-gray-800">
                          {formatRegDate(customer.created_at)}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {customer.created_at && !isNaN(new Date(customer.created_at).getTime())
                            ? new Date(customer.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : ""}
                        </span>
                      </td>

                      {/* Actions & Tracking Button */}
                      <td className="py-3 px-3 text-center">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Clean, Compact Track User Button */}
                          <button
                            className="btn btn-sm text-xs py-1 px-2.5 rounded-lg text-white font-medium shadow-none transition-all d-inline-flex align-items-center gap-1"
                            style={{
                              backgroundColor: "#7A0E2E",
                              height: "28px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                            onClick={() => handleOpenUserTracking(customer)}
                            title="Open 360° User Tracking Dossier"
                          >
                            <FontAwesomeIcon
                              icon={faEye}
                              style={{ fontSize: "10px" }}
                            />
                            <span>Track</span>
                          </button>

                          {/* Block / Unblock Button */}
                          {customer.deleted_at ? (
                            can("users", "approve") && (
                              <button
                                className="btn btn-warning btn-sm text-xs py-1 px-2 rounded-lg d-inline-flex align-items-center gap-1"
                                style={{ height: "28px", fontSize: "11px" }}
                                title="Restore User"
                                onClick={() => handleRestoreUser(customer._id)}
                              >
                                <FontAwesomeIcon icon={faUndo} style={{ fontSize: "10px" }} />
                                <span>Restore</span>
                              </button>
                            )
                          ) : (
                            <button
                              className={`btn btn-sm text-xs py-1 px-2 rounded-lg font-medium d-inline-flex align-items-center ${isVerified
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                                }`}
                              style={{ height: "28px", fontSize: "11px" }}
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

        {/* Full Professional Pagination at Bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-3 border-t border-gray-100 text-xs text-gray-600">
          <div>
            Showing{" "}
            <strong className="text-gray-900">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-gray-900">
              {Math.min(currentPage * pageSize, filteredCustomers.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-900">{filteredCustomers.length}</strong>{" "}
            users
          </div>

          <div className="flex items-center gap-2">
            <nav aria-label="Customer pagination">
              <ul className="pagination pagination-sm mb-0 gap-1 align-items-center flex-wrap">
                {/* First Page */}
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

                {/* Last Page */}
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
      </div>
    </div>
  );
};

export default CustomerList;
