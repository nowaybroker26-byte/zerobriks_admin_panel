import { EP, API_BASE_URL } from '../../Api/endpoints';
import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBuilding,
  faRotateRight,
  faCheckCircle,
  faTimesCircle,
  faMapMarkerAlt,
  faClock,
  faCheck,
  faTrash,
  faEdit,
  faCopy,
  faUser,
  faBan,
  faLayerGroup,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import { MyContext } from "../../App";
import { getAllowedCitiesFromSession } from "../../permissions/permissionConfig";

const Projects = () => {
  const { can } = useContext(MyContext);
  const [projects, setProjects] = useState([]);
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

  // Filters State (9 Controls)
  const [searchKeyword, setSearchKeyword] = useState("");
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [locality, setLocality] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [reraStatus, setReraStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [furnishType, setFurnishType] = useState([]);
  const [bhkType, setBhkType] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [priceError, setPriceError] = useState("");

  const navigate = useNavigate();
  const firstLoad = useRef(true);
  const useFilterApi = useRef(false);
  const tableTopRef = useRef(null);
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
      .get(`${EP.API_CITIES}`, { headers })
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
      city ||
      locality ||
      projectType ||
      projectStatus ||
      listingStatus ||
      reraStatus ||
      minPrice ||
      maxPrice ||
      fromDate ||
      toDate ||
      furnishType.length > 0 ||
      bhkType.length > 0 ||
      sortBy
  );

  useEffect(() => {
    if (firstLoad.current || !hasActiveFilters) {
      useFilterApi.current = false;
      setCurrentPage(1);
      fetchProjects(1, true, pageSize);
      firstLoad.current = false;
    } else {
      useFilterApi.current = true;
      setCurrentPage(1);
      fetchProjects(1, false, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    city,
    locality,
    projectType,
    projectStatus,
    listingStatus,
    reraStatus,
    minPrice,
    maxPrice,
    fromDate,
    toDate,
    searchKeyword,
    furnishType,
    bhkType,
    sortBy,
  ]);

  const extractDataAndPagination = (
    resData,
    fallbackPage = 1,
    fallbackPageSize = pageSize
  ) => {
    if (!resData)
      return { list: [], totalPages: 1, currentPage: fallbackPage, totalCount: 0 };

    let list = [];
    if (Array.isArray(resData)) {
      list = resData;
    } else if (Array.isArray(resData.data)) {
      list = resData.data;
    } else if (Array.isArray(resData.results)) {
      list = resData.results;
    } else if (Array.isArray(resData.projects)) {
      list = resData.projects;
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

  const transformProjectItem = (item) => {
    const id = item._id || item.id || item.project_id;
    const baseUrl = API_BASE_URL || "";

    let coverImg = item.cover_image || "";
    if (
      !coverImg &&
      Array.isArray(item.project_images) &&
      item.project_images.length > 0
    ) {
      const first = item.project_images[0];
      coverImg = typeof first === "string" ? first : first?.image || "";
    }
    if (coverImg && typeof coverImg === "string" && !coverImg.startsWith("http")) {
      coverImg = `${baseUrl}/${coverImg.replace(/^\/+/, "")}`;
    }
    if (!coverImg) {
      coverImg = "https://via.placeholder.com/400x205?text=Zerobriks+Project";
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
      project_name: item.project_name || item.name || "Untitled Project",
      address: item.address || item.location || "",
      address_area: item.address_area || item.area || "",
      city_name: item.city_name || "",
      created_at: item.created_at,
      cover_image: coverImg,
      logo: logoImg,
      admin_approval: item.admin_approval || "Pending",
      congfigurations:
        item.congfigurations || item.configurations || "",
      view_count: item.view_count || 0,
      leads_count: item.leads_count || 0,
      project_description: item.project_description || item.description || "",
      average_project_price: item.average_project_price || item.price || "",
      project_properties: Array.isArray(item.project_properties)
        ? item.project_properties
        : [],
      project_type: item.project_type || "Residential Project",
      building_type: item.building_type || "Residential",
      user_type: item.user_type || "Builder",
      developer: item.developer || item.property_owner_name || "",
      connect_to_name: item.connect_to_name || item.property_owner_name || "",
      property_added_date: item.property_added_date || "",
    };
  };

  const fetchProjects = async (
    page = 1,
    useGetListing = false,
    customPageSize = pageSize
  ) => {
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

      let endpoint = `${EP.CUST_API_GET_PROJECT_LIST_ADMIN}`;
      if (!useGetListing) {
        if (searchKeyword) formData.append("search_keyword", searchKeyword);
        if (city) formData.append("city_name", city);
        if (locality) {
          formData.append("locality", locality);
          formData.append("address", locality);
        }
        if (projectType) formData.append("project_type", projectType);
        if (projectStatus) formData.append("project_status", projectStatus);
        if (listingStatus) formData.append("listing_status", listingStatus);
        if (reraStatus) formData.append("rera_status", reraStatus);
        if (minPrice) formData.append("min_price", minPrice.toString());
        if (maxPrice) formData.append("max_price", maxPrice.toString());
        if (fromDate) formData.append("from_date", fromDate);
        if (toDate) formData.append("to_date", toDate);
        if (furnishType.length > 0)
          formData.append("furnish_type", furnishType.join("|"));
        if (bhkType.length > 0) formData.append("bhk_type", bhkType.join("|"));
        if (sortBy) formData.append("sort_by", sortBy);
        endpoint = `${EP.CUST_API_MY_PROJECT_SEARCH_FILTER_ADMIN}`;
      }

      let rawList = [];
      let totalPagesCount = 1;
      let currentPageNum = page;
      let totalCountNum = 0;

      // 1. Try primary endpoint
      try {
        const response = await axios.post(endpoint, formData, { headers });
        const extracted = extractDataAndPagination(
          response?.data,
          page,
          customPageSize
        );
        if (extracted.list && extracted.list.length > 0) {
          rawList = extracted.list;
          totalPagesCount = extracted.totalPages;
          currentPageNum = extracted.currentPage;
          totalCountNum = extracted.totalCount;
        }
      } catch (err) {
        console.warn(
          "Primary project endpoint failed, attempting fallbacks:",
          err?.response?.status || err?.message
        );
      }

      // 2. If primary had no data or failed, try get_project_list
      if (rawList.length === 0 && useGetListing) {
        try {
          const res2 = await axios.post(
            `${EP?.CUST_API_GET_PROJECT_LIST || `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_project_list`}`,
            { page: page.toString(), page_size: customPageSize.toString() },
            { headers }
          );
          const extracted = extractDataAndPagination(
            res2?.data,
            page,
            customPageSize
          );
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (err2) {
          console.warn("get_project_list fallback failed:", err2?.message);
        }
      }

      // 3. Fallback to all_project_list
      if (rawList.length === 0 && useGetListing) {
        try {
          const res3 = await axios.post(
            `${EP?.CUST_API_ALL_PROJECT_LIST || `${process.env.REACT_APP_API_BASE_URL}/cust_api/all_project_list`}`,
            { page: page.toString(), page_size: customPageSize.toString() },
            { headers }
          );
          const extracted = extractDataAndPagination(
            res3?.data,
            page,
            customPageSize
          );
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (err3) {
          console.warn("all_project_list fallback failed:", err3?.message);
        }
      }

      // 4. Fallback to recently_posted_project (GET)
      if (rawList.length === 0 && useGetListing && page === 1) {
        try {
          const res4 = await axios.get(
            `${EP?.API_RECENTLY_POSTED_PROJECT || `${process.env.REACT_APP_API_BASE_URL}/api/recently_posted_project`}`
          );
          const extracted = extractDataAndPagination(res4?.data, page);
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
          }
        } catch (err4) {
          console.warn("recently_posted_project fallback failed:", err4?.message);
        }
      }

      // 5. Fallback for search/filter if my_project_search_filter_admin returned empty
      if (rawList.length === 0 && !useGetListing) {
        try {
          const resFilter = await axios.post(
            `${EP.CUST_API_MY_PROJECT_SEARCH_FILTER}`,
            formData,
            { headers }
          );
          const extracted = extractDataAndPagination(
            resFilter?.data,
            page,
            customPageSize
          );
          if (extracted.list && extracted.list.length > 0) {
            rawList = extracted.list;
            totalPagesCount = extracted.totalPages;
            currentPageNum = extracted.currentPage;
            totalCountNum = extracted.totalCount;
          }
        } catch (errF) {
          console.warn("my_project_search_filter fallback failed:", errF?.message);
        }
      }

      if (rawList && rawList.length > 0) {
        let transformed = rawList.map(transformProjectItem);

        // Client-side filtering fallback
        if (!useGetListing) {
          if (city) {
            transformed = transformed.filter((p) =>
              (p.address || "").toLowerCase().includes(city.toLowerCase().trim()) ||
              (p.city_name || "").toLowerCase().includes(city.toLowerCase().trim())
            );
          }
          if (locality) {
            const loc = locality.toLowerCase().trim();
            transformed = transformed.filter((p) =>
              (p.address || "").toLowerCase().includes(loc) ||
              (p.address_area || "").toLowerCase().includes(loc)
            );
          }
          if (projectType) {
            transformed = transformed.filter((p) =>
              (p.project_type || "")
                .toLowerCase()
                .includes(projectType.toLowerCase().trim()) ||
              (p.building_type || "")
                .toLowerCase()
                .includes(projectType.toLowerCase().trim())
            );
          }
          if (listingStatus) {
            if (listingStatus === "Active") {
              transformed = transformed.filter((p) => p.admin_approval === "Approved");
            } else if (listingStatus === "Pending") {
              transformed = transformed.filter((p) => p.admin_approval === "Pending");
            } else if (listingStatus === "Rejected") {
              transformed = transformed.filter((p) => p.admin_approval === "Disapproved");
            }
          }
          if (searchKeyword) {
            const kw = searchKeyword.toLowerCase().trim().replace(/^#/, "");
            transformed = transformed.filter(
              (p) =>
                (p.project_name || "").toLowerCase().includes(kw) ||
                (p._id || "").toLowerCase().includes(kw) ||
                (p.address || "").toLowerCase().includes(kw) ||
                (p.address_area || "").toLowerCase().includes(kw) ||
                (p.developer || "").toLowerCase().includes(kw) ||
                (p.connect_to_name || "").toLowerCase().includes(kw) ||
                (p.city_name || "").toLowerCase().includes(kw)
            );
          }
        }

        setTotalPages(totalPagesCount);
        setCurrentPage(currentPageNum);
        setTotalCount(totalCountNum || transformed.length);
        setProjects(transformed);
      } else {
        setProjects([]);
        setTotalPages(1);
        setTotalCount(0);
        if (page === 1) {
          setError("No projects found matching your criteria.");
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      if (page === 1) setError("Unable to load projects from server.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Pagination Handler (Page 1, 2, 3...)
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage || isFetching) return;
    setCurrentPage(newPage);
    fetchProjects(newPage, !useFilterApi.current, pageSize);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Page Size Selector Handler
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchProjects(1, !useFilterApi.current, newSize);
  };

  // Approve / Disapprove Action Handler for Projects
  const handleUpdateApproval = async (projectId, newStatus) => {
    if (!can("projects", "approve")) {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to approve or disapprove projects.",
      });
      return;
    }

    setActionLoadingId(projectId);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Token ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/api/update_project_status`,
        {
          project_id: projectId,
          admin_approval: newStatus,
        },
        { headers }
      );

      if (response.data && (response.data.status === 1 || response.status === 200)) {
        // Optimistically update local project status
        setProjects((prev) =>
          prev.map((item) =>
            item._id === projectId ? { ...item, admin_approval: newStatus } : item
          )
        );

        const isApproved = newStatus === "Approved";
        Swal.fire({
          icon: isApproved ? "success" : "info",
          title: isApproved ? "Project Approved!" : "Project Disapproved",
          text: `Project status is now ${newStatus}.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        setError(response.data?.msg || response.data?.error || "Failed to update project status.");
      }
    } catch (err) {
      console.error("Error updating approval status:", err);
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Error updating approval status.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Action Handler with SweetAlert Confirmation
  const handleDelete = async (projectId) => {
    if (!can("projects", "delete")) {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to delete projects.",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete Project?",
      text: "Are you sure you want to permanently delete this development project? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7A0E2E",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setActionLoadingId(projectId);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${EP.CUST_API_DELETE_PROJECT}`,
        {
          data: { project_id: projectId },
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (response.data.status === 1) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Project deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response.data.detail || "Error deleting project.",
        });
      }
    } catch (err) {
      console.error("Error deleting project", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.detail || "Error deleting project.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy Project ID Helper
  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Price Formatter Helper
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "";
    const num = Number(price);
    if (num >= 10000000)
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    if (num >= 100000)
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    if (num >= 1000)
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getDisplayPrice = (project) => {
    if (project.average_project_price) {
      const p = project.average_project_price;
      if (typeof p === "string" && p.includes("-")) {
        const parts = p.split("-").map((x) => x.trim());
        return `${formatPrice(parts[0])} - ${formatPrice(parts[1])}`;
      }
      const num = Number(p);
      if (!isNaN(num)) return formatPrice(num);
      return `₹ ${p}`;
    }
    if (project.project_properties && project.project_properties.length > 0) {
      const prices = project.project_properties
        .map((x) => Number(x.price))
        .filter((x) => !isNaN(x) && x > 0);
      if (prices.length > 0) {
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        return minP === maxP
          ? formatPrice(minP)
          : `${formatPrice(minP)} - ${formatPrice(maxP)}`;
      }
    }
    return "Price on Request";
  };

  const getConfigurations = (project) => {
    if (project.congfigurations) {
      return project.congfigurations.includes("BHK")
        ? project.congfigurations
        : project.congfigurations
            .split(",")
            .map((c) => `${c.trim()} BHK`)
            .join(", ");
    }
    if (project.project_properties && project.project_properties.length > 0) {
      const bhks = [
        ...new Set(
          project.project_properties
            .map((p) => p.bhk || p.bhk_type)
            .filter(Boolean)
        ),
      ];
      if (bhks.length > 0) {
        return bhks.join(", ");
      }
      return `${project.project_properties.length} Unit Types`;
    }
    return project.project_type || "Residential Project";
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setCity("");
    setLocality("");
    setProjectType("");
    setProjectStatus("");
    setListingStatus("");
    setReraStatus("");
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");
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
            of <strong className="text-dark">{totalCount}</strong> projects
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
        <nav aria-label="Projects pagination navigation">
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
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: "18px" }} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: "19px" }}>
                  Builder Projects
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
                Browse, filter, approve, disapprove, and manage all builder development projects
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

            {can("projects", "add") && (
              <button
                onClick={() => navigate("/add-project")}
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
                Add Project
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

        {/* Sleek, Professional Compact Filter Toolbar */}
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
            {/* 01 Global Search */}
            <div className="position-relative" style={{ flex: "1 1 160px", minWidth: "140px" }}>
              <IoIosSearch
                className="position-absolute text-muted top-50 start-0 translate-middle-y ms-2.5"
                size={16}
              />
              <input
                type="text"
                placeholder="Search name, ID, builder, mobile..."
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
            <div style={{ flex: "0 1 110px", minWidth: "90px" }}>
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

            {/* 03 Locality */}
            <div style={{ flex: "0 1 110px", minWidth: "90px" }}>
              <input
                type="text"
                placeholder="Locality / Area"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="form-control form-control-sm bg-white border-secondary-subtle"
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              />
            </div>

            {/* 04 Project Type */}
            <div style={{ flex: "0 1 115px", minWidth: "95px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Type: All</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed Use">Mixed Use</option>
                <option value="Plotted Development">Plotted Development</option>
              </select>
            </div>

            {/* 05 Project Status */}
            <div style={{ flex: "0 1 120px", minWidth: "100px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Status: All</option>
                <option value="New Launch">New Launch</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* 06 Listing Status */}
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
                <option value="">Listing: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* 07 RERA Status */}
            <div style={{ flex: "0 1 110px", minWidth: "95px" }}>
              <select
                className="form-select form-select-sm bg-white border-secondary-subtle"
                value={reraStatus}
                onChange={(e) => setReraStatus(e.target.value)}
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                }}
              >
                <option value="">RERA: All</option>
                <option value="Registered">Registered</option>
                <option value="Exempt">Exempt</option>
                <option value="Pending Verification">Pending</option>
              </select>
            </div>

            {/* 08 Budget Range (Min - Max) */}
            <div
              className="d-flex align-items-center bg-white border border-secondary-subtle rounded-3 px-2 flex-shrink-0"
              style={{ height: "36px" }}
            >
              <select
                value={minPrice}
                onChange={handleMinChange}
                className="form-select form-select-sm border-0 p-0 shadow-none text-muted"
                style={{ width: "75px", fontSize: "11.5px", height: "100%", backgroundColor: "transparent" }}
                title="Min Budget"
              >
                <option value="">₹ Min</option>
                {priceOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-muted px-1 small">–</span>
              <select
                value={maxPrice}
                onChange={handleMaxChange}
                className="form-select form-select-sm border-0 p-0 shadow-none text-muted"
                style={{ width: "75px", fontSize: "11.5px", height: "100%", backgroundColor: "transparent" }}
                title="Max Budget"
              >
                <option value="">₹ Max</option>
                {priceOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 09 Posted Date Range */}
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

          {priceError && (
            <p className="text-danger small mb-0 mt-2 fw-semibold">
              {priceError}
            </p>
          )}
        </div>

        {/* Results Counter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="text-muted small fw-semibold">
            Showing <strong className="text-dark">{projects.length}</strong>{" "}
            {projects.length === 1 ? "project" : "projects"} on this page
            {totalCount > 0 && (
              <>
                {" "}
                (Total: <strong className="text-dark">{totalCount}</strong>)
              </>
            )}
            {hasActiveFilters && " (Filtered)"}
          </span>
          <div className="d-flex align-items-center gap-2">
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
            <div className="d-flex align-items-center gap-1.5 ms-2">
              <span className="text-muted small">Per page:</span>
              <select
                className="form-select form-select-sm"
                style={{
                  width: "75px",
                  height: "30px",
                  fontSize: "12px",
                  borderRadius: "6px",
                }}
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && projects.length === 0 && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ color: "#7A0E2E" }}
            >
              <span className="visually-hidden">Loading projects...</span>
            </div>
            <p className="text-muted mt-2 small">Loading projects portfolio...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-5 border rounded-4 bg-light my-3">
            <div className="display-6 mb-2">🏗️</div>
            <h5 className="fw-bold text-dark mb-1">No Projects Found</h5>
            <p className="text-muted small mb-3">
              {hasActiveFilters
                ? "No projects match your current filter selection. Try adjusting or resetting filters."
                : "There are currently no development projects in the portfolio."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold me-2"
              >
                Reset Filters
              </button>
            ) : can("projects", "add") ? (
              <button
                onClick={() => navigate("/add-project")}
                className="btn btn-sm text-white px-3 py-1.5 rounded-pill fw-semibold"
                style={{ backgroundColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Add First Project
              </button>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            TABULAR FORMAT (DEFAULT USER REQUEST)
        ========================================================================== */}
        {!loading && projects.length > 0 && (
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
                    Project Details
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="me-1.5 text-muted"
                    />
                    Location
                  </th>
                  <th style={{ minWidth: "160px" }} className="py-3">
                    Pricing & Units
                  </th>
                  <th style={{ minWidth: "150px" }} className="py-3">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-1.5 text-muted"
                    />
                    Developer / Owner
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
                {projects.map((project, index) => {
                  // Serial number calculation: (page - 1) * pageSize + index + 1
                  const serialNumber =
                    (currentPage - 1) * pageSize + index + 1;
                  const projectId = project._id || project.id || "";
                  const isActionLoading = actionLoadingId === projectId;
                  const isApproved = project.admin_approval === "Approved";
                  const isDisapproved = project.admin_approval === "Disapproved";

                  return (
                    <tr
                      key={projectId || index}
                      className="transition hover:bg-slate-50/60"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      {/* Serial Number */}
                      <td className="px-3 text-center text-muted fw-bold small">
                        <span className="badge bg-light text-secondary border px-2 py-1">
                          {serialNumber}
                        </span>
                      </td>

                      {/* Project Details */}
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
                              projectId &&
                              navigate(`/update-project/${projectId}`)
                            }
                            title="Click to edit project"
                          >
                            <img
                              src={project.cover_image}
                              alt={project.project_name}
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=Project";
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
                                  projectId &&
                                  navigate(`/update-project/${projectId}`)
                                }
                                title={project.project_name}
                              >
                                {project.project_name}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-1.5">
                              {/* Building Type Badge */}
                              <span
                                className="badge rounded-pill text-xs fw-semibold px-2 py-0.5"
                                style={{
                                  backgroundColor: "rgba(122, 14, 46, 0.08)",
                                  color: "#7A0E2E",
                                  fontSize: "10.5px",
                                }}
                              >
                                {project.building_type || "Residential"}
                              </span>

                              {/* Configurations */}
                              <span
                                className="badge bg-light text-secondary border px-1.5 py-0.5"
                                style={{ fontSize: "10.5px" }}
                              >
                                {getConfigurations(project)}
                              </span>

                              {/* Copyable ID Badge */}
                              {projectId && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(projectId);
                                  }}
                                  className="badge bg-light text-muted border px-1.5 py-0.5 font-monospace cursor-pointer hover:bg-slate-200"
                                  style={{ fontSize: "10px" }}
                                  title="Click to copy full Project ID"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="me-1 opacity-70"
                                  />
                                  {copiedId === projectId
                                    ? "Copied!"
                                    : `#${projectId.slice(-6)}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3">
                        <div
                          className="text-sm fw-semibold text-dark text-truncate"
                          style={{ maxWidth: "180px" }}
                        >
                          {project.address_area || project.address || "Kolkata"}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted text-xs mt-0.5">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-danger small"
                          />
                          <span>{project.city_name || "Kolkata"}</span>
                        </div>
                      </td>

                      {/* Pricing & Units */}
                      <td className="py-3">
                        <div className="fw-bold text-dark text-sm">
                          {getDisplayPrice(project)}
                        </div>
                        <div className="text-muted text-xs mt-0.5 d-flex align-items-center gap-1">
                          <FontAwesomeIcon
                            icon={faLayerGroup}
                            className="opacity-75"
                            style={{ fontSize: "10px" }}
                          />
                          <span>
                            {project.project_properties &&
                            project.project_properties.length > 0
                              ? `${project.project_properties.length} Unit Types`
                              : "Project Development"}
                          </span>
                        </div>
                      </td>

                      {/* Developer / Posted By */}
                      <td className="py-3">
                        <div
                          className="text-sm font-semibold text-gray-900 text-truncate"
                          style={{ maxWidth: "150px" }}
                        >
                          {project.developer ||
                            project.connect_to_name ||
                            "Zerobriks Developer"}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          <span className="badge rounded-pill text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 border">
                            {project.user_type || "Builder"}
                          </span>
                          <span className="text-muted text-[11px]">
                            {project.property_added_date ||
                              (project.created_at
                                ? new Date(project.created_at).toLocaleDateString()
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
                              handleUpdateApproval(projectId, "Approved")
                            }
                            disabled={isActionLoading || isApproved}
                            title={
                              isApproved
                                ? "Already Approved"
                                : "Approve this project"
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
                              handleUpdateApproval(projectId, "Disapproved")
                            }
                            disabled={isActionLoading || isDisapproved}
                            title={
                              isDisapproved
                                ? "Already Disapproved"
                                : "Disapprove this project"
                            }
                          >
                            <FontAwesomeIcon icon={faBan} />
                            <span>Disapprove</span>
                          </button>

                          {/* Edit Button */}
                          {can("projects", "edit") && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() =>
                                navigate(`/update-project/${projectId}`)
                              }
                              disabled={isActionLoading}
                              title="Edit Project"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          {can("projects", "delete") && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() => handleDelete(projectId)}
                              disabled={isActionLoading}
                              title="Delete Project"
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
        {!loading && projects.length > 0 && renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Projects;
