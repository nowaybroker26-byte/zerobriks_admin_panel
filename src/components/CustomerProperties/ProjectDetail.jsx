import React, { useState, useEffect, useContext, useMemo } from "react";
import { EP, API_BASE_URL } from '../../Api/endpoints';
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
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Award,
  FileText,
  KeyRound,
  Grid,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { PiCricketThin } from "react-icons/pi";
import { MyContext } from "../../App";

const ProjectDetail = () => {
  const { can } = useContext(MyContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectDetails, setProjectDetails] = useState({});
  const [projectProperties, setProjectProperties] = useState([]);
  const [images, setImages] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // Floor plan selector state
  const [selectedBHK, setSelectedBHK] = useState("");
  const [selectedFloorPlan, setSelectedFloorPlan] = useState(null);

  const userId = "67f0ff69d7908f15767d3e64";

  // Price formatting helper
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

  // Average price range formatter
  const formatAveragePrice = (price) => {
    if (!price) return "N/A";
    if (typeof price === "string" && price.includes("-")) {
      const parts = price.split("-").map((p) => p.trim());
      return `₹${formatPrice(parts[0])} - ₹${formatPrice(parts[1])}`;
    }
    return `₹${formatPrice(price)}`;
  };

  // Format date helper
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

  // Copy helper
  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // Fetch Project Details
  const fetchProjectDetails = async (projId) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${EP?.CUST_API_GET_PROJECT_DETAILS || `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_project_details`}`,
        { project_id: projId, user_id: userId },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data?.data;
      if (data) {
        setProjectDetails(data.project_details || {});
        setImages(data.project_images || []);
        setAmenitiesList(data.amenities || []);
        const props = data.project_properties || [];
        setProjectProperties(props);

        if (props.length > 0) {
          const firstBHK = props[0].bhk;
          setSelectedBHK(firstBHK);
          setSelectedFloorPlan(props[0].area);
        }

        if (data.user_details && data.user_details.length > 0) {
          setUserDetails(data.user_details[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails(id);
    }
    window.scrollTo(0, 0);
  }, [id]);

  // Approval handler
  const handleApproval = async (newStatus) => {
    if (!projectDetails?._id) return;
    try {
      setActionLoading(true);
      const res = await axios.post(
        `${EP?.API_UPDATE_PROJECT_STATUS || `${process.env.REACT_APP_API_BASE_URL}/api/update_project_status`}`,
        {
          project_id: projectDetails._id,
          admin_approval: newStatus,
        }
      );

      if (res.status === 200 || res.data?.status === 1) {
        setProjectDetails((prev) => ({
          ...prev,
          admin_approval: newStatus,
        }));
        Swal.fire({
          icon: "success",
          title: `Project marked as ${newStatus}`,
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
          text: res.data?.message || "Could not update project status",
        });
      }
    } catch (err) {
      console.error("Error updating project approval:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the project status.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Download Brochure
  const handleDownloadBrochure = () => {
    const filePath = projectDetails?.brochure_doc;
    if (filePath) {
      const fileUrl = getFullMediaUrl(filePath);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = filePath.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Swal.fire({
        icon: "info",
        title: "No Brochure",
        text: "Brochure document is not available for this project.",
      });
    }
  };

  // Media List (Cover + Gallery Images + Project Video)
  const mediaList = useMemo(() => {
    const list = [];
    if (projectDetails?.cover_image) {
      list.push({
        type: "image",
        url: getFullMediaUrl(projectDetails.cover_image),
        label: "Cover Image",
      });
    }
    if (images && images.length > 0) {
      images.forEach((img, idx) => {
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
    if (projectDetails?.property_video) {
      list.push({
        type: "video",
        url: getFullMediaUrl(projectDetails.property_video),
        label: "Project Video",
      });
    }
    return list;
  }, [projectDetails?.cover_image, projectDetails?.property_video, images]);

  // Unique BHKs for floor plan filter
  const availableBHKs = useMemo(() => {
    const bhks = new Set();
    projectProperties.forEach((p) => {
      if (p.bhk) bhks.add(p.bhk);
    });
    return Array.from(bhks);
  }, [projectProperties]);

  // Properties filtered by selected BHK
  const filteredBHKProperties = useMemo(() => {
    if (!selectedBHK) return projectProperties;
    return projectProperties.filter((p) => p.bhk === selectedBHK);
  }, [projectProperties, selectedBHK]);

  // Active Floor Plan
  const activePlan = useMemo(() => {
    if (!filteredBHKProperties.length) return null;
    return (
      filteredBHKProperties.find((p) => p.area === selectedFloorPlan) ||
      filteredBHKProperties[0]
    );
  }, [filteredBHKProperties, selectedFloorPlan]);

  // Price calculations from project_properties
  const priceRange = useMemo(() => {
    if (!projectProperties.length) return null;
    const prices = projectProperties
      .map((p) => Number(p.price))
      .filter((n) => !isNaN(n) && n > 0);
    if (!prices.length) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  }, [projectProperties]);

  const pricePerSqFtRange = useMemo(() => {
    if (!projectProperties.length) return null;
    const rates = projectProperties
      .map((p) => {
        const pr = Number(p.price);
        const ar = Number(p.area);
        return !isNaN(pr) && !isNaN(ar) && ar > 0 ? pr / ar : null;
      })
      .filter((v) => v !== null);
    if (!rates.length) return null;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    return { minRate, maxRate };
  }, [projectProperties]);

  // Finishing Data specs
  const finishingData = useMemo(() => {
    const pd = projectDetails || {};
    return {
      Floors: [
        ["Living & Dining", pd.floor_living_dining],
        ["Kitchen & Toilets", pd.floor_kitchen_toilet],
        ["Bedrooms", pd.floor_bedroom],
        ["Balcony", pd.floor_balcony],
      ],
      Walls: [
        ["Living & Dining", pd.walls_living_dining],
        ["Kitchen & Toilets", pd.walls_kitchen_toilet],
        ["Servant Room", pd.walls_servant_room],
      ],
      Ceilings: [
        ["General Areas", pd.ceiling],
        ["Servant Room", pd.ceilings_servant_room],
      ],
      Counters: [["Kitchen & Toilets", pd.counters_kitchen_toilet]],
      "Fittings & Fixtures": [
        ["Kitchen & Toilets", pd.fittings_fixtures_kitchen_toilet],
        ["Servant Room Toilet", pd.fittings_fixtures_servant_room_toilet],
      ],
      "Doors & Windows": [
        ["Internal Doors", pd.door_window_internal_door],
        ["External Glazing", pd.door_window_external_glazing],
      ],
      Electrical: [
        ["Main Electricals", pd.electrical],
        ["Power Backup", pd.backup],
      ],
      Security: [["Security System", pd.security_system]],
    };
  }, [projectDetails]);

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
  const specsProjectDimensions = [
    ["Total Project Size", projectDetails?.total_project_size ? `${projectDetails.total_project_size} Units/Acres` : null],
    ["Configurations", projectDetails?.congfigurations || projectDetails?.bhk_type],
    ["Built-up Area", projectDetails?.area ? `${projectDetails.area} ${projectDetails.area_in || "Sq Ft"}` : null],
    ["Carpet Area", projectDetails?.carpet_area ? `${projectDetails.carpet_area} ${projectDetails.carpet_area_unit || "Sq Ft"}` : null],
    ["Area Type", projectDetails?.area_type],
    ["Plot No.", projectDetails?.plot_no],
    ["Property No. / Code", projectDetails?.property_no],
    ["Land Dimensions (L x B)", projectDetails?.length_of_land && projectDetails?.breadthOfLand
      ? `${projectDetails.length_of_land} ft × ${projectDetails.breadthOfLand} ft`
      : null],
    ["Property Dimensions", projectDetails?.property_dimensions_length && projectDetails?.property_dimensions_breadth
      ? `${projectDetails.property_dimensions_length} ft × ${projectDetails.property_dimensions_breadth} ft`
      : null],
    ["Open Sides of Land", projectDetails?.openSidesOfLand || projectDetails?.no_of_open_sides],
    ["Construction on Land", projectDetails?.constructionOnLand || projectDetails?.selectedConstructionOnLand],
    ["Ceiling Height", projectDetails?.ceiling_height ? `${projectDetails.ceiling_height} ft` : null],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsProjectFinancials = [
    ["Average Project Price", formatAveragePrice(projectDetails?.average_project_price)],
    ["Price Negotiable", projectDetails?.price_negotiable],
    ["All Inclusive Price", projectDetails?.all_inclusive_price],
    ["Tax & Govt Charges", projectDetails?.tax_and_goverment_charges],
    ["Electricity & Water Charges", projectDetails?.electricity_and_water_charges],
    ["Maintenance Cost", projectDetails?.maintenance_cost ? `₹${projectDetails.maintenance_cost}` : null],
    ["Maintenance Frequency", projectDetails?.maintenance_frequency],
    ["Maintenance Included", projectDetails?.maintenance_included !== undefined ? (projectDetails.maintenance_included ? "Yes" : "No") : null],
    ["Security Deposit Type", projectDetails?.security_deposit_type],
    ["Custom Deposit Amount", projectDetails?.custom_deposit_amount ? `₹${formatPrice(projectDetails.custom_deposit_amount)}` : null],
    ["Loan Availability", projectDetails?.loan_availability],
    ["Investment Options", projectDetails?.investment_options],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsProjectTimeline = [
    ["Construction Status", projectDetails?.construction_status],
    ["Possession Status", projectDetails?.possession_status],
    ["Launch Date", formatDate(projectDetails?.launch_date)],
    ["Possession Start", formatDate(projectDetails?.possession_start)],
    ["Possession Date", formatDate(projectDetails?.possession_date)],
    ["Possession By", projectDetails?.possession_by],
    ["Age of Property", projectDetails?.age_of_property ? `${projectDetails.age_of_property} Years` : null],
    ["Operating Since", projectDetails?.operating_since ? `${projectDetails.operating_since} Years` : null],
    ["Availability Status", projectDetails?.available_status],
    ["Available From", projectDetails?.available_from || projectDetails?.available_on],
    ["RERA Registration ID", projectDetails?.rera_id],
    ["Listing Date", formatDate(projectDetails?.property_added_date || projectDetails?.created_at)],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsProjectStructure = [
    ["Building Type", projectDetails?.building_type],
    ["Project Type", projectDetails?.project_type || projectDetails?.office_type],
    ["Furnishing Status", projectDetails?.furnished_type],
    ["Total Floors", projectDetails?.total_floor],
    ["Project Floor", projectDetails?.project_floor],
    ["Tower / Block", projectDetails?.block],
    ["Builder Floor Type", projectDetails?.builder_floor_type],
    ["Bathrooms", projectDetails?.bathroom],
    ["Attached Bathrooms", projectDetails?.attached_bathroom],
    ["Balconies", projectDetails?.balcony],
    ["Attached Balconies", projectDetails?.attached_balcony],
    ["Additional Rooms", projectDetails?.additional_rooms],
    ["Total Rooms", projectDetails?.total_number_of_rooms],
    ["Pantry Option", projectDetails?.pantry_option || projectDetails?.pantry],
    ["Washrooms", projectDetails?.washroom],
    ["Washroom Check", projectDetails?.washroom_Check],
    ["Commercial Washroom", projectDetails?.commercial_washroom],
    ["Personal Washroom", projectDetails?.personal_washroom],
    ["Reception Area", projectDetails?.reception_area],
    ["Cabins", projectDetails?.no_of_cabines],
    ["Meeting Rooms", projectDetails?.no_of_meeting_Rooms],
    ["Conference Room", projectDetails?.no_of_conference_room || projectDetails?.conferenceRoom],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsProjectUtilities = [
    ["Power Backup", projectDetails?.power_backup],
    ["Lift Availability", projectDetails?.lift_availability],
    ["Water Source", projectDetails?.water_source],
    ["Central AC", projectDetails?.central_AC],
    ["Flooring", projectDetails?.flooring],
    ["Facing", projectDetails?.facing],
    ["View", projectDetails?.view],
    ["Construction Type", projectDetails?.type_of_construction],
    ["Quality Rating", projectDetails?.quality_rating],
    ["UPS Backup", projectDetails?.ups],
    ["Oxygen Duct", projectDetails?.oxygenDuct],
    ["Virtual Tour Availability", projectDetails?.virtual_tour_availability],
    ["Security System", projectDetails?.security_system],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  const specsProjectParking = [
    ["Parking Availability", projectDetails?.parking_availability],
    ["Total Parking Spaces", projectDetails?.total_number_parking],
    ["Covered Parking", projectDetails?.covered_parking],
    ["Open / Uncovered Parking", projectDetails?.uncovered_parking],
    ["Parking Types", projectDetails?.parking_types],
  ].filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "NA" && v !== "N/A");

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-[#7A0E2E] rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Loading Project Dossier...
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
              <Link to="/projects" className="hover:text-[#7A0E2E]">Projects</Link>
              <span>/</span>
              <span className="text-gray-800 font-semibold">Project Dossier</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
              {projectDetails?.project_name || "Project Details"}
            </h1>
          </div>
        </div>

        {/* Quick Admin Actions & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {renderApprovalBadge(projectDetails?.admin_approval)}

          {(can("projects", "approve") || can("admin", "approve")) && (
            <div className="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white p-0.5">
              <button
                type="button"
                disabled={actionLoading || projectDetails?.admin_approval === "Approved"}
                onClick={() => handleApproval("Approved")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  projectDetails?.admin_approval === "Approved"
                    ? "bg-emerald-600 text-white shadow-xs cursor-default"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <CheckCircle2 size={13} />
                Approve
              </button>
              <button
                type="button"
                disabled={actionLoading || projectDetails?.admin_approval === "Disapproved"}
                onClick={() => handleApproval("Disapproved")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  projectDetails?.admin_approval === "Disapproved"
                    ? "bg-rose-600 text-white shadow-xs cursor-default"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <XCircle size={13} />
                Disapprove
              </button>
            </div>
          )}

          {projectDetails?.brochure_doc && (
            <button
              onClick={handleDownloadBrochure}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm"
              title="Download Project Brochure"
            >
              <Download size={13} className="text-[#7A0E2E]" />
              <span>Brochure</span>
            </button>
          )}

          <button
            onClick={() => copyToClipboard(window.location.href, "url")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {copiedField === "url" ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span>Copied</span>
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
                {projectDetails?.building_type || "Residential Project"}
              </span>
              {projectDetails?.project_type && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {projectDetails.project_type}
                </span>
              )}
              {projectDetails?.rera_id && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  RERA Registered
                </span>
              )}
              {projectDetails?.top_developer === "Yes" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Award size={12} className="text-blue-500" />
                  Top Developer
                </span>
              )}
              {projectDetails?.upcoming_project === "Yes" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Upcoming
                </span>
              )}
              {projectDetails?.mark_as_featured === "Yes" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles size={12} className="text-amber-500" />
                  Featured
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {projectDetails?.project_name || "Exclusive Project"}
              </h2>
              <p className="text-sm font-semibold text-[#7A0E2E] mt-0.5">
                By {projectDetails?.developer || projectDetails?.connect_to_name || userDetails?.full_name || "Renowned Developer"}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <MapPin size={15} className="text-[#7A0E2E] shrink-0" />
                <span>
                  {projectDetails?.address || "Address Not Available"}
                  {projectDetails?.city_name && `, ${projectDetails.city_name}`}
                  {projectDetails?.state && `, ${projectDetails.state}`}
                  {projectDetails?.zip_code && ` - ${projectDetails.zip_code}`}
                </span>
              </p>
            </div>

            {/* Micro Details Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60">
                <Calendar size={13} className="text-gray-400" />
                Launch: {formatDate(projectDetails?.launch_date)}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60">
                <Clock size={13} className="text-gray-400" />
                Possession: {formatDate(projectDetails?.possession_start || projectDetails?.possession_date)}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60 font-mono">
                ID: {projectDetails?._id || id}
              </span>
            </div>
          </div>

          {/* Right Price Card */}
          <div className="lg:text-right bg-gradient-to-br from-rose-50/50 to-amber-50/30 p-4 rounded-xl border border-rose-100 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price Range
            </span>
            <div className="mt-1">
              {priceRange ? (
                <span className="text-2xl md:text-3xl font-extrabold text-[#7A0E2E]">
                  {priceRange.min === priceRange.max ? (
                    `₹${formatPrice(priceRange.min)}`
                  ) : (
                    `₹${formatPrice(priceRange.min)} - ₹${formatPrice(priceRange.max)}`
                  )}
                </span>
              ) : (
                <span className="text-xl md:text-2xl font-extrabold text-[#7A0E2E]">
                  {formatAveragePrice(projectDetails?.average_project_price)}
                </span>
              )}
            </div>

            {pricePerSqFtRange && (
              <span className="text-xs font-medium text-gray-600 mt-1">
                {Math.round(pricePerSqFtRange.minRate) === Math.round(pricePerSqFtRange.maxRate)
                  ? `₹${Math.round(pricePerSqFtRange.minRate).toLocaleString("en-IN")} / Sq Ft`
                  : `₹${Math.round(pricePerSqFtRange.minRate).toLocaleString("en-IN")} - ₹${Math.round(pricePerSqFtRange.maxRate).toLocaleString("en-IN")} / Sq Ft`}
              </span>
            )}

            <div className="flex flex-wrap lg:justify-end gap-1.5 mt-2.5">
              {projectDetails?.price_negotiable === "Yes" && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
                  Negotiable
                </span>
              )}
              {projectDetails?.all_inclusive_price === "Yes" && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                  All Inclusive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Home size={13} className="text-[#7A0E2E]" /> Configurations
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5 truncate" title={projectDetails?.congfigurations || projectDetails?.bhk_type}>
              {projectDetails?.congfigurations || projectDetails?.bhk_type || "Multiple"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Building2 size={13} className="text-[#7A0E2E]" /> Project Size
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {projectDetails?.total_project_size ? `${projectDetails.total_project_size} Units` : "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Layers size={13} className="text-[#7A0E2E]" /> Total Floors
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {projectDetails?.total_floor || "N/A"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Clock size={13} className="text-[#7A0E2E]" /> Status
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5 truncate" title={projectDetails?.construction_status}>
              {projectDetails?.construction_status || "Active"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Calendar size={13} className="text-[#7A0E2E]" /> Possession
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5 truncate">
              {formatDate(projectDetails?.possession_start || projectDetails?.possession_date)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center sm:text-left">
            <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck size={13} className="text-[#7A0E2E]" /> Approval
            </span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {projectDetails?.admin_approval || "Approved"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Media & Specs on Left, Contact on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Showcase */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Project Gallery & Media</span>
                <span className="text-xs font-normal text-gray-500">
                  ({mediaList.length} items)
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

            {/* Display Stage */}
            <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              {mediaList.length === 0 ? (
                <div className="text-center text-gray-400 p-6">
                  <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No images or videos uploaded for this project</p>
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
                  alt={activeMedia?.label || "Project Media"}
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

          {/* Pricing & Floor Plans Interactive Section */}
          {projectProperties.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Grid size={16} className="text-[#7A0E2E]" />
                  <span>Floor Plans & Pricing Configurations</span>
                </h3>
                <span className="text-xs text-gray-500">
                  {projectProperties.length} Unit Plans
                </span>
              </div>

              {/* BHK Selection Tabs */}
              {availableBHKs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableBHKs.map((bhk) => {
                    const bhkProps = projectProperties.filter((p) => p.bhk === bhk);
                    const bhkPrices = bhkProps.map((p) => Number(p.price)).filter((n) => !isNaN(n));
                    const minP = bhkPrices.length ? Math.min(...bhkPrices) : null;

                    return (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => {
                          setSelectedBHK(bhk);
                          if (bhkProps.length > 0) {
                            setSelectedFloorPlan(bhkProps[0].area);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${
                          selectedBHK === bhk
                            ? "bg-[#7A0E2E] text-white border-[#7A0E2E] shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <div className="font-bold">{bhk} BHK</div>
                        {minP !== null && (
                          <div className={`text-[11px] ${selectedBHK === bhk ? "text-rose-100" : "text-gray-500"}`}>
                            From ₹{formatPrice(minP)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Plan Details & Layout */}
              {activePlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50/70 border border-gray-200/70">
                  {/* Floor Plan Image */}
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white h-56 sm:h-72 flex items-center justify-center">
                    {activePlan.image ? (
                      <img
                        src={getFullMediaUrl(activePlan.image)}
                        alt="Floor Plan"
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setShowFloorPlanModal(true)}
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-4">
                        <Grid size={36} className="mx-auto mb-2 opacity-40" />
                        <span className="text-xs">Floor plan drawing not uploaded</span>
                      </div>
                    )}
                    {activePlan.image && (
                      <button
                        type="button"
                        onClick={() => setShowFloorPlanModal(true)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black"
                      >
                        <Maximize2 size={11} /> Enlarge
                      </button>
                    )}
                  </div>

                  {/* Plan Information & Area Selector */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs font-bold text-[#7A0E2E] uppercase tracking-wider">
                        {activePlan.bhk ? `${activePlan.bhk} BHK Unit` : "Unit Plan"}
                      </span>
                      <h4 className="text-xl font-bold text-gray-900 mt-1">
                        ₹{formatPrice(activePlan.price)}
                      </h4>

                      {/* Area Variants */}
                      <div className="mt-4">
                        <span className="text-xs text-gray-500 font-semibold block mb-2">
                          Available Sizes / Variants:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {filteredBHKProperties.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedFloorPlan(item.area)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                item.area === activePlan.area
                                  ? "bg-rose-50 text-[#7A0E2E] border-rose-300 font-bold"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {item.area} {item.area_in || "Sq Ft"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-gray-200/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Super Built-up Area:</span>
                        <span className="font-semibold text-gray-900">
                          {activePlan.area} {activePlan.area_in || "Sq Ft"}
                        </span>
                      </div>
                      {activePlan.area_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Area Type:</span>
                          <span className="font-semibold text-gray-900">
                            {activePlan.area_type}
                          </span>
                        </div>
                      )}
                      {activePlan.price && activePlan.area && (
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-500">Estimated Rate:</span>
                          <span className="font-semibold text-[#7A0E2E]">
                            ₹{Math.round(Number(activePlan.price) / Number(activePlan.area)).toLocaleString("en-IN")} / Sq Ft
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finishing Details & Construction Specs */}
          {finishingData && (
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                <CheckSquare size={16} className="text-[#7A0E2E]" />
                <span>Materials & Finishing Specifications</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(finishingData).map(([category, items], idx) => {
                  const valid = items.filter(
                    ([_, val]) => val && val !== "N/A" && val !== "NA"
                  );
                  if (valid.length === 0) return null;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 space-y-2 text-xs"
                    >
                      <span className="font-bold text-gray-900 block text-xs border-b border-gray-200/60 pb-1">
                        {category}
                      </span>
                      {valid.map(([itemKey, itemVal], i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span className="text-gray-500">{itemKey}:</span>
                          <span className="font-semibold text-gray-800 text-right">
                            {itemVal}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Structured Specification Cards */}
          <div className="space-y-6">
            {/* Dimensions & Space */}
            {specsProjectDimensions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Maximize2 size={16} className="text-[#7A0E2E]" />
                  <span>Project Size, Land & Dimensions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectDimensions.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financials & Maintenance */}
            {specsProjectFinancials.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <DollarSign size={16} className="text-[#7A0E2E]" />
                  <span>Pricing, Charges & Maintenance</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectFinancials.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Construction Timeline & RERA */}
            {specsProjectTimeline.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Clock size={16} className="text-[#7A0E2E]" />
                  <span>Timeline, Construction & Legal Status</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectTimeline.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structure & Layout */}
            {specsProjectStructure.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Building2 size={16} className="text-[#7A0E2E]" />
                  <span>Building Structure & Room Setup</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectStructure.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Utilities & Amenities Features */}
            {specsProjectUtilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Zap size={16} className="text-[#7A0E2E]" />
                  <span>Utilities & Building Infrastructure</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectUtilities.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parking Details */}
            {specsProjectParking.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <Car size={16} className="text-[#7A0E2E]" />
                  <span>Parking Provisions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {specsProjectParking.map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#7A0E2E]" />
                    <span>Project Amenities & Leisure</span>
                  </h3>
                  <span className="text-xs text-gray-500">
                    {amenitiesList.length} Total
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(showAllAmenities ? amenitiesList : amenitiesList.slice(0, 12)).map(
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

                {amenitiesList.length > 12 && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="text-xs font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {showAllAmenities
                        ? "Show Less"
                        : `+${amenitiesList.length - 12} More Amenities`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Project Description */}
            {projectDetails?.project_description && (
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 mb-3 border-b border-gray-100 flex items-center gap-2">
                  <FileText size={16} className="text-[#7A0E2E]" />
                  <span>About This Project</span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {projectDetails.project_description}
                </p>
              </div>
            )}

            {/* Location & Map */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 pb-3 mb-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-[#7A0E2E]" />
                <span>Project Location & Landmarks</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Address</span>
                  <p className="font-medium text-gray-800">
                    {projectDetails?.address || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Nearby Landmark</span>
                  <p className="font-medium text-gray-800">
                    {projectDetails?.near_landmark || projectDetails?.address_area || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">City & State</span>
                  <p className="font-medium text-gray-800">
                    {projectDetails?.city_name || "N/A"}
                    {projectDetails?.state ? `, ${projectDetails.state}` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Zip Code & Country</span>
                  <p className="font-medium text-gray-800">
                    {projectDetails?.zip_code || "N/A"}, {projectDetails?.country || "India"}
                  </p>
                </div>
              </div>

              {projectDetails?.latitude && projectDetails?.longitude ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 h-64 sm:h-80">
                  <iframe
                    title="Project Map Location"
                    className="w-full h-full border-0"
                    src={`https://maps.google.com/maps?q=${projectDetails.latitude},${projectDetails.longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
                  Coordinates not specified for this project.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Developer & Contact Meta (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User size={16} className="text-[#7A0E2E]" />
                <span>Developer & Contact Information</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-[#7A0E2E] border border-rose-100">
                {projectDetails?.user_type || userDetails?.user_type || "Builder"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Primary Developer Contact */}
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
                  Company / Developer
                </span>
                <div>
                  <span className="text-xs text-gray-400 block">Developer Name</span>
                  <p className="text-sm font-bold text-gray-900">
                    {projectDetails?.developer || userDetails?.full_name || projectDetails?.connect_to_name || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Mobile Phone</span>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${userDetails?.mobile_number || projectDetails?.connect_to_no}`}
                      className="text-sm font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {userDetails?.mobile_number || projectDetails?.connect_to_no || "N/A"}
                    </a>
                    {(userDetails?.mobile_number || projectDetails?.connect_to_no) && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            userDetails?.mobile_number || projectDetails?.connect_to_no,
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
                      href={`mailto:${userDetails?.email || projectDetails?.connect_to_email}`}
                      className="text-xs font-medium text-gray-800 hover:text-[#7A0E2E] truncate max-w-[190px]"
                    >
                      {userDetails?.email || projectDetails?.connect_to_email || "N/A"}
                    </a>
                    {(userDetails?.email || projectDetails?.connect_to_email) && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            userDetails?.email || projectDetails?.connect_to_email,
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
              {(projectDetails?.connect_to_name || projectDetails?.connect_to_no) && (
                <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
                    Direct Representative
                  </span>
                  <div className="text-sm">
                    <span className="text-gray-500 text-xs">Name: </span>
                    <span className="font-semibold text-gray-900">
                      {projectDetails.connect_to_name || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 text-xs">Contact: </span>
                    <a
                      href={`tel:${projectDetails.connect_to_no}`}
                      className="font-semibold text-[#7A0E2E] hover:underline"
                    >
                      {projectDetails.connect_to_no || "N/A"}
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
                  <span className="text-gray-500">Project ID</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {projectDetails?._id || id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50">
                  <span className="text-gray-500">RERA Registration</span>
                  <span className="font-medium text-emerald-700 font-mono">
                    {projectDetails?.rera_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50">
                  <span className="text-gray-500">Developer Account ID</span>
                  <span className="font-mono text-gray-700">
                    {projectDetails?.user_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Posted By Admin</span>
                  <span className="font-medium text-gray-900">
                    {projectDetails?.posted_by_admin || "No"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {projectDetails?.brochure_doc && (
                  <button
                    onClick={handleDownloadBrochure}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7A0E2E] hover:bg-[#610B24] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download size={14} />
                    Download Project Brochure
                  </button>
                )}

                <Link
                  to="/projects"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors"
                >
                  <ArrowLeft size={14} />
                  Return to Projects Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Gallery Images & Videos */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 text-white">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base">
                  {projectDetails?.project_name || "Gallery"}
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

      {/* Modal for Floor Plan Zoom */}
      {showFloorPlanModal && activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">
                Floor Plan: {activePlan.bhk ? `${activePlan.bhk} BHK - ` : ""}
                {activePlan.area} {activePlan.area_in || "Sq Ft"}
              </h3>
              <button
                onClick={() => setShowFloorPlanModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={getFullMediaUrl(activePlan.image)}
                alt="Enlarged Floor Plan"
                className="max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
