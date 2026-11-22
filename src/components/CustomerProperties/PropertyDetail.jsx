import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Home,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Share2,
  Eye,
  ShieldCheck,
  Layers,
  Compass,
  Car,
  Zap,
  Droplets,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Award,
  FileText,
  KeyRound,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { PiCricketThin } from "react-icons/pi";
import { MyContext } from "../../App";

const PropertyDetail = () => {
  const { can } = useContext(MyContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [propertyDetails, setPropertyDetails] = useState({});
  const [propertyImages, setPropertyImages] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const userId = "67f0ff69d7908f15767d3e64";

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return "N/A";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2).replace(/\.00$/, "") + " Cr";
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2).replace(/\.00$/, "") + " L";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2).replace(/\.00$/, "") + " K";
    }
    return num.toLocaleString("en-IN");
  };

  // Convert and format area
  const formatArea = (area, unit) => {
    if (!area) return null;
    return `${area} ${unit || "Sq Ft"}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Normalize image URL
  const getFullMediaUrl = (path) => {
    if (!path) return "";
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    ) {
      return path;
    }
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (cleanPath.startsWith("/media/")) {
      return `${baseUrl}${cleanPath}`;
    }
    return `${baseUrl}/media${cleanPath}`;
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // Record view
  useEffect(() => {
    const customer_id = sessionStorage.getItem("accessToken");
    if (propertyDetails?._id && propertyDetails?.user_id && customer_id) {
      const formData = new FormData();
      formData.append("property_id", propertyDetails?._id);
      formData.append("user_id", propertyDetails?.user_id);
      formData.append("customer_id", customer_id);

      axios
        .post(
          `${process.env.REACT_APP_API_BASE_URL}/cust_api/add_view_property`,
          formData
        )
        .catch(() => {});
    }
  }, [propertyDetails?._id, propertyDetails?.user_id]);

  // Fetch property details
  const fetchPropertyDetails = async (propId) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_details`,
        { property_id: propId, user_id: userId }
      );

      const data = res.data?.data;
      if (data) {
        setPropertyDetails(data.property_details || {});
        setPropertyImages(data.property_images || []);
        setAllAmenities(data.amenities || []);
        if (data.user_details && data.user_details.length > 0) {
          setUserDetails(data.user_details[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
    window.scrollTo(0, 0);
  }, [id]);

  // Approval handler
  const handleApproval = async (newStatus) => {
    if (!propertyDetails?._id) return;
    try {
      setActionLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/update_property_status`,
        {
          property_id: propertyDetails._id,
          admin_approval: newStatus,
        }
      );

      if (res.status === 200 || res.data?.status === 1) {
        setPropertyDetails((prev) => ({
          ...prev,
          admin_approval: newStatus,
        }));
        Swal.fire({
          icon: "success",
          title: `Property marked as ${newStatus}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data?.message || "Could not update property status",
        });
      }
    } catch (err) {
      console.error("Error updating approval status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the status.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Compile media list (cover + images + video)
  const mediaList = useMemo(() => {
    const list = [];
    if (propertyDetails?.cover_image) {
      list.push({
        type: "image",
        url: getFullMediaUrl(propertyDetails.cover_image),
        label: "Cover Image",
      });
    }
    if (propertyImages && propertyImages.length > 0) {
      propertyImages.forEach((img, idx) => {
        const url = getFullMediaUrl(img.image);
        if (url && !list.some((item) => item.url === url)) {
          list.push({
            type: "image",
            url: url,
            label: `Photo ${idx + 1}`,
          });
        }
      });
    }
    if (propertyDetails?.property_video) {
      list.push({
        type: "video",
        url: getFullMediaUrl(propertyDetails.property_video),
        label: "Property Video",
      });
    }
    return list;
  }, [propertyDetails?.cover_image, propertyDetails?.property_video, propertyImages]);

  // Calculations for quick stats
  const isRent = propertyDetails?.property_category_type === "Rent" || !!propertyDetails?.rent;
  const displayPrice = isRent
    ? propertyDetails?.rent
    : propertyDetails?.property_price;
  const priceUnit = isRent
    ? propertyDetails?.rent_duration
      ? `/${propertyDetails.rent_duration}`
      : "/month"
    : "";

  const pricePerSqFt = useMemo(() => {
    const p = parseFloat(propertyDetails?.property_price);
    const a = parseFloat(propertyDetails?.area);
    if (!isNaN(p) && !isNaN(a) && a > 0 && !isRent) {
      return Math.round(p / a);
    }
    return null;
  }, [propertyDetails?.property_price, propertyDetails?.area, isRent]);

  // Approval badge renderer
  const renderApprovalBadge = (status) => {
    const s = String(status || "Pending").trim();
    if (s.toLowerCase() === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Approved
        </span>
      );
    }
    if (s.toLowerCase() === "disapproved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} className="text-rose-600" />
          Disapproved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={13} className="text-amber-600" />
        Pending Review
      </span>
    );
  };

  // Structured spec groups
  const specsDimensions = [
    ["Built-up Area", formatArea(propertyDetails?.area, propertyDetails?.area_in)],
    ["Carpet Area", formatArea(propertyDetails?.carpet_area, propertyDetails?.carpet_area_unit)],
    ["Area Type", propertyDetails?.area_type],
    ["Plot No.", propertyDetails?.plot_no],
    ["Property No. / RERA", propertyDetails?.property_no],
    ["Dimensions (L x B)", propertyDetails?.property_dimensions_length && propertyDetails?.property_dimensions_breadth
      ? `${propertyDetails.property_dimensions_length} ft × ${propertyDetails.property_dimensions_breadth} ft`
      : null],
    ["Land Length", propertyDetails?.length_of_land],
    ["Land Breadth", propertyDetails?.breadthOfLand],
    ["Open Sides of Land", propertyDetails?.openSidesOfLand || propertyDetails?.no_of_open_sides],
    ["Construction on Land", propertyDetails?.constructionOnLand || propertyDetails?.selectedConstructionOnLand],
    ["Ceiling Height", propertyDetails?.ceiling_height ? `${propertyDetails.ceiling_height} ft` : null],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsFinancials = [
    ["Transaction Category", propertyDetails?.property_category_type],
    ["Base Price", propertyDetails?.property_price ? `₹${formatPrice(propertyDetails.property_price)}` : null],
    ["Rent", propertyDetails?.rent ? `₹${formatPrice(propertyDetails.rent)} ${priceUnit}` : null],
    ["Maintenance Cost", propertyDetails?.maintenance_cost ? `₹${propertyDetails.maintenance_cost}` : null],
    ["Maintenance Frequency", propertyDetails?.maintenance_frequency],
    ["Maintenance Included", propertyDetails?.maintenance_included !== undefined ? (propertyDetails.maintenance_included ? "Yes" : "No") : null],
    ["Security Deposit Type", propertyDetails?.security_deposit_type],
    ["Custom Deposit Amount", propertyDetails?.custom_deposit_amount ? `₹${formatPrice(propertyDetails.custom_deposit_amount)}` : null],
    ["Price Negotiable", propertyDetails?.price_negotiable],
    ["All Inclusive Price", propertyDetails?.all_inclusive_price],
    ["Tax & Govt Charges Included", propertyDetails?.tax_and_goverment_charges],
    ["Electricity & Water Charges", propertyDetails?.electricity_and_water_charges],
    ["Price Onwards", propertyDetails?.price_onwards],
    ["Investment Options", propertyDetails?.investment_options],
    ["Loan Availability", propertyDetails?.loan_availability],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsLayout = [
    ["BHK Configuration", propertyDetails?.bhk_type],
    ["Building Type", propertyDetails?.building_type],
    ["Property Type", propertyDetails?.property_type],
    ["Office / Space Type", propertyDetails?.office_space_type || propertyDetails?.office_type],
    ["Builder Floor Type", propertyDetails?.builder_floor_type],
    ["Floor", propertyDetails?.property_floor && propertyDetails?.total_floor
      ? `${propertyDetails.property_floor} of ${propertyDetails.total_floor} Floors`
      : propertyDetails?.property_floor],
    ["Total Floors", propertyDetails?.total_floor],
    ["Tower / Block", propertyDetails?.block],
    ["Bathrooms", propertyDetails?.bathroom],
    ["Attached Bathrooms", propertyDetails?.attached_bathroom],
    ["Balconies", propertyDetails?.balcony],
    ["Attached Balconies", propertyDetails?.attached_balcony],
    ["Additional Rooms", propertyDetails?.additional_rooms],
    ["Total Rooms", propertyDetails?.total_number_of_rooms],
    ["Pantry Option", propertyDetails?.pantry_option || propertyDetails?.pantry],
    ["Personal Washroom", propertyDetails?.personal_washroom],
    ["Commercial Washroom", propertyDetails?.commercial_washroom],
    ["Reception Area", propertyDetails?.reception_area],
    ["Cabins", propertyDetails?.no_of_cabines],
    ["Meeting Rooms", propertyDetails?.no_of_meeting_Rooms],
    ["Conference Room", propertyDetails?.no_of_conference_room || propertyDetails?.conferenceRoom],
    ["Seat Type", propertyDetails?.seat_type],
    ["Seats Available", propertyDetails?.number_of_seats_available],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsFeatures = [
    ["Furnishing Status", propertyDetails?.furnished_type],
    ["Facing Direction", propertyDetails?.facing],
    ["View", propertyDetails?.view],
    ["Flooring Type", propertyDetails?.flooring],
    ["Power Backup", propertyDetails?.power_backup],
    ["Lift Availability", propertyDetails?.lift_availability],
    ["Water Source", propertyDetails?.water_source],
    ["Central AC", propertyDetails?.central_AC || propertyDetails?.centralAC],
    ["Construction Type", propertyDetails?.type_of_construction],
    ["Quality Rating", propertyDetails?.quality_rating],
    ["UPS Backup", propertyDetails?.ups],
    ["Oxygen Duct", propertyDetails?.oxygenDuct],
    ["Virtual Tour", propertyDetails?.virtual_tour_availability],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsParking = [
    ["Parking Availability", propertyDetails?.parking_availability],
    ["Total Parking Spaces", propertyDetails?.total_number_parking],
    ["Covered Parking", propertyDetails?.covered_parking],
    ["Open / Uncovered Parking", propertyDetails?.uncovered_parking],
    ["Parking Types", propertyDetails?.parking_types],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsStatus = [
    ["Availability Status", propertyDetails?.available_status],
    ["Possession Status", propertyDetails?.possession_status],
    ["Possession Date", formatDate(propertyDetails?.possession_date)],
    ["Possession By", propertyDetails?.possession_by],
    ["Available From", propertyDetails?.available_from || propertyDetails?.available_on],
    ["Age of Property", propertyDetails?.age_of_property ? `${propertyDetails.age_of_property} Years` : null],
    ["Operating Since", propertyDetails?.operating_since ? `${propertyDetails.operating_since} Years` : null],
    ["Immediate Available", propertyDetails?.isImmediateAvailable],
    ["Ownership", propertyDetails?.ownership],
    ["Listed Date", formatDate(propertyDetails?.property_added_date || propertyDetails?.created_at)],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsRental = [
    ["Available For", propertyDetails?.available_for],
    ["Suited For", propertyDetails?.suited_for],
    ["Room Type", propertyDetails?.room_type],
    ["Total Beds", propertyDetails?.total_beds],
    ["Available Beds", propertyDetails?.available_beds],
    ["Food Available", propertyDetails?.food_available],
    ["Food Charges Included", propertyDetails?.food_charges_included],
    ["Notice Period", propertyDetails?.notice_period ? `${propertyDetails.notice_period} Days` : null],
    ["Notice Period Other Days", propertyDetails?.notice_period_other_days],
    ["Electricity Included", propertyDetails?.electricity_charges_included],
    ["Gate Closing Time", propertyDetails?.gate_closing_time],
    ["Gate Closing Hour", propertyDetails?.gate_closing_hour],
    ["PG Rules", propertyDetails?.pg_rules],
    ["PG Services", propertyDetails?.pg_services],
    ["Min Lock-in Period", propertyDetails?.min_lockin_period],
    ["Available for Company Lease", propertyDetails?.available_for_company_lease],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-[#7A0E2E] rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Loading Property Dossier...
        </p>
      </div>
    );
  }

  const activeMedia = mediaList[activeMediaIndex] || mediaList[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#7A0E2E] transition-colors shadow-sm"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Link to="/admin" className="hover:text-[#7A0E2E]">Dashboard</Link>
              <span>/</span>
              <Link to="/properties" className="hover:text-[#7A0E2E]">Properties</Link>
              <span>/</span>
              <span className="text-gray-800 font-semibold">Property Dossier</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
              {propertyDetails?.property_name || "Property Details"}
            </h1>
          </div>
        </div>

        {/* Quick Admin Actions & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {renderApprovalBadge(propertyDetails?.admin_approval)}

          {(can("myInventory", "approve") ||
            can("inquiries", "approve") ||
            can("admin", "approve")) && (
            <div className="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white p-0.5">
              <button
                type="button"
                disabled={actionLoading || propertyDetails?.admin_approval === "Approved"}
                onClick={() => handleApproval("Approved")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  propertyDetails?.admin_approval === "Approved"
                    ? "bg-emerald-600 text-white shadow-xs cursor-default"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <CheckCircle2 size={13} />
                Approve
              </button>
              <button
                type="button"
                disabled={actionLoading || propertyDetails?.admin_approval === "Disapproved"}
                onClick={() => handleApproval("Disapproved")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  propertyDetails?.admin_approval === "Disapproved"
                    ? "bg-rose-600 text-white shadow-xs cursor-default"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <XCircle size={13} />
                Disapprove
              </button>
            </div>
          )}

          <button
            onClick={() => copyToClipboard(window.location.href, "url")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {copiedField === "url" ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Title and Tags */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-[#7A0E2E] border border-rose-200">
                {propertyDetails?.property_category_type || "Sale"}
              </span>
              {propertyDetails?.property_type && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {propertyDetails.property_type}
                </span>
              )}
              {propertyDetails?.bhk_type && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {propertyDetails.bhk_type}
                </span>
              )}
              {propertyDetails?.furnished_type && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  {propertyDetails.furnished_type}
                </span>
              )}
              {propertyDetails?.mark_as_featured === "Yes" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles size={12} className="text-amber-500" />
                  Featured
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {propertyDetails?.property_name || "Exclusive Property"}
              </h2>
              <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <MapPin size={15} className="text-[#7A0E2E] shrink-0" />
                <span>
                  {propertyDetails?.address || "Address Not Available"}
                  {propertyDetails?.city_name && `, ${propertyDetails.city_name}`}
                  {propertyDetails?.state && `, ${propertyDetails.state}`}
                  {propertyDetails?.zip_code && ` - ${propertyDetails.zip_code}`}
                </span>
              </p>
            </div>

            {/* Micro Details Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60">
                <Calendar size={13} className="text-gray-400" />
                Listed: {formatDate(propertyDetails?.property_added_date || propertyDetails?.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60">
                <User size={13} className="text-gray-400" />
                Listed By: {propertyDetails?.user_type || userDetails?.user_type || "Owner"}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60 font-mono">
                ID: {propertyDetails?._id || id}
              </span>
            </div>
          </div>

          {/* Right Price Card */}
          <div className="lg:text-right bg-gradient-to-br from-rose-50/50 to-amber-50/30 p-4 rounded-xl border border-rose-100 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isRent ? "Rental Value" : "Asking Price"}
            </span>
            <div className="flex items-baseline lg:justify-end gap-1 mt-1">
              <span className="text-2xl md:text-3xl font-extrabold text-[#7A0E2E]">
                ₹{formatPrice(displayPrice)}
              </span>
              {priceUnit && (
                <span className="text-sm font-semibold text-gray-600">
                  {priceUnit}
                </span>
              )}
            </div>

            {pricePerSqFt && (
              <span className="text-xs font-medium text-gray-600 mt-1">
                ₹{pricePerSqFt.toLocaleString("en-IN")} / Sq Ft
              </span>
            )}

            <div className="flex flex-wrap lg:justify-end gap-1.5 mt-2.5">
              {propertyDetails?.price_negotiable === "Yes" && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
                  Negotiable
                </span>
              )}
              {propertyDetails?.all_inclusive_price === "Yes" && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                  All Inclusive
                </span>
              )}
              {propertyDetails?.maintenance_included && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-100/70 text-purple-800">
                  Maintenance Incl.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Home size={13} className="text-[#7A0E2E]" /> BHK
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {propertyDetails?.bhk_type || "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Maximize2 size={13} className="text-[#7A0E2E]" /> Super Area
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {propertyDetails?.area ? `${propertyDetails.area} ${propertyDetails.area_in || "Sq Ft"}` : "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Bath size={13} className="text-[#7A0E2E]" /> Bathrooms
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {propertyDetails?.bathroom || "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Layers size={13} className="text-[#7A0E2E]" /> Floor
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5 truncate" title={propertyDetails?.property_floor}>
              {propertyDetails?.property_floor && propertyDetails?.total_floor
                ? `${propertyDetails.property_floor} / ${propertyDetails.total_floor}`
                : propertyDetails?.property_floor || "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Compass size={13} className="text-[#7A0E2E]" /> Facing
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {propertyDetails?.facing || "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 size={13} className="text-[#7A0E2E]" /> Status
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {propertyDetails?.available_status || "Available"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Media & Specs on Left, Contact & Meta on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Media Showcase */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Property Gallery</span>
                <span className="text-xs font-normal text-gray-500">
                  ({mediaList.length} media available)
                </span>
              </h3>
              {mediaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="text-xs font-semibold text-[#7A0E2E] hover:underline flex items-center gap-1"
                >
                  <Eye size={13} />
                  View Lightbox
                </button>
              )}
            </div>

            {/* Active Display Stage */}
            <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              {mediaList.length === 0 ? (
                <div className="text-center text-gray-400 p-6">
                  <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No images or videos uploaded for this property</p>
                </div>
              ) : activeMedia?.type === "video" ? (
                <video
                  controls
                  className="w-full h-full object-contain"
                  src={activeMedia.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={activeMedia?.url}
                  alt={activeMedia?.label || "Property Preview"}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setShowGalleryModal(true)}
                />
              )}

              {/* Prev / Next Buttons */}
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveMediaIndex((prev) =>
                        prev === 0 ? mediaList.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors shadow-md"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveMediaIndex((prev) =>
                        prev === mediaList.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors shadow-md"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-black/70 text-white text-xs font-mono">
                {activeMediaIndex + 1} / {mediaList.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                {mediaList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      activeMediaIndex === idx
                        ? "border-[#7A0E2E] ring-2 ring-rose-200"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                        <Video size={18} />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Specifications Cards */}
          <div className="space-y-6">
            {/* Dimensions & Structure */}
            {specsDimensions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Maximize2 size={16} className="text-[#7A0E2E]" />
                  <span>Area, Dimensions & Land Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsDimensions.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Terms & Maintenance */}
            {specsFinancials.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <DollarSign size={16} className="text-[#7A0E2E]" />
                  <span>Pricing, Rent & Financial Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsFinancials.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layout & Room Specifications */}
            {specsLayout.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Building2 size={16} className="text-[#7A0E2E]" />
                  <span>Room & Space Configuration</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsLayout.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features, Utilities & Building */}
            {specsFeatures.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Zap size={16} className="text-[#7A0E2E]" />
                  <span>Features, Furnishing & Utilities</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsFeatures.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parking Details */}
            {specsParking.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Car size={16} className="text-[#7A0E2E]" />
                  <span>Parking Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsParking.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rental / PG / Co-living Section (if present) */}
            {specsRental.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <KeyRound size={16} className="text-[#7A0E2E]" />
                  <span>Rental & PG Specifics</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsRental.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status & Legal Details */}
            {specsStatus.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#7A0E2E]" />
                  <span>Possession & Listing Timeline</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsStatus.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {allAmenities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#7A0E2E]" />
                    <span>Amenities & Facilities</span>
                  </h3>
                  <span className="text-xs text-gray-500">
                    {allAmenities.length} Total
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(showAllAmenities ? allAmenities : allAmenities.slice(0, 12)).map(
                    (amenity, index) => (
                      <div
                        key={amenity._id || index}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-rose-50/40 hover:border-rose-100 transition-colors"
                      >
                        {amenity.icon ? (
                          <img
                            src={getFullMediaUrl(amenity.icon)}
                            alt={amenity.name}
                            className="w-6 h-6 object-contain shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <PiCricketThin className="text-base text-[#7A0E2E] shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-800 truncate">
                          {amenity.name}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {allAmenities.length > 12 && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="text-xs font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {showAllAmenities
                        ? "Show Less"
                        : `+${allAmenities.length - 12} More Amenities`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Property Description */}
            {propertyDetails?.property_description && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-3 border-b border-gray-100 flex items-center gap-2">
                  <FileText size={16} className="text-[#7A0E2E]" />
                  <span>About This Property</span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {propertyDetails.property_description}
                </p>
              </div>
            )}

            {/* Location & Map */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 pb-3 mb-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-[#7A0E2E]" />
                <span>Location & Geo Coordinates</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Address</span>
                  <p className="font-medium text-gray-800">
                    {propertyDetails?.address || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Area / Landmark</span>
                  <p className="font-medium text-gray-800">
                    {propertyDetails?.near_landmark || propertyDetails?.address_area || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">City, State</span>
                  <p className="font-medium text-gray-800">
                    {propertyDetails?.city_name || "N/A"}
                    {propertyDetails?.state ? `, ${propertyDetails.state}` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Zip Code & Country</span>
                  <p className="font-medium text-gray-800">
                    {propertyDetails?.zip_code || "N/A"}, {propertyDetails?.country || "India"}
                  </p>
                </div>
              </div>

              {propertyDetails?.latitude && propertyDetails?.longitude ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 h-64 sm:h-80">
                  <iframe
                    title="Property Map Location"
                    className="w-full h-full border-0"
                    src={`https://maps.google.com/maps?q=${propertyDetails.latitude},${propertyDetails.longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
                  Map coordinates not specified for this property.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Lister & Admin Meta (1 Col) */}
        <div className="space-y-6">
          {/* Lister / Contact Information Card */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User size={16} className="text-[#7A0E2E]" />
                <span>Lister & Owner Information</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-[#7A0E2E] border border-rose-100">
                {propertyDetails?.user_type || userDetails?.user_type || "Owner"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Primary User Contact */}
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
                  Registered Account Details
                </span>
                <div>
                  <span className="text-xs text-gray-400 block">Full Name</span>
                  <p className="text-sm font-bold text-gray-900">
                    {userDetails?.full_name || propertyDetails?.connect_to_name || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Mobile Phone</span>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${userDetails?.mobile_number || propertyDetails?.connect_to_no}`}
                      className="text-sm font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {userDetails?.mobile_number || propertyDetails?.connect_to_no || "N/A"}
                    </a>
                    {(userDetails?.mobile_number || propertyDetails?.connect_to_no) && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            userDetails?.mobile_number || propertyDetails?.connect_to_no,
                            "phone"
                          )
                        }
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title="Copy Phone"
                      >
                        {copiedField === "phone" ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Email Address</span>
                  <div className="flex items-center justify-between">
                    <a
                      href={`mailto:${userDetails?.email || propertyDetails?.connect_to_email}`}
                      className="text-xs font-medium text-gray-800 hover:text-[#7A0E2E] truncate max-w-[190px]"
                    >
                      {userDetails?.email || propertyDetails?.connect_to_email || "N/A"}
                    </a>
                    {(userDetails?.email || propertyDetails?.connect_to_email) && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            userDetails?.email || propertyDetails?.connect_to_email,
                            "email"
                          )
                        }
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title="Copy Email"
                      >
                        {copiedField === "email" ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Point of Contact (Connect To) */}
              {(propertyDetails?.connect_to_name || propertyDetails?.connect_to_no) && (
                <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
                    Direct Point of Contact
                  </span>
                  <div className="text-sm">
                    <span className="text-gray-500 text-xs">Name: </span>
                    <span className="font-semibold text-gray-900">
                      {propertyDetails.connect_to_name || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 text-xs">Contact: </span>
                    <a
                      href={`tel:${propertyDetails.connect_to_no}`}
                      className="font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {propertyDetails.connect_to_no || "N/A"}
                    </a>
                  </div>
                </div>
              )}

              {/* Administrative Identifiers */}
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 space-y-2 text-xs">
                <span className="font-semibold text-gray-500 block uppercase tracking-wider">
                  Admin References
                </span>
                <div className="flex justify-between py-1 border-b border-gray-200/50">
                  <span className="text-gray-500">Property ID</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {propertyDetails?._id || id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-gray-700">
                    {propertyDetails?.user_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50">
                  <span className="text-gray-500">RERA ID</span>
                  <span className="font-medium text-gray-900">
                    {propertyDetails?.property_no || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Posted By Admin</span>
                  <span className="font-medium text-gray-900">
                    {propertyDetails?.posted_by_admin || "No"}
                  </span>
                </div>
              </div>

              {/* Direct Links */}
              <div className="pt-2">
                <Link
                  to="/properties"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors"
                >
                  <ArrowLeft size={14} />
                  Return to Properties Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for All Media */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 text-white">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base">
                  {propertyDetails?.property_name || "Gallery"}
                </h3>
                <span className="text-xs text-neutral-400">
                  ({mediaList.length} total)
                </span>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Active View */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] p-2">
              {activeMedia?.type === "video" ? (
                <video
                  controls
                  autoPlay
                  className="max-h-[60vh] max-w-full rounded"
                  src={activeMedia.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={activeMedia?.url}
                  alt="Gallery Active"
                  className="max-h-[60vh] max-w-full object-contain rounded"
                />
              )}

              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveMediaIndex((prev) =>
                        prev === 0 ? mediaList.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveMediaIndex((prev) =>
                        prev === mediaList.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Modal Thumbnail Footer */}
            <div className="flex gap-2 p-4 bg-neutral-900 border-t border-neutral-800 overflow-x-auto">
              {mediaList.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-16 h-12 rounded overflow-hidden shrink-0 border-2 transition-all ${
                    activeMediaIndex === idx
                      ? "border-[#7A0E2E] scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white">
                      <Video size={14} />
                    </div>
                  ) : (
                    <img
                      src={m.url}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
