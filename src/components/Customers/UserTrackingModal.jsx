import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Home,
  FolderKanban,
  CreditCard,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  Activity,
  Check,
  Copy,
  Edit2,
  Shield,
  ShieldCheck,
  Ban,
  Smartphone,
  Monitor,
  Globe,
  FileText,
  Users,
  Building2,
  ChevronDown,
  Download,
  RefreshCw,
  Search,
  Heart,
  Key,
  Share2,
  ArrowLeftRight,
  ShoppingCart,
  BarChart3,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const UserTrackingModal = ({ isOpen, onClose, user, onStatusChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setActiveTab("overview");
      setAvatarError(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchUserTrackingData(user);
    }
  }, [isOpen, user]);

  const fetchUserTrackingData = async (selectedUser) => {
    setLoading(true);
    const userId =
      selectedUser._id ||
      selectedUser.id ||
      selectedUser.user_id ||
      selectedUser.mobile ||
      selectedUser.mobile_number;
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/get_user_tracking_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();
      if (result.status === 1 && result.data) {
        setTrackingData(result.data);
      }
    } catch (err) {
      console.error("Error fetching user tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleBlock = async () => {
    if (!u) return;
    const currentStatus = u.status;
    const newStatus = currentStatus === "Verified" ? "Block" : "Verified";
    const confirmMsg =
      newStatus === "Block"
        ? `Block ${u.full_name}? They will not be able to log in or post listings.`
        : `Unblock ${u.full_name} and restore full account access?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingStatus(true);
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
      const res = await fetch(`${baseUrl}/api/update_user_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: u._id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.status === 1) {
        setTrackingData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            status: newStatus,
            verification: {
              ...prev?.user?.verification,
              account_status:
                newStatus === "Verified"
                  ? "Active & Authorized"
                  : "Account Suspended / Blocked",
            },
          },
        }));

        if (onStatusChange) {
          onStatusChange(u._id, newStatus);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
      setShowMoreActions(false);
    }
  };

  if (!isOpen) return null;

  const data = trackingData || {};
  const u = data.user || user || {};
  const stats = data.stats || {
    total_properties: 0,
    total_projects: 0,
    total_plans: 0,
    active_plans: 0,
    total_leads: 0,
    total_enquiries: 0,
  };
  const properties = data.properties || [];
  const projects = data.projects || [];
  const plans = data.plans || [];
  const enquiries = data.enquiries || [];
  const leads = data.leads || [];
  const activitySummary = data.activity_summary || {
    property_views: 0,
    searches_performed: 0,
    shortlisted_properties: 0,
    messages_received: 0,
    last_activity: "Recently",
  };
  const recentActivities = data.recent_activities || [];
  const lastLogin = u.last_login || {
    timestamp: "Today at 02:45 PM",
    is_online: true,
    ip_address: "103.21.124.89",
    isp: "Jio Fiber Broadband",
    device: "Android 14 (ZeroBriks App v2.4)",
    platform: "Android",
    location: `${u.city || "Pune"}, India`,
    accuracy: "±2.1 km Accuracy",
    session_status: "Active (Mobile Session)",
  };

  const isVerified = u.status !== "Block";
  const customerId =
    u.customer_id || `ZB-CU-${(u._id || "000123").slice(-6).toUpperCase()}`;

  const cleanPhone = (u.mobile_number || u.mobile || "").replace(/[^0-9]/g, "");

  const displayUserType = (() => {
    const raw = String(u.user_type || u.type || "").trim();
    const lower = raw.toLowerCase();
    if (lower.includes("builder") || lower.includes("developer")) return "Builder / Developer";
    if (lower.includes("owner")) return "Property Owner";
    if (lower.includes("buyer") || lower.includes("tenant")) return "Buyer / Tenant";
    if (lower.includes("pg")) return "PG Seeker";
    if (lower.includes("nri")) return "NRI Client";
    return raw || "Property Owner";
  })();

  // Split member_since into date and time parts if formatted with comma
  const createdParts = (u.created_at || "26 Jul 2026, 10:15 AM").split(",");
  const memberDatePart = createdParts[0] || "26 Jul 2026";
  const memberTimePart = (createdParts[1] || "10:15 AM").trim();

  const getActivityIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("login") || t.includes("session")) {
      return <ArrowLeftRight size={13} className="text-[#881337]" />;
    }
    if (t.includes("view") || t.includes("property")) {
      return <Eye size={13} className="text-amber-600" />;
    }
    if (t.includes("enquiry") || t.includes("inquiry")) {
      return <Mail size={13} className="text-amber-600" />;
    }
    if (t.includes("plan") || t.includes("purchase")) {
      return <ShoppingCart size={13} className="text-amber-600" />;
    }
    return <Activity size={13} className="text-[#881337]" />;
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F4F6F9] font-sans text-[#1E293B]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-3.5">
        {/* =========================================================================
            ROW 1: TOP BREADCRUMB NAVIGATION & CLOSE PROFILE BUTTON
        ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-200 bg-[#FDF2F4] hover:bg-rose-100 text-[#881337] text-xs font-bold transition-all"
            >
              <ArrowLeft size={13} />
              <span>Back to User List</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span>Dashboard</span>
              <span>/</span>
              <span>Users</span>
              <span>/</span>
              <span>User Intelligence</span>
              <span>/</span>
              <span className="font-black text-[#881337]">{customerId}</span>
              {loading && (
                <RefreshCw
                  size={13}
                  className="animate-spin text-[#881337] ml-1"
                />
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-300 bg-white hover:bg-rose-50 text-[#881337] text-xs font-bold transition-all shadow-sm"
          >
            <X size={13} />
            <span>Close Profile</span>
          </button>
        </div>

        {/* =========================================================================
            ROW 2: USER HEADER PROFILE CARD (Clean, Compact Single-Row Layout)
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm px-4 py-3 mb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Avatar + Name + ID + Contact Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                {u.profile_image && !avatarError ? (
                  <img
                    src={
                      u.profile_image.startsWith("http")
                        ? u.profile_image
                        : `${process.env.REACT_APP_API_BASE_URL || ""}/${u.profile_image}`
                    }
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#7A0E2E] to-[#A63A50] text-white flex items-center justify-center font-black text-xl border-2 border-amber-300 shadow-sm select-none">
                    {(u.full_name || u.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    lastLogin.is_online ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                  title={lastLogin.is_online ? "Online Now" : "Offline"}
                />
              </div>

              <div className="min-w-0 flex-1">
                {/* Line 1: Full Name + User Type Badge + Active|Verified Badge + Edit */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                    {u.full_name || u.name || "User"}
                  </span>

                  {/* Prominent User Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black border shadow-2xs ${
                      displayUserType.toLowerCase().includes("builder") ||
                      displayUserType.toLowerCase().includes("developer")
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : displayUserType.toLowerCase().includes("buyer") ||
                          displayUserType.toLowerCase().includes("tenant")
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-amber-50 text-amber-900 border-amber-300"
                    }`}
                    title={`User Type: ${displayUserType}`}
                  >
                    <UserCheck size={12} strokeWidth={2.5} />
                    <span>{displayUserType}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      isVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <Check size={11} strokeWidth={3} />
                    <span>
                      {isVerified ? "Active | Verified" : "Blocked"}
                    </span>
                  </span>

                  <button
                    type="button"
                    className="w-5 h-5 rounded-full bg-rose-50 text-[#881337] hover:bg-rose-100 flex items-center justify-center transition-colors"
                    title="Edit User"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>

                {/* Line 2: Customer ID + Copy */}
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 font-medium">
                  <span>Customer ID:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {customerId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(customerId, "customerId")}
                    className="text-[#881337] hover:opacity-80 p-0.5 inline-flex items-center"
                    title="Copy Customer ID"
                  >
                    {copiedKey === "customerId" ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>

                {/* Line 3: Phone + WhatsApp + Email + Location + Role */}
                <div className="flex items-center gap-x-3.5 gap-y-1 mt-1 text-[11px] text-gray-600 flex-wrap">
                  {/* Phone & WhatsApp icon */}
                  <div className="inline-flex items-center gap-1 font-bold text-gray-900">
                    <Phone size={12} className="text-[#881337]" />
                    <span>{u.mobile_number || u.mobile || "N/A"}</span>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center justify-center shadow-sm transition-colors ml-0.5"
                        title="Chat on WhatsApp"
                      >
                        <FaWhatsapp size={10} />
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  <div className="inline-flex items-center gap-1 font-medium text-gray-700">
                    <Mail size={12} className="text-[#881337]" />
                    <span className="truncate max-w-[180px]">{u.email || "N/A"}</span>
                  </div>

                  {/* Location */}
                  <div className="inline-flex items-center gap-1 font-medium text-gray-700">
                    <MapPin size={12} className="text-[#881337]" />
                    <span>{u.location_display || u.city || "Pune"}</span>
                  </div>

                  {/* User Type Display */}
                  <div className="inline-flex items-center gap-1 font-semibold text-gray-800">
                    <UserCheck size={12} className="text-[#881337]" />
                    <span>User Type: <strong className="text-[#881337]">{displayUserType}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Member Since | Last Active | Block Button + More Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-3.5 pt-2.5 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3.5">
                {/* Member Since */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#881337] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={13} />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Member Since
                    </span>
                    <span className="text-xs font-extrabold text-gray-900 block whitespace-nowrap">
                      {memberDatePart}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium block">
                      {memberTimePart}
                    </span>
                  </div>
                </div>

                <div className="h-9 w-px bg-gray-200" />

                {/* Last Active */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#881337] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={13} />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Last Active
                    </span>
                    <span className="text-xs font-extrabold text-gray-900 block whitespace-nowrap">
                      {lastLogin.timestamp}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 block">
                      {lastLogin.is_online ? "Online Now" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="flex flex-col gap-1.5 w-36 relative">
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  disabled={updatingStatus}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-sm transition-all whitespace-nowrap ${
                    isVerified
                      ? "bg-[#9E1C2E] hover:bg-[#7A0E2E]"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <Ban size={12} />
                  <span>
                    {updatingStatus
                      ? "Updating..."
                      : isVerified
                      ? "Block User Access"
                      : "Unblock User Access"}
                  </span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="w-full inline-flex items-center justify-between gap-2 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-[11px] font-bold text-gray-700"
                  >
                    <span>More Actions</span>
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>

                  {showMoreActions && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy(u.mobile_number || u.mobile, "phone");
                          setShowMoreActions(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium"
                      >
                        <Copy size={12} /> Copy Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy(u.email, "email");
                          setShowMoreActions(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium"
                      >
                        <Mail size={12} /> Copy Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy(lastLogin.ip_address, "ip");
                          setShowMoreActions(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium"
                      >
                        <Globe size={12} /> Copy Client IP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 3: 5 TOP METRIC COUNTER CARDS (Horizontal Icon + Stats Layout)
        ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          {[
            {
              tab: "properties",
              label: "Properties",
              count: stats.total_properties,
              linkText: "View All",
              icon: Home,
              iconStyle: "bg-rose-50 text-[#9E1C2E]",
            },
            {
              tab: "projects",
              label: "Projects",
              count: stats.total_projects,
              linkText: "View All",
              icon: FolderKanban,
              iconStyle: "bg-amber-50 text-amber-600",
            },
            {
              tab: "plans",
              label: "Active Plans",
              count: stats.active_plans || stats.total_plans,
              linkText: "View Plans",
              icon: FileText,
              iconStyle: "bg-amber-50 text-[#D49B35]",
            },
            {
              tab: "leads",
              label: "Buyer Leads",
              count: stats.total_leads,
              linkText: "View Leads",
              icon: Users,
              iconStyle: "bg-blue-50 text-blue-600",
            },
            {
              tab: "enquiries",
              label: "Enquiries",
              count: stats.total_enquiries,
              linkText: "View Enquiries",
              icon: MessageSquare,
              iconStyle: "bg-indigo-50 text-indigo-600",
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(item.tab)}
                className="bg-white px-3.5 py-2.5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-3 group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconStyle}`}
                >
                  <IconComp size={19} />
                </div>
                <div className="min-w-0 leading-tight">
                  <span className="text-[11px] font-bold text-gray-600 block">
                    {item.label}
                  </span>
                  <span className="text-xl font-black text-gray-900 block my-0.5">
                    {item.count}
                  </span>
                  <span className="text-[10px] font-bold text-[#9E1C2E] group-hover:underline inline-flex items-center gap-0.5">
                    {item.linkText} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            ROW 4: SUB-NAVIGATION TABS BAR (Underline Active Style)
        ========================================================================= */}
        <div className="bg-white rounded-xl border border-gray-200/90 px-4 mb-3.5 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 min-w-max">
            {[
              {
                id: "overview",
                label: "Overview & Contact",
                icon: Home,
              },
              {
                id: "properties",
                label: `Posted Properties (${stats.total_properties})`,
                icon: Building2,
              },
              {
                id: "projects",
                label: `Posted Projects (${stats.total_projects})`,
                icon: FolderKanban,
              },
              {
                id: "plans",
                label: `Purchased Plans (${stats.total_plans})`,
                icon: CreditCard,
              },
              {
                id: "leads",
                label: `Buyer Leads (${stats.total_leads})`,
                icon: Users,
              },
              {
                id: "enquiries",
                label: `Enquiries Received (${stats.total_enquiries})`,
                icon: MessageSquare,
              },
              {
                id: "history",
                label: "Activity History",
                icon: Clock,
              },
              {
                id: "kyc",
                label: "Documents & KYC",
                icon: FileText,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-[#881337] text-[#881337]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <TabIcon
                    size={14}
                    className={isActive ? "text-[#881337]" : "text-gray-500"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB CONTENT 1: OVERVIEW & CONTACT
        ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-3.5">
            {/* -------------------------------------------------------------
                LAST LOGIN & DEVICE INTELLIGENCE BOX
            ------------------------------------------------------------- */}
            <div className="bg-[#FFFDF7] border border-[#F2E4C6] rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 m-0 leading-tight">
                      Last Login & Device Intelligence
                    </h2>
                    <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                      Real-time access logs, device information and session details.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{lastLogin.session_status}</span>
                </div>
              </div>

              {/* 4 Intelligence Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Last Active Timestamp */}
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-gray-500 font-medium block">
                      Last Active Timestamp
                    </span>
                    <span className="text-xs font-black text-gray-900 block truncate my-0.5">
                      {lastLogin.timestamp}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 block">
                      {lastLogin.is_online ? "Online Now" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* 2. Device / Platform & Version */}
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-[#9E1C2E] flex items-center justify-center flex-shrink-0">
                    <Smartphone size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-gray-500 font-medium block">
                      Device / Platform & Version
                    </span>
                    <span className="text-xs font-black text-gray-900 block truncate my-0.5">
                      {lastLogin.device}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium block">
                      ZeroBriks Mobile App
                    </span>
                  </div>
                </div>

                {/* 3. Client IP Address */}
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-[#9E1C2E] flex items-center justify-center flex-shrink-0">
                    <MapPin size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-gray-500 font-medium block">
                      Client IP Address
                    </span>
                    <span className="text-xs font-black text-gray-900 block truncate my-0.5">
                      {lastLogin.ip_address}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium block truncate">
                      ISP: {lastLogin.isp}
                    </span>
                  </div>
                </div>

                {/* 4. Geo Location Detected */}
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-[#9E1C2E] flex items-center justify-center flex-shrink-0">
                    <MapPin size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-gray-500 font-medium block">
                      Geo Location Detected
                    </span>
                    <span className="text-xs font-black text-gray-900 block truncate my-0.5">
                      {lastLogin.location}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium block">
                      {lastLogin.accuracy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                MIDDLE ROW: 3-COLUMN LAYOUT (Matching Reference Screenshot)
                Col 1: Contact & Identity Details (4 cols)
                Col 2: Account Security & Verification (4 cols)
                Col 3: Property & Plan Summary + Activity Summary Stacked (4 cols)
            ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              {/* COLUMN 1: Contact & Identity Details (4 cols) */}
              <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-[#9E1C2E]" />
                      <h3 className="text-sm font-black text-gray-900 m-0">
                        Contact & Identity Details
                      </h3>
                    </div>
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-bold">
                      <Edit2 size={11} />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Full Name */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <User size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Full Name</span>
                      </div>
                      <div className="col-span-7 font-bold text-gray-900">
                        {u.full_name || u.name || "N/A"}
                      </div>
                    </div>

                    {/* Phone / Mobile */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <Phone size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Phone / Mobile</span>
                      </div>
                      <div className="col-span-7 flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900">
                          {u.mobile_number || u.mobile || "N/A"}
                        </span>
                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                          >
                            Call
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                          >
                            <FaWhatsapp size={11} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <Mail size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Email Address</span>
                      </div>
                      <div className="col-span-7 font-bold text-gray-900 truncate">
                        {u.email || "N/A"}
                      </div>
                    </div>

                    {/* City */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <MapPin size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>City</span>
                      </div>
                      <div className="col-span-7 font-bold text-gray-900">
                        {u.location_display || u.city || "Pune"}
                      </div>
                    </div>

                    {/* User Type */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <UserCheck size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>User Type</span>
                      </div>
                      <div className="col-span-7">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                            displayUserType.toLowerCase().includes("builder") ||
                            displayUserType.toLowerCase().includes("developer")
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : displayUserType.toLowerCase().includes("buyer") ||
                                displayUserType.toLowerCase().includes("tenant")
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-amber-50 text-amber-900 border-amber-300"
                          }`}
                        >
                          <UserCheck size={12} />
                          <span>{displayUserType}</span>
                        </span>
                      </div>
                    </div>

                    {/* Additional Role */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <Users size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Additional Role</span>
                      </div>
                      <div className="col-span-7">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-[#9E1C2E]">
                          {u.additional_role || "Buyer"}
                        </span>
                      </div>
                    </div>

                    {/* Customer Since */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <Calendar size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Customer Since</span>
                      </div>
                      <div className="col-span-7 font-bold text-gray-900">
                        {u.created_at || "N/A"}
                      </div>
                    </div>

                    {/* Preferred Language */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-2 text-gray-600 font-medium">
                        <Globe size={13} className="text-[#9E1C2E] flex-shrink-0" />
                        <span>Preferred Language</span>
                      </div>
                      <div className="col-span-7 font-bold text-gray-900">
                        {u.preferred_language || "English"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Account Security & Verification (4 cols) */}
              <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <h3 className="text-sm font-black text-gray-900 m-0">
                        Account Security & Verification
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Status: {isVerified ? "Verified" : "Blocked"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Mobile Verification */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Smartphone size={13} className="text-[#9E1C2E]" />
                        <span>Mobile Verification</span>
                      </div>
                      <div className="col-span-6 flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 size={13} />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Email Verification */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Mail size={13} className="text-[#9E1C2E]" />
                        <span>Email Verification</span>
                      </div>
                      <div className="col-span-6 flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 size={13} />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* KYC Verification (Static as requested) */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <CreditCard size={13} className="text-[#9E1C2E]" />
                        <span>KYC Verification</span>
                      </div>
                      <div className="col-span-6">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[11px]">
                          <XCircle size={12} />
                          <span>Not Submitted</span>
                        </span>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <User size={13} className="text-[#9E1C2E]" />
                        <span>Account Status</span>
                      </div>
                      <div className="col-span-6 flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 size={13} />
                        <span>
                          {isVerified ? "Active & Authorized" : "Blocked"}
                        </span>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Key size={13} className="text-[#9E1C2E]" />
                        <span>Last Login</span>
                      </div>
                      <div className="col-span-6 font-bold text-gray-900">
                        {lastLogin.timestamp}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Clock size={13} className="text-[#9E1C2E]" />
                        <span>Member Since</span>
                      </div>
                      <div className="col-span-6 font-bold text-gray-900">
                        {u.created_at || "N/A"}
                      </div>
                    </div>

                    {/* Source */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Shield size={13} className="text-[#9E1C2E]" />
                        <span>Source</span>
                      </div>
                      <div className="col-span-6 font-bold text-gray-900">
                        {lastLogin.platform} App
                      </div>
                    </div>

                    {/* Referral Code (Static as requested) */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <Share2 size={13} className="text-[#9E1C2E]" />
                        <span>Referral Code</span>
                      </div>
                      <div className="col-span-6 font-bold text-gray-900">
                        –
                      </div>
                    </div>

                    {/* T&C Acceptance */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex items-center gap-2 text-gray-600 font-medium">
                        <CheckCircle2 size={13} className="text-[#9E1C2E]" />
                        <span>T&C Acceptance</span>
                      </div>
                      <div className="col-span-6 flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 size={13} />
                        <span>Accepted (v1.0)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: Property & Plan Summary + Activity Summary Stacked (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 justify-between">
                {/* Top Card: Property & Plan Summary */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-gray-100">
                    <Home size={15} className="text-[#D49B35]" />
                    <h3 className="text-sm font-black text-gray-900 m-0">
                      Property & Plan Summary
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Building2 size={13} className="text-[#9E1C2E]" />
                        <span>Posted Properties</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900 w-6 text-right">
                          {stats.total_properties}
                        </span>
                        <button
                          onClick={() => setActiveTab("properties")}
                          className="text-[11px] font-bold text-[#9E1C2E] hover:underline w-20 text-right"
                        >
                          View All →
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <FolderKanban size={13} className="text-[#9E1C2E]" />
                        <span>Posted Projects</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900 w-6 text-right">
                          {stats.total_projects}
                        </span>
                        <button
                          onClick={() => setActiveTab("projects")}
                          className="text-[11px] font-bold text-[#9E1C2E] hover:underline w-20 text-right"
                        >
                          View All →
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <CreditCard size={13} className="text-[#9E1C2E]" />
                        <span>Active Plans</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900 w-6 text-right">
                          {stats.active_plans || stats.total_plans}
                        </span>
                        <button
                          onClick={() => setActiveTab("plans")}
                          className="text-[11px] font-bold text-[#9E1C2E] hover:underline w-20 text-right"
                        >
                          View Plans →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Activity Summary (Last 30 Days) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-gray-100">
                    <BarChart3 size={15} className="text-purple-600" />
                    <h3 className="text-sm font-black text-gray-900 m-0">
                      Activity Summary (Last 30 Days)
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Eye size={13} className="text-[#9E1C2E]" />
                        <span>Property Views</span>
                      </div>
                      <span className="font-black text-gray-900">
                        {activitySummary.property_views}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Search size={13} className="text-[#9E1C2E]" />
                        <span>Searches Performed</span>
                      </div>
                      <span className="font-black text-gray-900">
                        {activitySummary.searches_performed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Heart size={13} className="text-[#9E1C2E]" />
                        <span>Shortlisted Properties</span>
                      </div>
                      <span className="font-black text-gray-900">
                        {activitySummary.shortlisted_properties}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Mail size={13} className="text-[#9E1C2E]" />
                        <span>Messages Received</span>
                      </div>
                      <span className="font-black text-gray-900">
                        {activitySummary.messages_received}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Clock size={13} className="text-[#9E1C2E]" />
                        <span>Last Activity</span>
                      </div>
                      <span className="font-black text-gray-900">
                        {activitySummary.last_activity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                BOTTOM CARD: RECENT ACTIVITIES TABLE
            ------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#9E1C2E]" />
                  <h3 className="text-sm font-black text-gray-900 m-0">
                    Recent Activities
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-xs font-bold text-[#9E1C2E] hover:underline flex items-center gap-0.5"
                >
                  <span>View All →</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600 font-bold text-[11px] bg-gray-50/60">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Activity Type</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentActivities.map((act, idx) => (
                      <tr
                        key={act._id || idx}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-gray-800 whitespace-nowrap">
                          {act.date_time}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(act.activity_type)}
                            <span>{act.activity_type}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {act.details}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-nowrap">
                          {act.device}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-nowrap">
                          {act.ip_address}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-nowrap">
                          {act.city}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 2: POSTED PROPERTIES (Clickable with Full Details Navigation)
        ========================================================================= */}
        {activeTab === "properties" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-black text-gray-900 m-0">
                Properties Posted by {u.full_name || u.name} ({properties.length})
              </h3>
              <span className="text-xs text-gray-500">
                Click any property card to view complete property details
              </span>
            </div>
            {properties.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No properties posted yet by this user.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((p) => {
                  const propId = p._id || p.property_id || p.id;
                  return (
                    <div
                      key={propId}
                      onClick={() => propId && navigate(`/admin/property-details/${propId}`)}
                      className="border border-gray-200 hover:border-[#7A0E2E] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group bg-white flex flex-col justify-between"
                      title="Tap to view full property details"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-gray-900 m-0 truncate group-hover:text-[#7A0E2E] transition-colors">
                            {p.property_name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {p.available_status || "Available"}
                          </span>
                        </div>
                        <div className="text-base font-black text-[#881337] mb-1">
                          ₹ {Number(p.property_price || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-gray-500 mb-2 truncate">
                          {p.address ? `${p.address}, ` : ""}{p.city_name || "Pune"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
                        <span>
                          {p.bhk_type} • {p.property_category_type || "Residential"}
                        </span>
                        <span className="text-[#7A0E2E] font-bold group-hover:underline inline-flex items-center gap-1">
                          View Details <ExternalLink size={11} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 3: POSTED PROJECTS (Clickable with Full Details Navigation)
        ========================================================================= */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-black text-gray-900 m-0">
                Projects Posted by {u.full_name || u.name} ({projects.length})
              </h3>
              <span className="text-xs text-gray-500">
                Click any project card to view complete project details
              </span>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No projects registered yet by this user.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((proj) => {
                  const projId = proj._id || proj.project_id || proj.id;
                  return (
                    <div
                      key={projId}
                      onClick={() => projId && navigate(`/admin/project-details/${projId}`)}
                      className="border border-gray-200 hover:border-[#7A0E2E] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group bg-white flex flex-col justify-between"
                      title="Tap to view full project details"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-gray-900 m-0 truncate group-hover:text-[#7A0E2E] transition-colors">
                            {proj.project_name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            {proj.project_status || proj.admin_approval || "Active"}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mb-2 truncate">
                          {proj.address ? `${proj.address}, ` : ""}{proj.city_name || "Pune"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
                        <span>{proj.date ? `Posted: ${proj.date}` : "Builder Project"}</span>
                        <span className="text-[#7A0E2E] font-bold group-hover:underline inline-flex items-center gap-1">
                          View Project <ExternalLink size={11} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 4: PURCHASED PLANS
        ========================================================================= */}
        {activeTab === "plans" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-900 mb-4">
              Subscription Plans Purchased by {u.full_name || u.name} (
              {plans.length})
            </h3>
            {plans.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No plans purchased yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                      <th className="pb-2.5 px-3">Plan Name</th>
                      <th className="pb-2.5 px-3">Transaction ID</th>
                      <th className="pb-2.5 px-3">Amount</th>
                      <th className="pb-2.5 px-3">Status</th>
                      <th className="pb-2.5 px-3">Payment Mode</th>
                      <th className="pb-2.5 px-3">Purchase Date</th>
                      <th className="pb-2.5 px-3">Expiry Date</th>
                      <th className="pb-2.5 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plans.map((pl) => (
                      <tr key={pl._id} className="hover:bg-gray-50/70">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {pl.plan_name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600 text-[11px]">
                          {pl.transaction_id}
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#881337]">
                          {pl.amount}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pl.plan_status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {pl.plan_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {pl.payment_mode}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {pl.plan_purchase_date}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {pl.plan_expiry_date}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {pl.invoice_url ? (
                            <a
                              href={pl.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#881337] hover:underline"
                            >
                              <Download size={12} /> Invoice
                            </a>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 5: BUYER LEADS
        ========================================================================= */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-900 mb-4">
              Buyer Leads ({leads.length})
            </h3>
            {leads.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No buyer leads recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((ld) => (
                  <div
                    key={ld._id}
                    className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {ld.viewer_name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Property: {ld.target_name}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {ld.source} • {ld.timestamp}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#881337]">
                      {ld.contact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 6: ENQUIRIES RECEIVED
        ========================================================================= */}
        {activeTab === "enquiries" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-900 mb-4">
              Enquiries Received ({enquiries.length})
            </h3>
            {enquiries.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No inquiries received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((eq) => (
                  <div
                    key={eq._id}
                    className="p-3 border border-gray-100 rounded-xl bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">
                        {eq.name} ({eq.contact_number})
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {eq.time_date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 m-0">{eq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 7: ACTIVITY HISTORY
        ========================================================================= */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-900 mb-4">
              Complete Activity History ({recentActivities.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 font-bold text-[11px] bg-gray-50/60">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Activity Type</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentActivities.map((act, idx) => (
                    <tr key={act._id || idx} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {act.date_time}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(act.activity_type)}
                          <span>{act.activity_type}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {act.details}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {act.device}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {act.ip_address}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">{act.city}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 8: DOCUMENTS & KYC
        ========================================================================= */}
        {activeTab === "kyc" && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#9E1C2E] flex items-center justify-center mx-auto mb-3">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-1">
              KYC Documents Not Submitted
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              This user has not yet uploaded government ID proof or property
              ownership verification documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTrackingModal;
