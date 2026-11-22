import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faEnvelope,
  faHouseUser,
  faSearch,
  faSyncAlt,
  faExternalLinkAlt,
  faExclamationTriangle,
  faCopy,
  faCheck,
  faTimes,
  faUndo,
  faCity,
  faCalendarAlt,
  faFilter,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

// Initialize pdfMake fonts
if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts) {
  pdfMake.vfs = pdfFonts;
}

// Helper to extract Owner / Builder information for each inquiry
const getOwnerBuilderInfo = (inquiry) => {
  const prop = inquiry?.property_details || {};

  const name =
    inquiry?.owner_name ||
    prop.connect_to_name ||
    prop.property_owner_name ||
    inquiry?.connect_to_name ||
    prop.developer ||
    prop.company_name ||
    inquiry?.builder_name ||
    "";

  const contact =
    inquiry?.owner_contact ||
    prop.connect_to_no ||
    prop.property_owner_mobile_number ||
    inquiry?.connect_to_no ||
    "";

  const email =
    prop.connect_to_email ||
    inquiry?.owner_email ||
    "";

  let type =
    inquiry?.owner_user_type ||
    prop.user_type ||
    "";

  if (!type) {
    if (prop.developer || (name && name.toLowerCase().includes("builder"))) {
      type = "Builder / Developer";
    } else if (name) {
      type = "Property Owner";
    } else {
      type = "Owner / Builder";
    }
  }

  return {
    name: name || "Property Owner / Builder",
    contact,
    email,
    type,
    hasOwner: Boolean(name),
  };
};

const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Active Properties & Projects fetched for filter dropdowns
  const [activeProperties, setActiveProperties] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);

  // Requested Filters: Search, User Type, City, Active Property Name, Active Project Name, Date
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedProperty, setSelectedProperty] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const navigate = useNavigate();

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      let data = [];
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_enquiry`,
          { page: "1", page_size: "200" }
        );
        if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
      } catch (postErr) {
        console.warn("POST /cust_api/get_property_enquiry error, trying GET fallback:", postErr);
      }

      // If no data returned, fallback to GET /api/get_property_enquiry
      if (!data || data.length === 0) {
        try {
          const fallbackRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/get_property_enquiry`
          );
          if (fallbackRes.data && Array.isArray(fallbackRes.data.data)) {
            data = fallbackRes.data.data;
          }
        } catch (getErr) {
          console.warn("GET /api/get_property_enquiry fallback error:", getErr);
        }
      }

      setInquiries(data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      if (err.response) {
        setError(`Error: ${err.response.data?.msg || "Failed to fetch inquiries"}`);
      } else if (err.request) {
        setError("No response from server. Please verify backend connection.");
      } else {
        setError("An error occurred while loading inquiries.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch active properties and projects for filter dropdowns
  useEffect(() => {
    fetchInquiries();

    // 1. Fetch properties
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_list`, {})
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const names = res.data.data
            .map((p) => String(p.property_name || "").trim())
            .filter(Boolean);
          setActiveProperties(Array.from(new Set(names)).sort());
        }
      })
      .catch(() => {});

    // 2. Fetch projects
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/cust_api/all_project_list`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const names = res.data.data
            .map((p) => String(p.project_name || p.property_name || "").trim())
            .filter(Boolean);
          setActiveProjects(Array.from(new Set(names)).sort());
        }
      })
      .catch(() => {});
  }, []);

  // Format date helper
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

  // Copy property ID
  const handleCopyId = (propertyId) => {
    if (!propertyId) return;
    navigator.clipboard.writeText(String(propertyId));
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewClick = (property_id) => {
    if (!property_id) return;
    navigate(`/property-details/${property_id}`);
  };

  // Unique city list from inquiries + active properties
  const availableCities = useMemo(() => {
    const set = new Set();
    inquiries.forEach((i) => {
      const c = String(
        i.enquiry_property_city ||
        (i.property_details || {}).city_name ||
        i.city ||
        ""
      ).trim();
      if (c) {
        const formatted = c
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        set.add(formatted);
      }
    });
    ["Pune", "Mumbai", "Kolkata", "Indore", "Bhopal"].forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [inquiries]);

  // Unique properties list
  const allPropertyOptions = useMemo(() => {
    const set = new Set(activeProperties);
    inquiries.forEach((i) => {
      const pName = String(
        i.enquiry_property_name ||
        (i.property_details || {}).property_name ||
        i.property_name ||
        ""
      ).trim();
      if (pName) set.add(pName);
    });
    return Array.from(set).sort();
  }, [activeProperties, inquiries]);

  // Unique projects list
  const allProjectOptions = useMemo(() => {
    const set = new Set(activeProjects);
    inquiries.forEach((i) => {
      const prj = String(
        i.project_name ||
        (i.property_details || {}).project_name ||
        (i.property_details || {}).project_type ||
        ""
      ).trim();
      if (prj) set.add(prj);
    });
    return Array.from(set).sort();
  }, [activeProjects, inquiries]);

  // Active filters count
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedUserType !== "All" ||
    selectedCity !== "All" ||
    selectedProperty !== "All" ||
    selectedProject !== "All" ||
    selectedDateRange !== "All" ||
    Boolean(customStartDate) ||
    Boolean(customEndDate);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedUserType !== "All") count++;
    if (selectedCity !== "All") count++;
    if (selectedProperty !== "All") count++;
    if (selectedProject !== "All") count++;
    if (selectedDateRange !== "All") count++;
    if (customStartDate || customEndDate) count++;
    return count;
  }, [
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedProperty,
    selectedProject,
    selectedDateRange,
    customStartDate,
    customEndDate,
  ]);

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedUserType("All");
    setSelectedCity("All");
    setSelectedProperty("All");
    setSelectedProject("All");
    setSelectedDateRange("All");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  // Comprehensive Filter logic
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    // 1. Search Query (name, phone, email, message, property ID)
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter((i) => {
        return (
          String(i.name || "").toLowerCase().includes(q) ||
          String(i.contact_number || "").toLowerCase().includes(q) ||
          String(i.email || "").toLowerCase().includes(q) ||
          String(i.message || "").toLowerCase().includes(q) ||
          String(i.property_id || "").toLowerCase().includes(q)
        );
      });
    }

    // 2. User Type
    if (selectedUserType !== "All") {
      const target = selectedUserType.toLowerCase();
      result = result.filter((i) => {
        const uType = String(
          i.user_type || (i.property_details || {}).user_type || ""
        ).trim().toLowerCase();
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

    // 3. City
    if (selectedCity !== "All") {
      result = result.filter((i) => {
        const iCity = String(
          i.enquiry_property_city ||
          (i.property_details || {}).city_name ||
          i.city ||
          ""
        ).trim().toLowerCase();
        return iCity === selectedCity.toLowerCase();
      });
    }

    // 4. Active Property Name
    if (selectedProperty !== "All") {
      result = result.filter((i) => {
        const pName = String(
          i.enquiry_property_name ||
          (i.property_details || {}).property_name ||
          i.property_name ||
          ""
        ).trim().toLowerCase();
        return pName.includes(selectedProperty.toLowerCase());
      });
    }

    // 5. Active Project Name
    if (selectedProject !== "All") {
      result = result.filter((i) => {
        const prjName = String(
          i.project_name ||
          (i.property_details || {}).project_name ||
          (i.property_details || {}).project_type ||
          ""
        ).trim().toLowerCase();
        return prjName.includes(selectedProject.toLowerCase());
      });
    }

    // 6. Date Range
    if (selectedDateRange !== "All") {
      const now = new Date();
      result = result.filter((i) => {
        const rawDate = i.time_date || i.created_at;
        if (!rawDate) return false;
        const inqDate = new Date(rawDate);
        if (isNaN(inqDate.getTime())) return true;

        if (selectedDateRange === "today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return inqDate >= startOfToday;
        }
        if (selectedDateRange === "last_7_days") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return inqDate >= sevenDaysAgo;
        }
        if (selectedDateRange === "last_30_days") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return inqDate >= thirtyDaysAgo;
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
            return inqDate >= startOfDay && inqDate <= endOfDay;
          }
          return true;
        }
        if (selectedDateRange === "date_range") {
          if (customStartDate) {
            const cStart = new Date(customStartDate + "T00:00:00");
            if (inqDate < cStart) return false;
          }
          if (customEndDate) {
            const cEnd = new Date(customEndDate + "T23:59:59.999");
            if (inqDate > cEnd) return false;
          }
          return true;
        }
        return true;
      });
    }

    return result;
  }, [
    inquiries,
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedProperty,
    selectedProject,
    selectedDateRange,
    customStartDate,
    customEndDate,
  ]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedUserType,
    selectedCity,
    selectedProperty,
    selectedProject,
    selectedDateRange,
    customStartDate,
    customEndDate,
    pageSize,
  ]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(startIndex, startIndex + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  // Generate Tabular PDF Export using pdfmake
  const handleExportPDF = () => {
    if (!filteredInquiries || filteredInquiries.length === 0) {
      Swal.fire({
        title: "No Inquiries to Export",
        text: "There are currently no inquiries matching your active filters.",
        icon: "warning",
        confirmButtonColor: "#7A0E2E",
      });
      return;
    }

    try {
      setIsExporting(true);

      const tableBody = [
        [
          { text: "#", style: "tableHeader", alignment: "center" },
          { text: "Lead / Inquirer", style: "tableHeader" },
          { text: "Contact & City", style: "tableHeader" },
          { text: "Target Property / Project", style: "tableHeader" },
          { text: "Owner / Builder (Lead For)", style: "tableHeader" },
          { text: "Inquiry Message", style: "tableHeader" },
          { text: "Date & Time", style: "tableHeader" },
        ],
      ];

      filteredInquiries.forEach((inq, idx) => {
        const leadName = inq.name || "Anonymous User";
        const leadPhone = inq.contact_number || "—";
        const leadEmail = inq.email || "";
        const leadType = inq.user_type || "";

        const propName =
          inq.enquiry_property_name ||
          (inq.property_details || {}).property_name ||
          inq.property_name ||
          "General Property";
        const projName =
          inq.project_name ||
          (inq.property_details || {}).project_name ||
          "";
        const cityName =
          inq.enquiry_property_city ||
          (inq.property_details || {}).city_name ||
          inq.city ||
          "";

        const ownerInfo = getOwnerBuilderInfo(inq);
        const isBuilder =
          ownerInfo.type.toLowerCase().includes("builder") ||
          ownerInfo.type.toLowerCase().includes("developer");

        const msg = inq.message || "No specific message provided.";
        const dateStr = formatDate(inq.time_date || inq.created_at);

        tableBody.push([
          { text: String(idx + 1), alignment: "center", fontSize: 8 },
          {
            stack: [
              { text: leadName, bold: true, fontSize: 8, color: "#1E293B" },
              ...(leadEmail ? [{ text: leadEmail, fontSize: 7, color: "#64748B" }] : []),
              ...(leadType ? [{ text: `Role: ${leadType}`, fontSize: 7, color: "#0F766E", bold: true }] : []),
            ],
          },
          {
            stack: [
              { text: leadPhone, bold: true, fontSize: 8, color: "#85621E" },
              ...(cityName ? [{ text: `City: ${cityName}`, fontSize: 7, color: "#475569" }] : []),
            ],
          },
          {
            stack: [
              { text: propName, bold: true, fontSize: 8, color: "#0F172A" },
              ...(projName ? [{ text: `Project: ${projName}`, fontSize: 7, color: "#C2410C", bold: true }] : []),
              ...(inq.property_id ? [{ text: `ID: #${String(inq.property_id).slice(-8)}`, fontSize: 7, color: "#94A3B8" }] : []),
            ],
          },
          {
            stack: [
              { text: ownerInfo.name, bold: true, fontSize: 8, color: "#7A0E2E" },
              {
                text: ownerInfo.type,
                fontSize: 7,
                bold: true,
                color: isBuilder ? "#C2410C" : "#4338CA",
              },
              ...(ownerInfo.contact ? [{ text: `Ph: ${ownerInfo.contact}`, fontSize: 7, color: "#64748B" }] : []),
            ],
          },
          {
            text: msg,
            fontSize: 7.5,
            color: "#334155",
          },
          {
            text: dateStr,
            fontSize: 7.5,
            color: "#475569",
          },
        ]);
      });

      const activeFilterSummary = [];
      if (searchQuery.trim()) activeFilterSummary.push(`Search: "${searchQuery.trim()}"`);
      if (selectedUserType !== "All") activeFilterSummary.push(`User Type: ${selectedUserType}`);
      if (selectedCity !== "All") activeFilterSummary.push(`City: ${selectedCity}`);
      if (selectedProperty !== "All") activeFilterSummary.push(`Property: ${selectedProperty}`);
      if (selectedProject !== "All") activeFilterSummary.push(`Project: ${selectedProject}`);
      if (selectedDateRange !== "All") activeFilterSummary.push(`Date: ${selectedDateRange}`);

      const docDefinition = {
        pageOrientation: "landscape",
        pageSize: "A4",
        pageMargins: [20, 25, 20, 25],
        header: (currPage, totalPagesCount) => {
          return {
            columns: [
              {
                text: "ZEROBRIKS PROPERTY INQUIRIES & LEADS DIRECTORY",
                fontSize: 8,
                color: "#94A3B8",
                margin: [20, 10, 0, 0],
              },
              {
                text: `Page ${currPage} of ${totalPagesCount}`,
                fontSize: 8,
                color: "#94A3B8",
                alignment: "right",
                margin: [0, 10, 20, 0],
              },
            ],
          };
        },
        content: [
          {
            columns: [
              {
                stack: [
                  {
                    text: "ZEROBRIKS - PROPERTY INQUIRIES & LEADS REPORT",
                    fontSize: 14,
                    bold: true,
                    color: "#7A0E2E",
                  },
                  {
                    text: `Generated on: ${new Date().toLocaleString("en-IN")} | Total Inquiries: ${filteredInquiries.length}${
                      activeFilterSummary.length > 0 ? ` | Filters: [${activeFilterSummary.join(", ")}]` : " | All Inquiries"
                    }`,
                    fontSize: 8,
                    color: "#64748B",
                    margin: [0, 2, 0, 8],
                  },
                ],
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: [20, 115, 95, 135, 125, 170, 85],
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

      const dateStamp = new Date().toISOString().slice(0, 10);
      pdfMake.createPdf(docDefinition).download(`ZeroBriks_Property_Inquiries_${dateStamp}.pdf`);
      setIsExporting(false);
    } catch (err) {
      console.error("PDF Export error:", err);
      Swal.fire({
        title: "Export Error",
        text: "Failed to generate PDF. Please try again.",
        icon: "error",
        confirmButtonColor: "#7A0E2E",
      });
      setIsExporting(false);
    }
  };

  // Export Filtered Inquiries to Excel Spreadsheet with all individual separate fields
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      if (!filteredInquiries || filteredInquiries.length === 0) {
        Swal.fire({
          title: "No Inquiries to Export",
          text: "There are currently no inquiries matching your active filters.",
          icon: "warning",
          confirmButtonColor: "#7A0E2E",
        });
        setIsExportingExcel(false);
        return;
      }

      const excelRows = filteredInquiries.map((inq, idx) => {
        const leadName = inq.name || "Anonymous User";
        const leadPhone = inq.contact_number || "—";
        const leadEmail = inq.email || "—";
        const leadType = inq.user_type || "—";

        const propName =
          inq.enquiry_property_name ||
          (inq.property_details || {}).property_name ||
          inq.property_name ||
          "General Property";
        const projName =
          inq.project_name ||
          (inq.property_details || {}).project_name ||
          "";
        const cityName =
          inq.enquiry_property_city ||
          (inq.property_details || {}).city_name ||
          inq.city ||
          "";
        const propertyType =
          inq.enquiry_property_type ||
          (inq.property_details || {}).property_type ||
          "";
        const bhkType =
          inq.enquiry_bhk_type ||
          (inq.property_details || {}).bhk_type ||
          "";
        const buildingType =
          inq.enquiry_building_type ||
          (inq.property_details || {}).building_type ||
          "";

        const ownerInfo = getOwnerBuilderInfo(inq);

        let inqDate = "—";
        let inqTime = "—";
        try {
          const rawDate = inq.time_date || inq.created_at;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              inqDate = d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              inqTime = d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            } else {
              inqDate = String(rawDate);
            }
          }
        } catch (_) {}

        return {
          "Sr No": idx + 1,
          "Property ID": inq.property_id ? `#${String(inq.property_id).slice(-8)}` : "General",
          "Lead Name": leadName,
          "Lead Mobile Number": leadPhone,
          "Lead Email ID": leadEmail,
          "Lead User Type": leadType,
          "Property Name": propName,
          "Project Name": projName || "—",
          "City": cityName || "—",
          "Property Type": propertyType || "—",
          "BHK Type": bhkType || "—",
          "Building Type": buildingType || "—",
          "Owner / Builder Name (Lead For)": ownerInfo.name,
          "Owner / Builder User Type": ownerInfo.type,
          "Owner / Builder Mobile Number": ownerInfo.contact || "—",
          "Owner / Builder Email": ownerInfo.email || (inq.property_details || {}).connect_to_email || "—",
          "Inquiry Message": inq.message || "No specific message provided.",
          "Inquiry Date": inqDate,
          "Inquiry Time": inqTime,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      worksheet["!cols"] = [
        { wch: 8 },  // Sr No
        { wch: 14 }, // Property ID
        { wch: 22 }, // Lead Name
        { wch: 18 }, // Lead Mobile
        { wch: 26 }, // Lead Email
        { wch: 18 }, // Lead User Type
        { wch: 30 }, // Property Name
        { wch: 20 }, // Project Name
        { wch: 16 }, // City
        { wch: 18 }, // Property Type
        { wch: 18 }, // BHK Type
        { wch: 16 }, // Building Type
        { wch: 24 }, // Owner/Builder Name
        { wch: 20 }, // Owner/Builder User Type
        { wch: 20 }, // Owner/Builder Mobile
        { wch: 26 }, // Owner/Builder Email
        { wch: 45 }, // Inquiry Message
        { wch: 16 }, // Inquiry Date
        { wch: 14 }, // Inquiry Time
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Property Inquiries");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `ZeroBriks_Property_Inquiries_${dateStr}.xlsx`);
      setIsExportingExcel(false);
    } catch (err) {
      console.error("Excel export error:", err);
      Swal.fire({
        title: "Export Error",
        text: "Failed to generate Excel spreadsheet. Please try again.",
        icon: "error",
        confirmButtonColor: "#7A0E2E",
      });
      setIsExportingExcel(false);
    }
  };

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
          />
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faHouseUser} className="text-base text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight m-0">
                  Property Inquiries
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
                  {inquiries.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Manage prospective inquiries submitted across active properties & projects
              </p>
            </div>
          </div>

          {/* Action Buttons: Excel, PDF, Inventory, Refresh (Compact & Properly Aligned) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            {/* Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel || loading || filteredInquiries.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              style={{
                height: "31px",
                fontSize: "11.5px",
                backgroundColor: "#059669",
                border: "1px solid #047857",
              }}
              title="Export filtered inquiries to Excel spreadsheet"
            >
              <FontAwesomeIcon
                icon={isExportingExcel ? faSyncAlt : faFileExcel}
                className={`text-xs ${isExportingExcel ? "fa-spin" : ""}`}
              />
              <span>{isExportingExcel ? "Exporting..." : "Export Excel"}</span>
            </button>

            {/* PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting || loading || filteredInquiries.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              style={{
                height: "31px",
                fontSize: "11.5px",
                backgroundColor: "#7A0E2E",
                border: "1px solid #630B25",
              }}
              title="Export filtered inquiries to PDF document"
            >
              <FontAwesomeIcon
                icon={isExporting ? faSyncAlt : faFilePdf}
                className={`text-xs ${isExporting ? "fa-spin" : ""}`}
              />
              <span>{isExporting ? "Generating PDF..." : "Export PDF"}</span>
            </button>

            {/* Inventory Button */}
            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all shadow-2xs cursor-pointer flex-shrink-0"
              style={{ height: "31px", fontSize: "11.5px" }}
              title="View all properties"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px] text-gray-500" />
              <span>Inventory</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchInquiries}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all shadow-2xs cursor-pointer flex-shrink-0 disabled:opacity-60"
              style={{ height: "31px", fontSize: "11.5px" }}
              title="Refresh inquiries list"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={`text-[10.5px] text-[#7A0E2E] ${loading ? "fa-spin" : ""}`}
              />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
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
            <div className="flex-shrink-0" style={{ width: "220px" }}>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, email, message..."
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

            {/* 2. User Type */}
            <div className="flex-shrink-0" style={{ width: "165px" }}>
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer"
                style={{ height: "36px" }}
              >
                <option value="All">All User Types</option>
                <option value="Buyer / Tenant">Buyer / Tenant</option>
                <option value="Property Owner">Property Owner</option>
                <option value="Builder / Developer">Builder / Developer</option>
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
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Active Property Name */}
            <div className="flex-shrink-0" style={{ width: "190px" }}>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer truncate"
                style={{ height: "36px" }}
                title={selectedProperty}
              >
                <option value="All">All Active Properties</option>
                {allPropertyOptions.map((prop) => (
                  <option key={prop} value={prop} title={prop}>
                    {prop}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Active Project Name */}
            <div className="flex-shrink-0" style={{ width: "175px" }}>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 font-medium focus:outline-none focus:border-[#7A0E2E] cursor-pointer truncate"
                style={{ height: "36px" }}
                title={selectedProject}
              >
                <option value="All">All Active Projects</option>
                {allProjectOptions.map((prj) => (
                  <option key={prj} value={prj} title={prj}>
                    {prj}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Date */}
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

        {/* Data Table */}
        <div className="overflow-x-auto mt-3">
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
                  style={{ backgroundColor: "#7A0E2E", minWidth: "175px" }}
                >
                  Lead / Inquirer
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "145px" }}
                >
                  Contact Info
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "185px" }}
                >
                  Property / Project
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "195px" }}
                >
                  Owner / Builder (Lead For)
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "230px" }}
                >
                  Message
                </th>
                <th
                  className="py-3 px-3.5 text-left text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "140px" }}
                >
                  Date & Time
                </th>
                <th
                  className="py-3 px-3 text-center text-xs font-bold text-white tracking-wide align-middle"
                  style={{ backgroundColor: "#7A0E2E", minWidth: "130px" }}
                >
                  Actions
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
                      <span className="visually-hidden">Loading inquiries...</span>
                    </div>
                    <p className="text-muted mt-2.5 text-xs font-semibold mb-0">
                      Loading property inquiries...
                    </p>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
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
                      <FontAwesomeIcon icon={faHouseUser} className="text-base" />
                    </div>
                    <h6 className="fw-bold text-gray-900 mb-1 text-sm">
                      {inquiries.length === 0
                        ? "No Inquiries Found"
                        : "No Matching Inquiries Found"}
                    </h6>
                    <p className="text-muted text-xs mb-3">
                      {inquiries.length === 0
                        ? "Customer inquiries submitted for your properties will appear here."
                        : "Try adjusting your filter options to find what you are looking for."}
                    </p>
                    {hasActiveFilters ? (
                      <button
                        onClick={handleResetAllFilters}
                        className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Reset All Filters
                      </button>
                    ) : (
                      <button
                        onClick={fetchInquiries}
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
                paginatedInquiries.map((inquiry, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isCopied = copiedId === inquiry.property_id;
                  const propertyName =
                    inquiry.enquiry_property_name ||
                    (inquiry.property_details || {}).property_name ||
                    inquiry.property_name ||
                    "";
                  const cityName =
                    inquiry.enquiry_property_city ||
                    (inquiry.property_details || {}).city_name ||
                    inquiry.city ||
                    "";
                  const projectName =
                    inquiry.project_name ||
                    (inquiry.property_details || {}).project_name ||
                    "";
                  const userType =
                    inquiry.user_type ||
                    (inquiry.property_details || {}).user_type ||
                    "";

                  const ownerInfo = getOwnerBuilderInfo(inquiry);
                  const isBuilder =
                    ownerInfo.type.toLowerCase().includes("builder") ||
                    ownerInfo.type.toLowerCase().includes("developer");

                  return (
                    <tr
                      key={inquiry._id || index}
                      className="hover:bg-rose-50/20 transition-colors"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-gray-500 font-semibold text-xs">
                        {rowNumber}
                      </td>

                      {/* User Info (Lead / Inquirer) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs select-none"
                            style={{ backgroundColor: "#7A0E2E" }}
                          >
                            {(inquiry.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {inquiry.name || "Anonymous User"}
                            </span>
                            {inquiry.email && (
                              <a
                                href={`mailto:${inquiry.email}`}
                                className="text-gray-500 text-[11px] hover:text-[#7A0E2E] transition-colors inline-flex items-center gap-1"
                                title="Send Email"
                              >
                                <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                                <span className="truncate max-w-[140px]">{inquiry.email}</span>
                              </a>
                            )}
                            {userType && (
                              <span className="badge bg-light text-muted border text-[9px] px-1.5 py-0.5 mt-0.5 block w-fit">
                                {userType}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Number & City */}
                      <td className="py-3 px-3 text-xs">
                        {inquiry.contact_number ? (
                          <a
                            href={`tel:${inquiry.contact_number}`}
                            className="badge rounded-pill px-2.5 py-1 font-semibold text-decoration-none inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(166, 129, 57, 0.12)",
                              color: "#85621e",
                              border: "1px solid rgba(166, 129, 57, 0.25)",
                              fontSize: "11px",
                            }}
                            title="Call user"
                          >
                            <FontAwesomeIcon icon={faPhoneAlt} className="text-[10px]" />
                            <span>{inquiry.contact_number}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                        {cityName && (
                          <div className="text-gray-500 text-[11px] font-medium flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faCity} className="text-[#7A0E2E] text-[10px]" />
                            <span>{cityName}</span>
                          </div>
                        )}
                      </td>

                      {/* Property / Project */}
                      <td className="py-3 px-3 text-xs">
                        {propertyName ? (
                          <div className="font-semibold text-gray-900 leading-tight">
                            {propertyName}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">General Property</span>
                        )}
                        {projectName && (
                          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                            Project: {projectName}
                          </div>
                        )}
                        {inquiry.property_id && (
                          <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                            ID: {String(inquiry.property_id).slice(-8)}
                          </span>
                        )}
                      </td>

                      {/* Owner / Builder (Lead For) */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5 shadow-2xs select-none"
                            style={{
                              backgroundColor: isBuilder ? "#C2410C" : "#7A0E2E",
                            }}
                            title={ownerInfo.type}
                          >
                            {ownerInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 text-xs block leading-tight">
                              {ownerInfo.name}
                            </span>
                            <div className="mt-1">
                              <span
                                className="badge text-[9.5px] px-1.5 py-0.5 font-semibold rounded"
                                style={{
                                  backgroundColor: isBuilder
                                    ? "rgba(234, 88, 12, 0.1)"
                                    : "rgba(122, 14, 46, 0.08)",
                                  color: isBuilder ? "#C2410C" : "#7A0E2E",
                                  border: isBuilder
                                    ? "1px solid rgba(234, 88, 12, 0.25)"
                                    : "1px solid rgba(122, 14, 46, 0.2)",
                                }}
                              >
                                {ownerInfo.type}
                              </span>
                            </div>
                            {ownerInfo.contact && (
                              <a
                                href={`tel:${ownerInfo.contact}`}
                                className="text-gray-500 text-[11px] hover:text-[#7A0E2E] flex items-center gap-1 mt-1 text-decoration-none"
                                title="Contact Owner / Builder"
                              >
                                <FontAwesomeIcon
                                  icon={faPhoneAlt}
                                  className="text-[9px] text-[#7A0E2E]"
                                />
                                <span>{ownerInfo.contact}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Message */}
                      <td className="py-3 px-3">
                        <div
                          className="p-2 rounded-lg border bg-gray-50 text-gray-700 text-xs"
                          style={{
                            maxWidth: "340px",
                            borderColor: "#E2E8F0",
                            lineHeight: "1.45",
                            wordBreak: "break-word",
                          }}
                        >
                          {inquiry.message || "No specific message provided."}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(inquiry.time_date || inquiry.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        {inquiry.property_id ? (
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleViewClick(inquiry.property_id)}
                              className="btn btn-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                              style={{
                                backgroundColor: "#7A0E2E",
                                borderColor: "#7A0E2E",
                              }}
                              title="View Property Details"
                            >
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                              <span>View Property</span>
                            </button>

                            <button
                              onClick={() => handleCopyId(inquiry.property_id)}
                              className="btn btn-link p-0 text-gray-500 hover:text-gray-800 text-[11px] text-decoration-none inline-flex items-center gap-1"
                              title="Copy Property ID"
                            >
                              <FontAwesomeIcon
                                icon={isCopied ? faCheck : faCopy}
                                className={`text-[10px] ${isCopied ? "text-emerald-600" : ""}`}
                              />
                              <span>
                                {isCopied ? "Copied" : `#${String(inquiry.property_id).slice(-6)}`}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">General</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredInquiries.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * pageSize, filteredInquiries.length)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredInquiries.length}</strong> inquiries
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
    </div>
  );
};

export default InquiriesList;
