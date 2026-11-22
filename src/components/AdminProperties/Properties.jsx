import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faWarehouse,
  faRotateRight,
  faCheckCircle,
  faTimesCircle,
  faMapMarkerAlt,
  faTrash,
  faEdit,
  faCopy,
  faBuilding,
  faUser,
  faBan,
  faClock,
  faCheck,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import { MyContext } from "../../App";
import { getAllowedCitiesFromSession } from "../../permissions/permissionConfig";

const Properties = () => {
  const { can } = useContext(MyContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccessMessage] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filters State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnishType, setFurnishType] = useState([]);
  const [bhkType, setBhkType] = useState([]);
  const [sortBy, setSortBy] = useState("");

  const navigate = useNavigate();
  const firstLoad = useRef(true);
  const useFilterApi = useRef(false);
  const tableTopRef = useRef(null);
  const allowedCities = getAllowedCitiesFromSession(); // [] = unrestricted

  useEffect(() => {
    const message = localStorage.getItem("success");
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
      localStorage.removeItem("success");
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const isRealToken = Boolean(
      token &&
      token !== "zerobriks_demo_admin_token" &&
      token !== "null" &&
      token !== "undefined"
    );
    const headers = isRealToken ? { Authorization: `Token ${token}` } : {};

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/cities/`, { headers })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const names = list.map((c) => c.city_name || c.name).filter(Boolean);
        setCityOptions(
          allowedCities.length > 0
            ? names.filter((n) => allowedCities.includes(n))
            : names
        );
      })
      .catch((error) => console.error("Failed to fetch cities:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasActiveFilters = Boolean(
    searchKeyword ||
      category ||
      city ||
      locality ||
      propertyType ||
      listingStatus ||
      fromDate ||
      toDate ||
      minPrice ||
      maxPrice ||
      furnishType.length > 0 ||
      bhkType.length > 0 ||
      sortBy
  );

  useEffect(() => {
    if (firstLoad.current || !hasActiveFilters) {
      useFilterApi.current = false;
      setCurrentPage(1);
      fetchProperties(1, true, pageSize);
      firstLoad.current = false;
    } else {
      useFilterApi.current = true;
      setCurrentPage(1);
      fetchProperties(1, false, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    city,
    locality,
    propertyType,
    listingStatus,
    fromDate,
    toDate,
    minPrice,
    maxPrice,
    searchKeyword,
    furnishType,
    bhkType,
    sortBy,
  ]);

  const extractDataAndPagination = (resData, fallbackPage = 1, fallbackPageSize = pageSize) => {
    if (!resData) return { list: [], totalPages: 1, currentPage: fallbackPage, totalCount: 0 };

    let list = [];
    if (Array.isArray(resData)) {
      list = resData;
    } else if (Array.isArray(resData.data)) {
      list = resData.data;
    } else if (Array.isArray(resData.results)) {
      list = resData.results;
    } else if (Array.isArray(resData.properties)) {
      list = resData.properties;
    } else if (
      resData.data &&
      typeof resData.data === "object" &&
      Array.isArray(resData.data.data)
    ) {
      list = resData.data.data;
    }

    const totalCount =
      Number(resData.total_count) ||
      Number(resData.count) ||
      Number(resData.total) ||
      list.length;

    const totalPages =
      Number(resData.total_pages) ||
      Number(resData.totalPages) ||
      (totalCount ? Math.ceil(totalCount / fallbackPageSize) : 1) ||
      1;

    const currentPage =
      Number(resData.current_page) ||
      Number(resData.currentPage) ||
      fallbackPage;

    return { list, totalPages, currentPage, totalCount };
  };

  const transformPropertyItem = (item) => {
    const id = item._id || item.id || item.property_id;
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "";

    let coverImg = item.cover_image || "";
    if (
      !coverImg &&
      Array.isArray(item.property_images) &&
      item.property_images.length > 0
    ) {
      const first = item.property_images[0];
      coverImg = typeof first === "string" ? first : first?.image || "";
    }
    if (coverImg && typeof coverImg === "string" && !coverImg.startsWith("http")) {
      coverImg = `${baseUrl}/${coverImg.replace(/^\/+/, "")}`;
    }
    if (!coverImg) {
      coverImg = "https://via.placeholder.com/400x250?text=Zerobriks+Property";
    }

    let logoImg = item.logo || "";
    if (logoImg && typeof logoImg === "string" && !logoImg.startsWith("http")) {
      logoImg = `${baseUrl}/${logoImg.replace(/^\/+/, "")}`;
    }
    if (!logoImg) {
      logoImg = "https://via.placeholder.com/55";
    }

    return {
      _id: id,
      property_name: item.property_name || item.name || "Untitled Property",
      address: item.address || item.location || "",
      created_at: item.created_at,
      cover_image: coverImg,
      logo: logoImg,
      admin_approval: item.admin_approval || "Pending",
      property_category_type: item.property_category_type || item.category || "",
      property_type: item.property_type || "Apartment",
      bhk_type: item.bhk_type || "Not Specified",
      property_price: item.property_price || item.price || 0,
      rent: item.rent || 0,
      rent_duration: item.rent_duration || "Monthly",
      view_count: item.view_count || 0,
      leads_count: item.leads_count || 0,
      property_description: item.property_description || item.description || "",
      building_type: item.building_type || "",
      days_since_created: item.days_since_created || 0,
      address_area: item.address_area || item.area || "",
      city_name: item.city_name || "",
      property_owner_image: item.property_owner_image || "",
      connect_to_name: item.connect_to_name || item.property_owner_name || "",
      connect_to_no: item.connect_to_no || item.mobile_number || "",
      connect_to_email: item.connect_to_email || item.email || "",
      property_added_date: item.property_added_date || "",
      user_type: item.user_type || "",
      area: item.area || "",
      area_in: item.area_in || "sq ft",
      carpet_area: item.carpet_area || "",
      carpet_area_unit: item.carpet_area_unit || "sq ft",
      furnished_type: item.furnished_type || item.furnish_type || "",
      mark_as_featured: item.mark_as_featured || "No",
      virtual_tour_availability: item.virtual_tour_availability || "No",
      property_images: Array.isArray(item.property_images)
        ? item.property_images
        : [],
    };
  };

  const fetchProperties = async (page = 1, useGetListing = false, customPageSize = pageSize) => {
    setIsFetching(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const isRealToken = Boolean(
        token &&
          token !== "zerobriks_demo_admin_token" &&
          token !== "null" &&
          token !== "undefined"
      );
      const headers = isRealToken ? { Authorization: `Token ${token}` } : {};

      const formData = new FormData();
      formData.append("page", page.toString());
      formData.append("page_size", customPageSize.toString());

      let endpoint = `${process.env.REACT_APP_API_BASE_URL}/cust_api/get-listing-properties-admin`;
      if (!useGetListing) {
        if (searchKeyword) formData.append("search_keyword", searchKeyword);
        if (category) formData.append("property_category_type", category);
        if (city) formData.append("city_name", city);
        if (locality) formData.append("address", locality);
        if (propertyType) formData.append("property_type", propertyType);
        if (listingStatus) formData.append("listing_status", listingStatus);
        if (fromDate) formData.append("from_date", fromDate);
        if (toDate) formData.append("to_date", toDate);
        if (minPrice) formData.append("min_price", minPrice);
        if (maxPrice) formData.append("max_price", maxPrice);
        if (furnishType.length > 0)
          formData.append("furnish_type", furnishType.join("|"));
        if (bhkType.length > 0) formData.append("bhk_type", bhkType.join("|"));
        if (sortBy) formData.append("sort_by", sortBy);
        endpoint = `${process.env.REACT_APP_API_BASE_URL}/cust_api/my_properties_search_filter_admin`;
      }

      let rawList = [];
      let totalPagesCount = 1;
      let currentPageNum = page;
      let totalCountNum = 0;

      // 1. Try primary endpoint
      try {
        const response = await axios.post(endpoint, formData, { headers });
        const extracted = extractDataAndPagination(response?.data, page, customPageSize);
        if (extracted.list && extracted.list.length > 0) {
          rawList = extracted.list;
          totalPagesCount = extracted.totalPages;
          currentPageNum = extracted.currentPage;
          totalCountNum = extracted.totalCount;
        }
      } catch (err) {
        console.warn(
          "Primary properties endpoint failed, attempting fallback:",
          err?.response?.status || err?.message
        );
      }

      // 2. Fallback to get_property_list
      if (rawList.length === 0 && useGetListing) {
        try {
          const res2 = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_list`,
            { page: page.toString(), page_size: customPageSize.toString() },
            { headers }
          );
          const extracted = extractDataAndPagination(res2?.data, page, customPageSize);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (err2) {
          console.warn("get_property_list fallback failed:", err2?.message);
        }
      }

      // 3. Fallback to get-listing-properties
      if (rawList.length === 0 && useGetListing) {
        try {
          const res3 = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/cust_api/get-listing-properties`,
            { page: page.toString(), page_size: customPageSize.toString() },
            { headers }
          );
          const extracted = extractDataAndPagination(res3?.data, page, customPageSize);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (err3) {
          console.warn("get-listing-properties fallback failed:", err3?.message);
        }
      }

      // 4. Fallback for search/filter if my_properties_search_filter_admin returned empty
      if (rawList.length === 0 && !useGetListing) {
        try {
          const resFilter = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/cust_api/my_properties_search_filter`,
            formData,
            { headers }
          );
          const extracted = extractDataAndPagination(resFilter?.data, page, customPageSize);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (errF) {
          console.warn("property_search_filter fallback failed:", errF?.message);
        }
      }

      if (rawList && rawList.length > 0) {
        let transformed = rawList.map(transformPropertyItem);

        // Client-side filtering fallback if filters active and server returned unfiltered results
        if (!useGetListing) {
          if (category) {
            transformed = transformed.filter(
              (p) =>
                (p.property_category_type || "").toLowerCase().trim() ===
                category.toLowerCase().trim()
            );
          }
          if (city) {
            transformed = transformed.filter((p) =>
              (p.address || "").toLowerCase().includes(city.toLowerCase().trim()) ||
              (p.city_name || "").toLowerCase().includes(city.toLowerCase().trim())
            );
          }
          if (propertyType) {
            transformed = transformed.filter((p) =>
              (p.property_type || "")
                .toLowerCase()
                .includes(propertyType.toLowerCase().trim())
            );
          }
          if (searchKeyword) {
            const kw = searchKeyword.toLowerCase();
            transformed = transformed.filter(
              (p) =>
                (p.property_name || "").toLowerCase().includes(kw) ||
                (p.address || "").toLowerCase().includes(kw) ||
                (p.address_area || "").toLowerCase().includes(kw)
            );
          }
        }

        setTotalPages(totalPagesCount);
        setCurrentPage(currentPageNum);
        setTotalCount(totalCountNum || transformed.length);
        setProperties(transformed);
      } else {
        setProperties([]);
        setTotalPages(1);
        setTotalCount(0);
        if (page === 1) {
          setError("No properties found matching your criteria.");
        }
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      if (page === 1) setError("Unable to load properties from server.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Pagination Change Handler (Page 1, 2, 3...)
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage || isFetching) return;
    setCurrentPage(newPage);
    fetchProperties(newPage, !useFilterApi.current, pageSize);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Page Size Selector Handler
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchProperties(1, !useFilterApi.current, newSize);
  };

  // Approve / Disapprove Action Handler
  const handleUpdateApproval = async (propertyId, newStatus) => {
    if (!can("myInventory", "approve")) {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to approve or disapprove properties.",
      });
      return;
    }

    setActionLoadingId(propertyId);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Token ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/api/update_property_status`,
        {
          property_id: propertyId,
          admin_approval: newStatus,
        },
        { headers }
      );

      if (response.data && (response.data.status === 1 || response.status === 200)) {
        // Optimistically update local property status
        setProperties((prev) =>
          prev.map((item) =>
            item._id === propertyId ? { ...item, admin_approval: newStatus } : item
          )
        );

        const isApproved = newStatus === "Approved";
        Swal.fire({
          icon: isApproved ? "success" : "info",
          title: isApproved ? "Property Approved!" : "Property Disapproved",
          text: `Listing status is now ${newStatus}.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        setError(response.data?.msg || response.data?.error || "Failed to update property status.");
      }
    } catch (err) {
      console.error("Error updating approval status:", err);
      const msg = err.response?.data?.msg || err.response?.data?.error || "Error updating approval status.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Action Handler with SweetAlert Confirmation
  const handleDelete = async (propertyId) => {
    if (!can("myInventory", "delete")) {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to delete properties.",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete Property?",
      text: "Are you sure you want to permanently delete this property listing? This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7A0E2E",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setActionLoadingId(propertyId);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/delete_listing_property`,
        {
          data: { property_id: propertyId },
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (response.data.status === 1) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Property deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response.data.detail || "Error deleting property.",
        });
      }
    } catch (err) {
      console.error("Error deleting property", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.detail || "Error deleting property.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy Property ID Helper
  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Price Formatter Helper
  const formatPrice = (price, rent, category) => {
    const isRental =
      category === "Rent" ||
      category === "Commercial Lease" ||
      category === "PG/Co-living";

    const val = isRental ? rent || price : price || rent;
    if (!val || isNaN(val)) return "₹0";
    const num = Number(val);
    if (num >= 10000000)
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    if (num >= 100000)
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    if (num >= 1000)
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchKeyword("");
    setCategory("");
    setCity("");
    setLocality("");
    setPropertyType("");
    setListingStatus("");
    setFromDate("");
    setToDate("");
    setMinPrice("");
    setMaxPrice("");
    setFurnishType([]);
    setBhkType([]);
    setSortBy("");
  };

  // Smart Page Numbers Range Generator: e.g. [1, 2, 3, 4, 5]
  const renderPaginationButtons = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = [];
    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }

    return (
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3 mt-3 border-top">
        {/* Results Info & Page Size */}
        <div className="d-flex align-items-center gap-3 text-muted small">
          <span>
            Showing{" "}
            <strong className="text-dark">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-dark">
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{" "}
            of <strong className="text-dark">{totalCount}</strong> properties
          </span>

          <div className="d-flex align-items-center gap-1.5 ms-2">
            <span className="text-muted" style={{ fontSize: "12px" }}>
              Per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="form-select form-select-sm py-1 px-2 rounded-2 border-secondary-subtle"
              style={{ width: "70px", fontSize: "12px" }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Controls (1 page, next page, 1 2 3 pages...) */}
        <nav aria-label="Properties pagination navigation">
          <ul className="pagination pagination-sm mb-0 gap-1 align-items-center">
            {/* First Page Button */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link rounded-2 px-2.5 py-1 text-xs border"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || isFetching}
                title="First Page"
              >
                « First
              </button>
            </li>

            {/* Previous Page Button */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link rounded-2 px-2.5 py-1 text-xs border"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isFetching}
                title="Previous Page"
              >
                ‹ Prev
              </button>
            </li>

            {/* Ellipsis before if needed */}
            {startPage > 1 && (
              <>
                <li className="page-item">
                  <button
                    className="page-link rounded-2 px-2.5 py-1 text-xs border"
                    onClick={() => handlePageChange(1)}
                    disabled={isFetching}
                  >
                    1
                  </button>
                </li>
                {startPage > 2 && (
                  <li className="page-item disabled px-1 text-muted small">
                    ...
                  </li>
                )}
              </>
            )}

            {/* Numeric Page Buttons: 1, 2, 3... */}
            {pages.map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <li
                  key={pageNum}
                  className={`page-item ${isActive ? "active" : ""}`}
                >
                  <button
                    className="page-link rounded-2 fw-bold text-xs d-flex align-items-center justify-content-center shadow-xs"
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      backgroundColor: isActive ? "#7A0E2E" : undefined,
                      borderColor: isActive ? "#7A0E2E" : "#E2E8F0",
                      color: isActive ? "#FFFFFF" : "#334155",
                    }}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isFetching}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}

            {/* Ellipsis after if needed */}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <li className="page-item disabled px-1 text-muted small">
                    ...
                  </li>
                )}
                <li className="page-item">
                  <button
                    className="page-link rounded-2 px-2.5 py-1 text-xs border"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={isFetching}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}

            {/* Next Page Button */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link rounded-2 px-2.5 py-1 text-xs border"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isFetching}
                title="Next Page"
              >
                Next ›
              </button>
            </li>

            {/* Last Page Button */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link rounded-2 px-2.5 py-1 text-xs border"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || isFetching}
                title="Last Page"
              >
                Last »
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5">
      {/* Scroll anchor */}
      <div ref={tableTopRef} />

      {/* Toast / Alert Messages */}
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm border-0 d-flex align-items-center mb-3"
          role="alert"
          style={{ backgroundColor: "#ECFDF5", color: "#065F46" }}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
          <span>{success}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm border-0 d-flex align-items-center mb-3"
          role="alert"
          style={{ backgroundColor: "#FDF2F2", color: "#991B1B" }}
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Clean, Space-Efficient Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-xs"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#7A0E2E",
              }}
            >
              <FontAwesomeIcon icon={faWarehouse} style={{ fontSize: "18px" }} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: "19px" }}>
                  Property Directory
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
                  {totalCount} Total
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: "12.5px" }}>
                Manage, approve, filter, and track all property listings
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
            <button
              onClick={() => navigate("/amenities")}
              className="btn btn-outline-secondary d-flex align-items-center"
              style={{
                height: "38px",
                fontSize: "13px",
                borderRadius: "8px",
                borderColor: "#CBD5E1",
                color: "#334155",
                fontWeight: "500",
              }}
            >
              Amenities
            </button>

            {can("myInventory", "add") && (
              <button
                onClick={() => navigate("/add-property")}
                className="btn text-white d-flex align-items-center shadow-xs"
                style={{
                  height: "38px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  backgroundColor: "#7A0E2E",
                  borderColor: "#7A0E2E",
                  fontWeight: "500",
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1.5" />
                Add Property
              </button>
            )}
          </div>
        </div>

        {/* Scoped CSS to ensure horizontal scrollbar is completely hidden across all browsers */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar,
          .filter-horizontal-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            -webkit-appearance: none !important;
          }
          .no-scrollbar,
          .filter-horizontal-scroll {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>

        {/* Sleek, Single-Row Horizontal Filter Toolbar */}
        <div
          className="p-2.5 rounded-3 mb-3 border bg-light-subtle shadow-xs"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div
            className="d-flex flex-nowrap align-items-center gap-2 overflow-x-auto filter-horizontal-scroll no-scrollbar scrollbar-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* 01 Global Search: Property Name, ID, Posted By Name, Mobile Number */}
            <div className="position-relative" style={{ flex: "1 1 180px", minWidth: "140px" }}>
              <IoIosSearch
                className="position-absolute text-muted top-50 start-0 translate-middle-y ms-2.5"
                size={16}
              />
              <input
                type="text"
                placeholder="Search name, ID, owner, mobile..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="form-control form-control-sm ps-5 pe-4 bg-white border-secondary-subtle"
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                  style={{ textDecoration: "none" }}
                >
                  <IoMdClose size={15} />
                </button>
              )}
            </div>

            {/* 02 City */}
            <div style={{ flex: "0 1 115px", minWidth: "95px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">All Cities</option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 03 Property Category */}
            <div style={{ flex: "0 1 125px", minWidth: "105px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Category: All</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Commercial Buy">Commercial Buy</option>
                <option value="Commercial Lease">Commercial Lease</option>
                <option value="PG">PG / Co-living</option>
              </select>
            </div>

            {/* 04 Property Type */}
            <div style={{ flex: "0 1 115px", minWidth: "100px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Type: All</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat/Apartment">Flat/Apartment</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="Independent House/Villa">Independent House/Villa</option>
                <option value="Independent/Builder Floor">Independent/Builder Floor</option>
                <option value="1RK/Studio Apartment">1RK/Studio Apartment</option>
                <option value="Service Apartment">Service Apartment</option>
                <option value="Farmhouse">Farmhouse</option>
                <option value="Office">Office Space</option>
                <option value="Retail">Shop/Retail</option>
                <option value="Plot/Land">Plot/Land</option>
                <option value="Storage">Warehouse/Storage</option>
                <option value="Industry">Industry</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 05 Listing Status */}
            <div style={{ flex: "0 1 110px", minWidth: "95px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={listingStatus}
                onChange={(e) => setListingStatus(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* 06 Posted Date Range */}
            <div
              className="d-flex align-items-center bg-white border border-secondary-subtle rounded-3 px-2 flex-shrink-0"
              style={{ height: "36px" }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-1.5" style={{ fontSize: "11px" }} />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-control form-control-sm border-0 p-0 shadow-none text-muted"
                style={{ width: "90px", fontSize: "11.5px", height: "100%", backgroundColor: "transparent" }}
                title="Posted From"
              />
              <span className="text-muted px-1 small">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-control form-control-sm border-0 p-0 shadow-none text-muted"
                style={{ width: "90px", fontSize: "11.5px", height: "100%", backgroundColor: "transparent" }}
                title="Posted To"
              />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  className="btn btn-link p-0 text-muted ms-1"
                  style={{ textDecoration: "none" }}
                  title="Clear Dates"
                >
                  <IoMdClose size={14} />
                </button>
              )}
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold px-2.5 rounded-3 flex-shrink-0"
                style={{
                  height: "36px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
                title="Reset all filters"
              >
                <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: "11px" }} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="text-muted small fw-semibold">
            Showing <strong className="text-dark">{properties.length}</strong>{" "}
            {properties.length === 1 ? "property" : "properties"} on this page
            {totalCount > 0 && (
              <>
                {" "}
                (Total: <strong className="text-dark">{totalCount}</strong>)
              </>
            )}
            {hasActiveFilters && " (Filtered)"}
          </span>
          {totalPages > 1 && (
            <span
              className="badge px-2.5 py-1 fw-bold rounded-pill"
              style={{
                backgroundColor: "rgba(122, 14, 46, 0.08)",
                color: "#7A0E2E",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && properties.length === 0 && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading properties...</span>
            </div>
            <p className="text-muted mt-2 small">Loading property directory...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-5 border rounded-4 bg-light my-3">
            <div className="display-6 mb-2">🏠</div>
            <h5 className="fw-bold text-dark mb-1">No Properties Found</h5>
            <p className="text-muted small mb-3">
              {hasActiveFilters
                ? "No properties match your current filter selection. Try adjusting or resetting filters."
                : "There are currently no property listings in the directory."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold me-2"
              >
                Reset Filters
              </button>
            ) : can("myInventory", "add") ? (
              <button
                onClick={() => navigate("/add-property")}
                className="btn btn-sm text-white px-3 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Add First Property
              </button>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            TABULAR FORMAT
        ========================================================================== */}
        {!loading && properties.length > 0 && (
          <div
            className="table-responsive rounded-3 border position-relative"
            style={{ borderColor: "#E2E8F0" }}
          >
            {/* Overlay loading indicator when changing pages */}
            {isFetching && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white/70"
                style={{ zIndex: 5 }}
              >
                <div
                  className="spinner-border spinner-border-sm text-danger"
                  role="status"
                  style={{ color: "#7A0E2E" }}
                />
              </div>
            )}

            <table className="table table-hover align-middle mb-0">
              <thead
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottom: "2px solid #E2E8F0",
                }}
              >
                <tr
                  className="text-muted text-uppercase fw-bold"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  <th
                    style={{ width: "55px" }}
                    className="py-3 px-3 text-center"
                  >
                    #
                  </th>
                  <th style={{ minWidth: "260px" }} className="py-3">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="me-1.5 text-muted"
                    />
                    Property Details
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="me-1.5 text-muted"
                    />
                    Location
                  </th>
                  <th style={{ minWidth: "140px" }} className="py-3">
                    Price & Area
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-1.5 text-muted"
                    />
                    Posted By
                  </th>
                  <th
                    style={{ minWidth: "130px" }}
                    className="py-3 text-center"
                  >
                    Approval Status
                  </th>
                  <th
                    style={{ minWidth: "200px" }}
                    className="py-3 px-3 text-center"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property, index) => {
                  // Serial number calculation: (page - 1) * pageSize + index + 1
                  const serialNumber =
                    (currentPage - 1) * pageSize + index + 1;
                  const propertyId = property._id || property.id || "";
                  const isActionLoading = actionLoadingId === propertyId;
                  const isApproved = property.admin_approval === "Approved";
                  const isDisapproved = property.admin_approval === "Disapproved";

                  return (
                    <tr
                      key={propertyId || index}
                      className="transition hover:bg-slate-50/60"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      {/* Serial Number */}
                      <td className="px-3 text-center text-muted fw-bold small">
                        <span className="badge bg-light text-secondary border px-2 py-1">
                          {serialNumber}
                        </span>
                      </td>

                      {/* Property Details */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          {/* Thumbnail */}
                          <div
                            className="rounded-3 overflow-hidden flex-shrink-0 border bg-light position-relative"
                            style={{
                              width: "50px",
                              height: "50px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              propertyId &&
                              navigate(`/update-property/${propertyId}`)
                            }
                            title="Click to edit property"
                          >
                            <img
                              src={property.cover_image}
                              alt={property.property_name}
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=ZB";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="overflow-hidden">
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <span
                                className="fw-bold text-dark text-truncate d-inline-block text-sm"
                                style={{
                                  maxWidth: "220px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  propertyId &&
                                  navigate(`/update-property/${propertyId}`)
                                }
                                title={property.property_name}
                              >
                                {property.property_name}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-1.5">
                              {/* Category Badge */}
                              {property.property_category_type && (
                                <span
                                  className="badge rounded-pill text-xs fw-semibold px-2 py-0.5"
                                  style={{
                                    backgroundColor:
                                      property.property_category_type === "Buy"
                                        ? "rgba(37, 99, 235, 0.1)"
                                        : property.property_category_type === "Rent"
                                        ? "rgba(147, 51, 234, 0.1)"
                                        : "rgba(217, 119, 6, 0.1)",
                                    color:
                                      property.property_category_type === "Buy"
                                        ? "#2563EB"
                                        : property.property_category_type === "Rent"
                                        ? "#9333EA"
                                        : "#D97706",
                                    fontSize: "10.5px",
                                  }}
                                >
                                  {property.property_category_type}
                                </span>
                              )}

                              {/* Property Type / BHK */}
                              <span
                                className="badge bg-light text-secondary border px-1.5 py-0.5"
                                style={{ fontSize: "10.5px" }}
                              >
                                {property.bhk_type && property.bhk_type !== "Not Specified"
                                  ? `${property.bhk_type} • `
                                  : ""}
                                {property.property_type || "Apartment"}
                              </span>

                              {/* Copyable ID Badge */}
                              {propertyId && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(propertyId);
                                  }}
                                  className="badge bg-light text-muted border px-1.5 py-0.5 font-monospace cursor-pointer hover:bg-slate-200"
                                  style={{ fontSize: "10px" }}
                                  title="Click to copy full Property ID"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="me-1 opacity-70"
                                  />
                                  {copiedId === propertyId
                                    ? "Copied!"
                                    : `#${propertyId.slice(-6)}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3">
                        <div className="text-sm fw-semibold text-dark text-truncate" style={{ maxWidth: "180px" }}>
                          {property.address_area || property.address || "Pune"}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted text-xs mt-0.5">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-danger small"
                          />
                          <span>{property.city_name || "Pune"}</span>
                        </div>
                      </td>

                      {/* Price & Area */}
                      <td className="py-3">
                        <div className="fw-bold text-dark text-sm">
                          {formatPrice(
                            property.property_price,
                            property.rent,
                            property.property_category_type
                          )}
                          {(property.property_category_type === "Rent" ||
                            property.property_category_type === "PG/Co-living") && (
                            <span className="text-muted fw-normal text-xs">
                              {" "}
                              / mo
                            </span>
                          )}
                        </div>
                        <div className="text-muted text-xs mt-0.5">
                          {property.area
                            ? `${property.area} ${property.area_in || "sq ft"}`
                            : "Area N/A"}
                        </div>
                      </td>

                      {/* Posted By */}
                      <td className="py-3">
                        <div className="text-sm font-semibold text-gray-900 text-truncate" style={{ maxWidth: "150px" }}>
                          {property.connect_to_name || "Zerobriks Admin"}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          {property.user_type && (
                            <span
                              className="badge rounded-pill text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 border"
                            >
                              {property.user_type}
                            </span>
                          )}
                          <span className="text-muted text-[11px]">
                            {property.property_added_date ||
                              (property.created_at
                                ? new Date(property.created_at).toLocaleDateString()
                                : "Recent")}
                          </span>
                        </div>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="py-3 text-center">
                        {isApproved ? (
                          <span
                            className="badge rounded-pill px-2.5 py-1 text-xs fw-semibold border"
                            style={{
                              backgroundColor: "#ECFDF5",
                              color: "#065F46",
                              borderColor: "#A7F3D0",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-1 text-success"
                            />
                            Approved
                          </span>
                        ) : isDisapproved ? (
                          <span
                            className="badge rounded-pill px-2.5 py-1 text-xs fw-semibold border"
                            style={{
                              backgroundColor: "#FEF2F2",
                              color: "#991B1B",
                              borderColor: "#FECACA",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTimesCircle}
                              className="me-1 text-danger"
                            />
                            Disapproved
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill px-2.5 py-1 text-xs fw-semibold border"
                            style={{
                              backgroundColor: "#FFFBEB",
                              color: "#92400E",
                              borderColor: "#FDE68A",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faClock}
                              className="me-1 text-warning"
                            />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions: Approve, Disapprove, Edit, Delete */}
                      <td className="py-3 px-3 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1.5">
                          {/* Approve Button */}
                          <button
                            type="button"
                            className={`btn btn-sm d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1 transition-all ${
                              isApproved
                                ? "btn-success text-white"
                                : "btn-outline-success"
                            }`}
                            style={{ fontSize: "11px" }}
                            onClick={() =>
                              handleUpdateApproval(propertyId, "Approved")
                            }
                            disabled={isActionLoading || isApproved}
                            title={
                              isApproved
                                ? "Already Approved"
                                : "Approve this property"
                            }
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            <span>Approve</span>
                          </button>

                          {/* Disapprove Button */}
                          <button
                            type="button"
                            className={`btn btn-sm d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1 transition-all ${
                              isDisapproved
                                ? "btn-danger text-white"
                                : "btn-outline-danger"
                            }`}
                            style={{ fontSize: "11px" }}
                            onClick={() =>
                              handleUpdateApproval(propertyId, "Disapproved")
                            }
                            disabled={isActionLoading || isDisapproved}
                            title={
                              isDisapproved
                                ? "Already Disapproved"
                                : "Disapprove this property"
                            }
                          >
                            <FontAwesomeIcon icon={faBan} />
                            <span>Disapprove</span>
                          </button>

                          {/* Edit Button */}
                          {can("myInventory", "edit") && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() =>
                                navigate(`/update-property/${propertyId}`)
                              }
                              disabled={isActionLoading}
                              title="Edit Property"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          {can("myInventory", "delete") && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() => handleDelete(propertyId)}
                              disabled={isActionLoading}
                              title="Delete Property"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            PAGINATION SECTION: 1 PAGE, NEXT PAGE, 1 2 3 PAGES
        ========================================================================== */}
        {!loading && properties.length > 0 && renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Properties;
