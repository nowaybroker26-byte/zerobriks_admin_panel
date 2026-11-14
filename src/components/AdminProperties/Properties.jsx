import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import PropertyCard from "./PropertyCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faWarehouse,
  faRotateRight,
  faCheckCircle,
  faLayerGroup,
  faTag,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { MyContext } from "../../App";
import { getAllowedCitiesFromSession } from "../../permissions/permissionConfig";

const CATEGORY_TABS = [
  { id: "", label: "All Properties", icon: faLayerGroup },
  { id: "Buy", label: "Buy", icon: faHome },
  { id: "Rent", label: "Rent", icon: faTag },
  { id: "Commercial Buy", label: "Commercial Buy", icon: faWarehouse },
  { id: "Commercial Lease", label: "Commercial Lease", icon: faWarehouse },
  { id: "PG/Co-living", label: "PG / Co-Living", icon: faHome },
];

const Properties = () => {
  const { can } = useContext(MyContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnishType, setFurnishType] = useState([]);
  const [bhkType, setBhkType] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [priceError, setPriceError] = useState("");

  const navigate = useNavigate();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const firstLoad = useRef(true);
  const useFilterApi = useRef(false);
  const allowedCities = getAllowedCitiesFromSession(); // [] = unrestricted

  const priceOptions = [
    { label: "₹ 5 Lakhs", value: 500000 },
    { label: "₹ 10 Lakhs", value: 1000000 },
    { label: "₹ 15 Lakhs", value: 1500000 },
    { label: "₹ 20 Lakhs", value: 2000000 },
    { label: "₹ 25 Lakhs", value: 2500000 },
    { label: "₹ 30 Lakhs", value: 3000000 },
    { label: "₹ 40 Lakhs", value: 4000000 },
    { label: "₹ 50 Lakhs", value: 5000000 },
    { label: "₹ 60 Lakhs", value: 6000000 },
    { label: "₹ 75 Lakhs", value: 7500000 },
    { label: "₹ 90 Lakhs", value: 9000000 },
    { label: "₹ 1 Crore", value: 10000000 },
    { label: "₹ 1.25 Crore", value: 12500000 },
    { label: "₹ 1.5 Crore", value: 15000000 },
    { label: "₹ 1.75 Crore", value: 17500000 },
    { label: "₹ 2 Crore", value: 20000000 },
    { label: "₹ 3 Crore", value: 30000000 },
    { label: "₹ 4 Crore", value: 40000000 },
    { label: "₹ 5 Crore", value: 50000000 },
    { label: "₹ 10 Crore", value: 100000000 },
    { label: "₹ 20 Crore", value: 200000000 },
    { label: "₹ 30 Crore", value: 300000000 },
    { label: "₹ 50 Crore", value: 500000000 },
    { label: "₹ 75 Crore", value: 750000000 },
  ];

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
      minPrice ||
      maxPrice ||
      furnishType.length > 0 ||
      bhkType.length > 0 ||
      sortBy
  );

  useEffect(() => {
    if (firstLoad.current || !hasActiveFilters) {
      useFilterApi.current = false;
      setProperties([]);
      setCurrentPage(1);
      fetchProperties(1, true);
      firstLoad.current = false;
    } else {
      useFilterApi.current = true;
      setProperties([]);
      setCurrentPage(1);
      fetchProperties(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    city,
    locality,
    propertyType,
    minPrice,
    maxPrice,
    searchKeyword,
    furnishType,
    bhkType,
    sortBy,
  ]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetching &&
          currentPage < totalPages
        ) {
          fetchProperties(currentPage + 1, !useFilterApi.current);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages, isFetching]);

  const extractDataAndPagination = (resData, fallbackPage = 1) => {
    if (!resData) return { list: [], totalPages: 1, currentPage: fallbackPage };

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

    const totalPages =
      Number(resData.total_pages) ||
      Number(resData.totalPages) ||
      (resData.count ? Math.ceil(Number(resData.count) / 8) : 1) ||
      1;

    const currentPage =
      Number(resData.current_page) ||
      Number(resData.currentPage) ||
      fallbackPage;

    return { list, totalPages, currentPage };
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
      admin_approval: item.admin_approval || "Approved",
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
      property_owner_image: item.property_owner_image || "",
      connect_to_name: item.connect_to_name || item.property_owner_name || "",
      user_type: item.user_type || "",
      area: item.area || "",
      area_in: item.area_in || "sq ft",
      furnished_type: item.furnished_type || item.furnish_type || "",
      mark_as_featured: item.mark_as_featured || "No",
      virtual_tour_availability: item.virtual_tour_availability || "No",
      property_images: Array.isArray(item.property_images)
        ? item.property_images
        : [],
    };
  };

  const fetchProperties = async (page, useGetListing = false) => {
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
      formData.append("page_size", "8");

      let endpoint = `${process.env.REACT_APP_API_BASE_URL}/cust_api/get-listing-properties-admin`;
      if (!useGetListing) {
        if (searchKeyword) formData.append("search_keyword", searchKeyword);
        if (category) formData.append("property_category_type", category);
        if (city) formData.append("city_name", city);
        if (locality) formData.append("address", locality);
        if (propertyType) formData.append("property_type", propertyType);
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

      // 1. Try primary endpoint
      try {
        const response = await axios.post(endpoint, formData, { headers });
        const extracted = extractDataAndPagination(response?.data, page);
        if (extracted.list && extracted.list.length > 0) {
          rawList = extracted.list;
          totalPagesCount = extracted.totalPages;
          currentPageNum = extracted.currentPage;
        }
      } catch (err) {
        console.warn(
          "Primary properties endpoint failed, attempting fallback:",
          err?.response?.status || err?.message
        );
      }

      // 2. If primary had no data or failed, try get_property_list
      if (rawList.length === 0 && useGetListing) {
        try {
          const res2 = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_list`,
            { page: page.toString(), page_size: "8" },
            { headers }
          );
          const extracted = extractDataAndPagination(res2?.data, page);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
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
            { page: page.toString(), page_size: "8" },
            { headers }
          );
          const extracted = extractDataAndPagination(res3?.data, page);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
          }
        } catch (err3) {
          console.warn("get-listing-properties fallback failed:", err3?.message);
        }
      }

      // 4. Fallback to recently_posted_properties (GET)
      if (rawList.length === 0 && useGetListing && page === 1) {
        try {
          const res4 = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/recently_posted_properties`
          );
          const extracted = extractDataAndPagination(res4?.data, page);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
          }
        } catch (err4) {
          console.warn(
            "recently_posted_properties fallback failed:",
            err4?.message
          );
        }
      }

      // 5. Fallback for search/filter if my_properties_search_filter_admin returned empty
      if (rawList.length === 0 && !useGetListing) {
        try {
          const resFilter = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/cust_api/property_search_filter`,
            formData,
            { headers }
          );
          const extracted = extractDataAndPagination(resFilter?.data, page);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
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
                (p.property_category_type || "")
                  .toLowerCase()
                  .trim() === category.toLowerCase().trim()
            );
          }
          if (city) {
            transformed = transformed.filter((p) =>
              (p.address || "").toLowerCase().includes(city.toLowerCase().trim())
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
        setProperties((prev) =>
          page === 1 ? transformed : [...prev, ...transformed]
        );
      } else {
        if (page === 1) setProperties([]);
        setTotalPages(1);
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

  const handleDelete = async (propertyId) => {
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
        setSuccessMessage("Property deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Error deleting property");
      }
    } catch (err) {
      console.error("Error deleting property", err);
      setError("Error deleting property");
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setCategory("");
    setCity("");
    setLocality("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setFurnishType([]);
    setBhkType([]);
    setSortBy("");
    setPriceError("");
  };

  const handleMinChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : "";
    setMinPrice(value);
    if (maxPrice && value && value > maxPrice) {
      setPriceError("Min price cannot be greater than Max price");
    } else {
      setPriceError("");
    }
  };

  const handleMaxChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : "";
    setMaxPrice(value);
    if (minPrice && value && value < minPrice) {
      setPriceError("Max price cannot be less than Min price");
    } else {
      setPriceError("");
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5">
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
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-2.5 py-1 fw-bold text-uppercase"
                style={{
                  backgroundColor: "rgba(122, 14, 46, 0.08)",
                  color: "#7A0E2E",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                Inventory Management
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <FontAwesomeIcon
                icon={faWarehouse}
                className="me-2"
                style={{ color: "#7A0E2E" }}
              />
              Properties Inventory
            </h3>
            <p className="text-muted small mb-0">
              Browse, filter, and manage all property listings across residential, commercial, and PG segments.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={() => navigate("/amenities")}
              className="btn btn-outline-secondary px-3.5 py-2 fw-semibold rounded-pill shadow-xs transition"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              Amenities
            </button>

            {can("myInventory", "add") && (
              <button
                onClick={() => navigate("/add-property")}
                className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition"
                style={{
                  backgroundColor: "#7A0E2E",
                  borderColor: "#7A0E2E",
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1.5" />
                Add Property
              </button>
            )}
          </div>
        </div>

        {/* Category Quick Filter Pills */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold transition-all ${
                  isSelected ? "text-white shadow-xs" : "btn-outline-secondary border-1"
                }`}
                style={{
                  backgroundColor: isSelected ? "#7A0E2E" : "transparent",
                  borderColor: isSelected ? "#7A0E2E" : "#E2E8F0",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  fontSize: "12.5px",
                }}
              >
                <FontAwesomeIcon icon={tab.icon} className="me-1.5 opacity-75" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters Bar */}
        <div
          className="p-3 rounded-3 mb-4 border"
          style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <div className="position-relative">
                <IoIosSearch
                  className="position-absolute text-muted top-50 start-0 translate-middle-y ms-3"
                  size={19}
                />
                <input
                  type="text"
                  placeholder="Search by title, locality or landmark..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="form-control form-control-sm ps-5 pe-5 py-2 rounded-3 border-secondary-subtle"
                  style={{ fontSize: "13px" }}
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                  >
                    <IoMdClose size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* City Selector */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm py-2 rounded-3 border-secondary-subtle"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ fontSize: "13px" }}
              >
                <option value="">All Cities</option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type Selector */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm py-2 rounded-3 border-secondary-subtle"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{ fontSize: "13px" }}
              >
                <option value="">Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat/Apartment">Flat/Apartment</option>
                <option value="Plot/Land">Plot/Land</option>
                <option value="Independent House/Villa">Independent House/Villa</option>
                <option value="Independent/Builder Floor">Independent/Builder Floor</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="1RK/Studio Apartment">1RK/Studio Apartment</option>
                <option value="Service Apartment">Service Apartment</option>
                <option value="Farmhouse">Farmhouse</option>
                <option value="Office">Office Space</option>
                <option value="Retail">Shop/Retail</option>
                <option value="Storage">Warehouse/Storage</option>
                <option value="Industry">Industry</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price Range: Min & Max */}
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-1.5">
                <select
                  value={minPrice}
                  onChange={handleMinChange}
                  className="form-select form-select-sm py-2 rounded-3 border-secondary-subtle"
                  style={{ fontSize: "12px" }}
                >
                  <option value="">₹ Min</option>
                  {priceOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-muted small">–</span>
                <select
                  value={maxPrice}
                  onChange={handleMaxChange}
                  className="form-select form-select-sm py-2 rounded-3 border-secondary-subtle"
                  style={{ fontSize: "12px" }}
                >
                  <option value="">₹ Max</option>
                  {priceOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="col-6 col-md-1 text-end">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-sm btn-link text-danger text-decoration-none fw-semibold p-0"
                  style={{ fontSize: "12px" }}
                  title="Reset all filters"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {priceError && (
            <p className="text-danger small mb-0 mt-2 fw-semibold">
              {priceError}
            </p>
          )}
        </div>

        {/* Results Counter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="text-muted small fw-semibold">
            Showing <strong className="text-dark">{properties.length}</strong> {properties.length === 1 ? "property" : "properties"}
            {hasActiveFilters && " (Filtered)"}
          </span>
          {currentPage > 1 && (
            <span className="badge bg-light text-secondary border px-2 py-1">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Loading Spinner for Initial Fetch */}
        {loading && properties.length === 0 && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading properties...</span>
            </div>
            <p className="text-muted mt-2 small">Loading property inventory...</p>
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
                : "There are currently no property listings in the inventory."}
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

        {/* Property Cards Grid */}
        {properties.length > 0 && (
          <div className="row g-4">
            {properties.map((property) => (
              <div key={property._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <PropertyCard
                  property={property}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {currentPage < totalPages && (
          <div ref={loadMoreRef} className="h-10 my-4 text-center">
            {isFetching && (
              <div className="d-inline-flex align-items-center gap-2 text-muted small bg-light px-3 py-2 rounded-pill border">
                <span
                  className="spinner-border spinner-border-sm text-danger"
                  role="status"
                  style={{ color: "#7A0E2E" }}
                ></span>
                Loading more properties...
              </div>
            )}
          </div>
        )}

        {/* All Loaded State */}
        {currentPage >= totalPages && properties.length > 8 && (
          <div className="text-center py-4 border-top mt-4 text-muted small">
            ✓ You have reached the end of the property catalog.
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
