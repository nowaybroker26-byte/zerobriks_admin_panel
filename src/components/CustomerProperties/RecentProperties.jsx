import { EP, API_BASE_URL } from "../../Api/endpoints";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faChair } from "@fortawesome/free-solid-svg-icons";
import { FaRupeeSign, FaCopy, FaCheck } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { BsHouseDoorFill } from "react-icons/bs";
import { BiShapeSquare, BiImage } from "react-icons/bi";
import { MdOutlineLocationOn, MdArrowForward } from "react-icons/md";

const STATUS_FILTERS = ["All", "Approved", "Pending", "Disapproved"];
const PAGE_SIZE = 12;

// Turns a stored image path into a full URL (cloud URLs are returned unchanged).
const getImageUrl = (img) => {
  if (typeof img !== "string" || !img.trim()) return null;
  return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
};

const formatPrice = (price) => {
  const value = Number(price);
  if (!value) return "";
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
  return value.toLocaleString("en-IN");
};

const approvalStyle = (status) => {
  if (status === "Approved") return "bg-emerald-600 text-white";
  if (status === "Disapproved") return "bg-rose-600 text-white";
  return "bg-amber-500 text-white";
};

const PropertyCard = ({ property, copied, onCopy, onView }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cover = getImageUrl(property.cover_image);
  const photoCount =
    (cover ? 1 : 0) +
    (property.property_images || []).filter((img) => getImageUrl(img?.image)).length;
  const isRent = property.property_category_type === "Rent";
  const price = isRent ? property.rent : property.property_price;
  const ownerImage = property.property_owner_image
    ? `${API_BASE_URL}/media/${property.property_owner_image}`
    : null;
  const ownerInitial = (property.connect_to_name || "?").trim().charAt(0).toUpperCase();

  return (
    <article className="flex flex-col overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
      {/* Image */}
      <div className="relative h-44 bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <BiImage size={40} />
        </div>
        {cover && !imageFailed && (
          <img
            src={cover}
            alt={property.property_name || "Property"}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 object-cover w-full h-full"
          />
        )}

        <div className="absolute flex gap-1.5 top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${approvalStyle(property.admin_approval)}`}>
            {property.admin_approval || "Pending"}
          </span>
        </div>
        <div className="absolute flex gap-1.5 top-3 right-3">
          {property.mark_as_featured === "Yes" && (
            <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-amber-500">
              Featured
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-white rounded-full shadow-sm">
            {property.property_category_type === "Buy"
              ? "For Buy"
              : property.property_category_type === "Rent"
                ? "For Rent"
                : "Listing"}
          </span>
        </div>
        <div className="absolute flex items-center gap-2 bottom-3 left-3 text-[11px] font-medium text-white">
          <span className="px-2 py-0.5 rounded-full bg-black/55">
            {(() => { const d = property.days_since_created ?? 0; return `${d} ${d === 1 ? "day" : "days"} on Houzza`; })()}
          </span>
          {photoCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-black/55">
              {photoCount} photo{photoCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-gray-900 truncate" title={property.property_name}>
            {property.property_name || "Untitled property"}
          </h3>
          {price ? (
            <p className="flex items-center flex-shrink-0 text-base font-bold text-[#7A0E2E]">
              <FaRupeeSign className="mr-0.5 text-sm" />
              {formatPrice(price)}
              {isRent && property.rent_duration && (
                <span className="ml-1 text-xs font-medium text-gray-500">/ {property.rent_duration}</span>
              )}
            </p>
          ) : null}
        </div>

        <p className="flex items-center gap-1.5 text-sm text-gray-600 truncate">
          <MdOutlineLocationOn className="flex-shrink-0 text-[#7A0E2E]" size={16} />
          {property.address_area || "No address provided"}
        </p>

        {/* Key facts */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          {property.bhk_type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
              <BsHouseDoorFill className="text-[#7A0E2E]" /> {property.bhk_type}
            </span>
          )}
          {property.area_sq && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
              <BiShapeSquare className="text-[#7A0E2E]" /> {property.area_sq} sq.ft
            </span>
          )}
          {property.furnished_type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
              <FontAwesomeIcon icon={faChair} className="text-[#7A0E2E]" /> {property.furnished_type}
            </span>
          )}
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2.5 pt-3 mt-auto border-t border-gray-100">
          {ownerImage ? (
            <img src={ownerImage} alt="" className="object-cover w-8 h-8 rounded-full" />
          ) : (
            <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-rose-50 text-[#7A0E2E]">
              {ownerInitial || <AiOutlineUser />}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {property.connect_to_name || "Unknown contact"}
            </p>
            <p className="text-xs text-gray-500 truncate">{property.user_type || "Not set"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onCopy(property._id)}
            className="inline-flex items-center min-w-0 gap-1.5 text-[11px] text-gray-500 hover:text-gray-800"
            title="Copy property ID"
          >
            <span className="font-mono truncate">ID: {property._id}</span>
            {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
          </button>
          <button
            type="button"
            onClick={() => onView(property)}
            className="inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-[#7A0E2E] hover:bg-[#68091D]"
          >
            View details <MdArrowForward />
          </button>
        </div>
      </div>
    </article>
  );
};

const RecentProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetches one page from the server and appends it (or replaces the list for page 1).
  const fetchPage = async (pageNumber, append) => {
    const response = await fetch(
      `${EP.API_RECENTLY_POSTED_PROPERTIES}?page=${pageNumber}&page_size=${PAGE_SIZE}`
    );
    // The API answers 204 (no body) when there is nothing to show.
    if (response.status === 204) {
      setProperties((prev) => (append ? prev : []));
      setTotal(append ? total : 0);
      return;
    }
    if (!response.ok) throw new Error("Failed to fetch properties.");

    const result = await response.json();
    if (result.status !== 1 || !Array.isArray(result.data)) {
      throw new Error("Invalid data format.");
    }
    setProperties((prev) => {
      if (!append) return result.data;
      const seen = new Set(prev.map((p) => p._id));
      return [...prev, ...result.data.filter((p) => !seen.has(p._id))];
    });
    setTotal(result.total_count ?? result.data.length);
    setPage(pageNumber);
  };

  useEffect(() => {
    const loadFirstPage = async () => {
      try {
        await fetchPage(1, false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setErrors("Failed to fetch properties.");
      } finally {
        setLoading(false);
      }
    };
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch (error) {
      console.error("Error loading more properties:", error);
      setErrors("Failed to load more properties.");
    } finally {
      setLoadingMore(false);
    }
  };

  const counts = useMemo(() => {
    const result = { All: properties.length };
    STATUS_FILTERS.slice(1).forEach((status) => {
      result[status] = properties.filter((p) => p.admin_approval === status).length;
    });
    return result;
  }, [properties]);

  const visibleProperties = useMemo(
    () =>
      statusFilter === "All"
        ? properties
        : properties.filter((p) => p.admin_approval === statusFilter),
    [properties, statusFilter]
  );

  const shownProperties = visibleProperties;
  const remaining = Math.max(0, total - properties.length);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
            <FontAwesomeIcon icon={faBuilding} className="text-[#7A0E2E]" />
            Recent Properties
          </h1>
          <p className="text-sm text-gray-500">Latest listings posted on the platform.</p>
        </div>
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/admin" className="text-[#7A0E2E] hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-800">Recent Properties</span>
        </nav>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 mb-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        {STATUS_FILTERS.map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                active
                  ? "bg-[#7A0E2E] text-white border-[#7A0E2E]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status}
              <span className={`ml-1.5 ${active ? "text-white/80" : "text-gray-400"}`}>
                {counts[status] ?? 0}
              </span>
            </button>
          );
        })}
        <span className="ml-auto text-sm text-gray-500">
          Showing {visibleProperties.length} of {total}
        </span>
      </div>

      {errors && (
        <div className="px-4 py-3 mb-5 text-sm text-rose-800 border rounded-lg bg-rose-50 border-rose-200">
          {errors}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Loading properties…</div>
      ) : visibleProperties.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed rounded-2xl border-gray-300 text-sm text-gray-500">
          No {statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}properties to show.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shownProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              copied={copiedId === property._id}
              onCopy={handleCopyId}
              onView={(p) => navigate(`/property-details/${p._id}`)}
            />
          ))}
        </div>
      )}

      {!loading && remaining > 0 && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="px-5 py-2.5 text-sm font-semibold text-[#7A0E2E] bg-white border-2 border-[#7A0E2E] rounded-xl hover:bg-rose-50 transition-colors disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : `Load more (${remaining} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentProperties;
