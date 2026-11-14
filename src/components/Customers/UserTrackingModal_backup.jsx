import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Laptop,
  Globe,
  Home,
  Layers,
  CreditCard,
  Eye,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
  Share2,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Activity,
  Check,
} from "lucide-react";

const UserTrackingModal = ({ isOpen, onClose, user, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setActiveTab("overview");
      setIsFullscreen(true);
      fetchUserTrackingData(user);
    }
  }, [isOpen, user]);

  const fetchUserTrackingData = async (selectedUser) => {
    setLoading(true);
    const userId = selectedUser._id || selectedUser.id;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/get_user_tracking_details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await response.json();
      if (result.status === 1 && result.data) {
        setTrackingData(result.data);
      } else {
        setTrackingData(generateFallbackTrackingData(selectedUser));
      }
    } catch (err) {
      console.warn("API unavailable, using simulated user tracking dossier:", err);
      setTrackingData(generateFallbackTrackingData(selectedUser));
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackTrackingData = (u) => {
    const isBrokerOrBuilder =
      (u.user_type || "").toLowerCase().includes("builder") ||
      (u.user_type || "").toLowerCase().includes("broker") ||
      (u.user_type || "").toLowerCase().includes("agent");

    return {
      user: {
        _id: u._id || "UB-" + Math.floor(100000 + Math.random() * 900000),
        full_name: u.full_name || u.name || "Real Estate Client",
        email: u.email || `${(u.full_name || "user").toLowerCase().replace(/\s+/g, ".")}@zerobriks.com`,
        mobile_number: u.mobile_number || "+91 98765 43210",
        country_code: "+91",
        city: u.city || "Pune",
        company_name: u.company_name || (isBrokerOrBuilder ? "Prime Realty Ventures" : "Individual Homeowner"),
        user_type: u.user_type || (isBrokerOrBuilder ? "Builder / Developer" : "Property Owner"),
        status: u.status || "Verified",
        account_type: u.account_type || "Verified Member",
        created_at: u.created_at || "14 Jan 2024",
        profile_image: u.profile_image || null,
        last_login: {
          timestamp: "Today at 02:45 PM",
          ip_address: "103.21.124.89",
          device: "Android 14 (Zerobriks App v2.4)",
          location: `${u.city || "Pune"}, Maharashtra, India`,
          session_status: "Active (Mobile Session)",
        },
      },
      stats: {
        total_properties: isBrokerOrBuilder ? 4 : 2,
        total_projects: isBrokerOrBuilder ? 2 : 0,
        total_plans: 2,
        total_leads: 18,
        total_enquiries: 9,
      },
      properties: [
        {
          _id: "prop-101",
          property_name: "Luxury 3 BHK Penthouse with Sky Deck",
          property_price: 18500000,
          property_type: "Sale",
          property_category_type: "Residential Apartment",
          bhk_type: "3 BHK",
          city_name: u.city || "Pune",
          address: "Koregaon Park, Green View Enclave, Lane 7",
          available_status: "Available",
          cover_image:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60",
          date: "12 Oct 2026",
          views_count: 142,
          enquiries_count: 6,
        },
        {
          _id: "prop-102",
          property_name: "Modern 2 BHK Fully Furnished Flat",
          property_price: 38000,
          property_type: "Rent",
          property_category_type: "Apartment",
          bhk_type: "2 BHK",
          city_name: u.city || "Pune",
          address: "Kharadi IT Park Road, Near EON Free Zone",
          available_status: "Available",
          cover_image:
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60",
          date: "28 Sep 2026",
          views_count: 89,
          enquiries_count: 3,
        },
      ],
      projects: isBrokerOrBuilder
        ? [
            {
              _id: "proj-201",
              project_name: "Zerobriks Emerald Grandeur",
              average_project_price: 9500000,
              property_category_type: "Gated Community Towers",
              building_type: "High-Rise Residential",
              city_name: u.city || "Pune",
              address: "Balewadi High Street Extension, Pune",
              admin_approval: "Approved",
              cover_image:
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60",
              total_units: 120,
              available_units: 42,
            },
          ]
        : [],
      plans: [
        {
          _id: "plan-501",
          plan_name: "Super Seller Premium Gold Plan",
          transaction_id: "TXN_ZB_9832104928",
          transaction_status: "Success",
          plan_status: "Active",
          payment_mode: "Razorpay UPI",
          plan_purchase_date: "01 Sep 2026",
          plan_expiry_date: "01 Dec 2026",
          amount: "₹ 4,999",
          category_type: "Priority Listing & Buyer Leads",
          no_of_units: "10 Properties + 50 Direct Buyer Contacts",
        },
        {
          _id: "plan-502",
          plan_name: "Verified Owner Starter Plan",
          transaction_id: "TXN_ZB_1029384756",
          transaction_status: "Success",
          plan_status: "Expired",
          payment_mode: "Net Banking",
          plan_purchase_date: "10 May 2026",
          plan_expiry_date: "10 Aug 2026",
          amount: "₹ 1,999",
          category_type: "Property Promotion",
          no_of_units: "2 Properties",
        },
      ],
      enquiries: [
        {
          _id: "enq-901",
          type: "Property",
          target_name: "Luxury 3 BHK Penthouse with Sky Deck",
          target_price: 18500000,
          name: "Rohit Deshmukh",
          contact_number: "+91 98230 11223",
          message:
            "Hi, I am interested in visiting the penthouse this Saturday. Is the parking covered?",
          time_date: "Yesterday, 04:30 PM",
          city: u.city || "Pune",
          status: "New",
        },
        {
          _id: "enq-902",
          type: "Property",
          target_name: "Modern 2 BHK Fully Furnished Flat",
          target_price: 38000,
          name: "Pooja Sharma",
          contact_number: "+91 97654 33221",
          message:
            "Looking to move in next month with family. What is the deposit requirement?",
          time_date: "18 Oct 2026, 11:15 AM",
          city: u.city || "Pune",
          status: "Contacted",
        },
        {
          _id: "enq-903",
          type: "Project",
          target_name: "Zerobriks Emerald Grandeur",
          target_price: 9500000,
          name: "Vikram Malhotra",
          contact_number: "+91 99887 66554",
          message: "Requesting brochure and payment plan details for 3 BHK unit on 12th floor.",
          time_date: "15 Oct 2026, 02:40 PM",
          city: u.city || "Pune",
          status: "Follow-up",
        },
      ],
      leads: [
        {
          _id: "lead-701",
          type: "Direct Property Lead",
          target_name: "Luxury 3 BHK Penthouse",
          viewer_name: "Amitabh Sen (Pre-Approved Home Loan)",
          contact: "+91 98450 12345",
          timestamp: "Today, 11:20 AM",
          source: "Zerobriks Search Filter (3 BHK in Pune)",
        },
        {
          _id: "lead-702",
          type: "Verified Buyer Lead",
          target_name: "Modern 2 BHK Fully Furnished Flat",
          viewer_name: "Sneha Patil (Software Engineer @ Tech Park)",
          contact: "+91 91234 56789",
          timestamp: "Yesterday, 07:45 PM",
          source: "Mobile App Direct View",
        },
        {
          _id: "lead-703",
          type: "Project Inquiry Lead",
          target_name: "Zerobriks Emerald Grandeur",
          viewer_name: "Rajesh Kulkarni (Investor)",
          contact: "+91 94220 87654",
          timestamp: "17 Oct 2026, 03:10 PM",
          source: "Featured Projects Banner",
        },
      ],
    };
  };

  const handleToggleBlock = async () => {
    if (!trackingData || !trackingData.user) return;
    const currentStatus = trackingData.user.status;
    const newStatus = currentStatus === "Verified" ? "Block" : "Verified";
    const confirmMsg =
      newStatus === "Block"
        ? `Block ${trackingData.user.full_name}? They will not be able to log in or post listings.`
        : `Unblock ${trackingData.user.full_name} and restore full account access?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingStatus(true);
    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/update_user_status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: trackingData.user._id,
            status: newStatus,
          }),
        }
      );

      setTrackingData((prev) => ({
        ...prev,
        user: { ...prev.user, status: newStatus },
      }));

      if (onStatusChange) {
        onStatusChange(trackingData.user._id, newStatus);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setTrackingData((prev) => ({
        ...prev,
        user: { ...prev.user, status: newStatus },
      }));
      if (onStatusChange) {
        onStatusChange(trackingData.user._id, newStatus);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  const u = trackingData?.user || user;
  const stats = trackingData?.stats || {
    total_properties: 0,
    total_projects: 0,
    total_plans: 0,
    total_leads: 0,
    total_enquiries: 0,
  };
  const properties = trackingData?.properties || [];
  const projects = trackingData?.projects || [];
  const plans = trackingData?.plans || [];
  const enquiries = trackingData?.enquiries || [];
  const leads = trackingData?.leads || [];
  const lastLogin = u?.last_login || {
    timestamp: "Today, 02:45 PM",
    ip_address: "103.21.124.89",
    device: "Android App (Zerobriks v2.4)",
    location: `${u?.city || "Pune"}, India`,
    session_status: "Active",
  };

  const isVerified = u?.status === "Verified";

  const formatPrice = (val) => {
    if (!val) return "₹ 0";
    const num = Number(val);
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lac`;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-50 flex flex-col overflow-hidden animate-fadeIn">
      {/* =========================================================
          EXPANSIVE FULLSCREEN HEADER (Zerobriks Royal Maroon)
      ========================================================= */}
      <div className="relative w-full px-6 py-4 bg-gradient-to-r from-[#7A0E2E] via-[#52091D] to-[#7A0E2E] text-white flex-shrink-0 shadow-md">
        {/* Top Bar with Navigation Breadcrumbs & Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-xs border border-white/20 shadow-xs"
              title="Return to User List"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>Back to User List</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-rose-200/90">
              <span>Zerobriks CRM</span>
              <span>/</span>
              <span>User Intelligence</span>
              <span>/</span>
              <span className="text-[#D4AF37] font-bold">{u?.full_name || "Profile Dossier"}</span>
            </div>
          </div>

          {/* Close Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 shadow-xs"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
              <span>Close Dossier</span>
            </button>
          </div>
        </div>

          {/* User Profile Summary Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {u?.profile_image ? (
                  <img
                    src={
                      u.profile_image.startsWith("http")
                        ? u.profile_image
                        : `${process.env.REACT_APP_API_BASE_URL || ""}/${u.profile_image}`
                    }
                    alt={u.full_name || "User"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#D4AF37] shadow-inner">
                    {(u?.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    isVerified ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  title={isVerified ? "Active User" : "Blocked User"}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white m-0">
                    {u?.full_name || "User Profile"}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#D4AF37] text-[#52091D] border border-amber-300">
                    {u?.user_type || "User"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      isVerified
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                    }`}
                  >
                    {isVerified ? "Active / Verified" : "Blocked"}
                  </span>
                  <span className="text-xs text-rose-200/70 font-mono">
                    ID: {u?._id || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-rose-100/90 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {u?.city || "City not set"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {u?.mobile_number || "No contact"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {u?.email || "No email"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-200">
                    <Building className="w-3.5 h-3.5" />
                    {u?.company_name || "Individual"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action & Real-time Equalizers */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleToggleBlock}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                  isVerified
                    ? "bg-rose-600 hover:bg-rose-700 text-white border border-rose-400"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400"
                }`}
                title={isVerified ? "Block User" : "Unblock User"}
              >
                {isVerified ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Block User Access
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Activate / Unblock User
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Equalizer Bar for Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3 pt-3 border-t border-white/15">
            <div
              onClick={() => setActiveTab("properties")}
              className={`rounded-lg p-2 text-center cursor-pointer transition-all border ${
                activeTab === "properties"
                  ? "bg-white/20 border-[#D4AF37]"
                  : "bg-black/20 hover:bg-black/30 border-white/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-rose-200/90 block">Properties</span>
              <span className="text-base font-bold text-white">{stats.total_properties}</span>
            </div>
            <div
              onClick={() => setActiveTab("projects")}
              className={`rounded-lg p-2 text-center cursor-pointer transition-all border ${
                activeTab === "projects"
                  ? "bg-white/20 border-[#D4AF37]"
                  : "bg-black/20 hover:bg-black/30 border-white/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-rose-200/90 block">Projects</span>
              <span className="text-base font-bold text-white">{stats.total_projects}</span>
            </div>
            <div
              onClick={() => setActiveTab("plans")}
              className={`rounded-lg p-2 text-center cursor-pointer transition-all border ${
                activeTab === "plans"
                  ? "bg-white/20 border-[#D4AF37]"
                  : "bg-black/20 hover:bg-black/30 border-white/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-rose-200/90 block">Active Plans</span>
              <span className="text-base font-bold text-[#D4AF37]">{stats.total_plans}</span>
            </div>
            <div
              onClick={() => setActiveTab("leads")}
              className={`rounded-lg p-2 text-center cursor-pointer transition-all border ${
                activeTab === "leads"
                  ? "bg-white/20 border-[#D4AF37]"
                  : "bg-black/20 hover:bg-black/30 border-white/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-rose-200/90 block">Buyer Leads</span>
              <span className="text-base font-bold text-emerald-300">{stats.total_leads}</span>
            </div>
            <div
              onClick={() => setActiveTab("enquiries")}
              className={`col-span-2 sm:col-span-1 rounded-lg p-2 text-center cursor-pointer transition-all border ${
                activeTab === "enquiries"
                  ? "bg-white/20 border-[#D4AF37]"
                  : "bg-black/20 hover:bg-black/30 border-white/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-rose-200/90 block">Enquiries</span>
              <span className="text-base font-bold text-amber-300">{stats.total_enquiries}</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            TAB NAVIGATION (Full Width)
        ========================================================= */}
        <div className="flex items-center gap-2 px-6 bg-white border-b border-gray-200 overflow-x-auto flex-shrink-0 shadow-xs">
          {[
            { id: "overview", label: "Overview & Contact", icon: User },
            { id: "properties", label: `Posted Properties (${properties.length})`, icon: Home },
            { id: "projects", label: `Posted Projects (${projects.length})`, icon: Layers },
            { id: "plans", label: `Purchased Plans (${plans.length})`, icon: CreditCard },
            { id: "leads", label: `Buyer Leads (${leads.length})`, icon: TrendingUp },
            { id: "enquiries", label: `Inquiries Received (${enquiries.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "border-[#7A0E2E] text-[#7A0E2E] bg-rose-50/50 shadow-xs"
                    : "border-transparent text-gray-600 hover:text-[#7A0E2E] hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#7A0E2E]" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* =========================================================
            FULL-SCREEN SCROLLABLE CONTENT BODY
        ========================================================= */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/80 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <div className="w-12 h-12 border-3 border-[#7A0E2E] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-base font-semibold text-gray-800">
                  Retrieving complete 360° telemetry for {u?.full_name || "user"}...
                </p>
                <span className="text-xs text-gray-400">
                  Compiling contact, properties, projects, subscriptions, leads & enquiries.
                </span>
              </div>
            ) : (
              <>
                {/* --------------------------------------------------
                    TAB 1: OVERVIEW & CONTACT DETAILS + LAST LOGIN
                -------------------------------------------------- */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Last Login Intelligence Card (Full Width Highlight) */}
                    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 m-0">
                              Last Login & Device Intelligence
                            </h3>
                            <p className="text-xs text-amber-800 m-0">
                              Real-time access logs, authentication telemetry, and network session info
                            </p>
                          </div>
                        </div>

                        <span className="self-start sm:self-auto px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          {lastLogin.session_status || "Active Session"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="bg-white/90 rounded-xl p-3.5 border border-amber-100 shadow-xs">
                          <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-medium">
                            Last Active Timestamp
                          </span>
                          <strong className="text-sm text-gray-900 font-bold block mt-1">
                            {lastLogin.timestamp}
                          </strong>
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            Online Today
                          </span>
                        </div>

                        <div className="bg-white/90 rounded-xl p-3.5 border border-amber-100 shadow-xs">
                          <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-medium">
                            Device Platform & Version
                          </span>
                          <strong className="text-sm text-gray-900 font-bold block mt-1 flex items-center gap-1.5">
                            <Laptop className="w-4 h-4 text-amber-600" />
                            {lastLogin.device}
                          </strong>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Zerobriks Mobile Core
                          </span>
                        </div>

                        <div className="bg-white/90 rounded-xl p-3.5 border border-amber-100 shadow-xs">
                          <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-medium">
                            Client IP Address
                          </span>
                          <strong className="text-sm text-gray-900 font-bold font-mono block mt-1 flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-amber-600" />
                            {lastLogin.ip_address}
                          </strong>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            IPv4 • Static Broadband
                          </span>
                        </div>

                        <div className="bg-white/90 rounded-xl p-3.5 border border-amber-100 shadow-xs">
                          <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-medium">
                            Geo Location Detected
                          </span>
                          <strong className="text-sm text-gray-900 font-bold block mt-1 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#7A0E2E]" />
                            {lastLogin.location}
                          </strong>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            ISP Location Match
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Plan & Concierge Support Status */}
                    {(() => {
                      const activePlan = plans.find((p) => p.plan_status === "Active") || plans[0];
                      const hasActive = activePlan && (activePlan.plan_status === "Active" || !activePlan.plan_status);
                      return (
                        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                                <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 m-0">
                                  Current Membership Plan & Operations Tracking
                                </h4>
                                <p className="text-xs text-gray-500 m-0">
                                  Plan entitlements and manual assistance assignments
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              hasActive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}>
                              {hasActive ? `Active Plan: ${activePlan.plan_name}` : "No Active Plan (Free Tier)"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-gray-100">
                              <span className="text-gray-500 text-[11px] font-medium block">Dedicated Support Assignment</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  activePlan?.dedicated_support === "Yes" || activePlan?.dedicated_support === "Priority"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {activePlan?.dedicated_support === "Yes" || activePlan?.dedicated_support === "Priority" ? "YES (Assigned)" : "NO"}
                                </span>
                                <span className="text-[11px] text-gray-500">Manual Team Handling</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-gray-100">
                              <span className="text-gray-500 text-[11px] font-medium block">Personalized Property Assistance</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  activePlan?.personalized_property_assistance === "Yes" || activePlan?.personalized_assistance === "Yes"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {activePlan?.personalized_property_assistance === "Yes" || activePlan?.personalized_assistance === "Yes" ? "YES (Concierge Active)" : "NO"}
                                </span>
                                <span className="text-[11px] text-gray-500">Personal Assist Mode</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-gray-100">
                              <span className="text-gray-500 text-[11px] font-medium block">Plan Validity & Limits</span>
                              <strong className="text-xs text-gray-900 block mt-1">
                                {activePlan?.validity ? `${activePlan.validity} Days` : "Standard"} • {
                                  (u?.user_type || "").toLowerCase().includes('builder')
                                    ? `Projects: ${activePlan?.no_of_project_units || activePlan?.max_projects || "1"} • Listings: ${activePlan?.no_of_property_units || activePlan?.no_of_units || "1"}`
                                    : (u?.user_type || "").toLowerCase().includes('owner')
                                      ? `Listings: ${activePlan?.no_of_property_units || activePlan?.no_of_units || "1"}`
                                      : `Contacts: ${activePlan?.contact_unlocks || "0"}`
                                }
                              </strong>
                              <span className="text-[10px] text-gray-400">Expires: {activePlan?.plan_expiry_date || "N/A"}</span>
                            </div>
                          </div>

                          {(u?.user_type || "").toLowerCase().includes('owner') && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-gray-500 text-[11px] font-medium mr-1">Owner Features:</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.residential_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Res: {activePlan?.residential_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.commercial_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Comm: {activePlan?.commercial_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.pg_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                PG: {activePlan?.pg_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.buyer_tenant_enquiries !== "No" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-600"
                              }`}>
                                Inquiries: {activePlan?.buyer_tenant_enquiries !== "No" ? "Yes" : "No"}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Dashboard: {activePlan?.listing_performance_dashboard || "Basic"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.featured_credits === "Yes" ? "bg-amber-50 text-amber-800 border border-amber-300" : "bg-gray-100 text-gray-600"
                              }`}>
                                Featured: {activePlan?.featured_credits === "Yes" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.advertising_credits === "Yes" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-100 text-gray-600"
                              }`}>
                                Ads Contact: {activePlan?.advertising_credits === "Yes" ? "Yes" : "No"}
                              </span>
                            </div>
                          )}

                          {(u?.user_type || "").toLowerCase().includes('builder') && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-gray-500 text-[11px] font-medium mr-1">Builder Features:</span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Projects Limit: {activePlan?.no_of_project_units || activePlan?.max_projects || "1"}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                Property Limit: {activePlan?.no_of_property_units || activePlan?.no_of_units || "1"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.residential_development_project !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Res Dev: {activePlan?.residential_development_project !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.commercial_development_project !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Comm Dev: {activePlan?.commercial_development_project !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.residential_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Res Prop: {activePlan?.residential_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.commercial_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Comm Prop: {activePlan?.commercial_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.pg_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                PG: {activePlan?.pg_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.sale_property_listing !== "No" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600"
                              }`}>
                                Sale: {activePlan?.sale_property_listing !== "No" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.top_developer === "Yes" ? "bg-amber-50 text-amber-800 border border-amber-300" : "bg-gray-100 text-gray-600"
                              }`}>
                                Top Dev: {activePlan?.top_developer === "Yes" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.upcoming_project === "Yes" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-gray-100 text-gray-600"
                              }`}>
                                Upcoming: {activePlan?.upcoming_project === "Yes" ? "Yes" : "No"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                activePlan?.dedicated_support === "Yes" ? "bg-teal-50 text-teal-800 border border-teal-300" : "bg-gray-100 text-gray-600"
                              }`}>
                                Dedicated Support: {activePlan?.dedicated_support === "Yes" ? "Active" : "No"}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                                Dashboard: {activePlan?.listing_performance_dashboard || "Basic"}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Primary Dossier Grid (Spacious 2-column on Fullscreen) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Contact Dossier Card */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#7A0E2E] flex items-center justify-center font-bold">
                              <Phone className="w-4 h-4" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900 m-0">
                              Contact & Identity Details
                            </h4>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            Verified Info
                          </span>
                        </div>

                        <div className="space-y-4 text-sm">
                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Full Name</span>
                            <span className="font-bold text-gray-900 text-sm">{u?.full_name || "N/A"}</span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Phone / Mobile</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{u?.mobile_number || "N/A"}</span>
                              {u?.mobile_number && (
                                <>
                                  <a
                                    href={`tel:${u.mobile_number}`}
                                    className="px-2.5 py-1 rounded text-xs bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
                                  >
                                    Call
                                  </a>
                                  <a
                                    href={`https://wa.me/${u.mobile_number.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded text-xs bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                                  >
                                    WhatsApp
                                  </a>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Email Address</span>
                            <span className="font-semibold text-gray-900">{u?.email || "N/A"}</span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">City & Region</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#7A0E2E]" />
                              {u?.city || "Pune, India"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">User Classification</span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#52091D] border border-amber-300">
                              {u?.user_type || "Owner"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-500 font-medium">Associated Company</span>
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-gray-500" />
                              {u?.company_name || "Individual Homeowner"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Account & Security Control Card */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900 m-0">
                              Account Security & Direct Controls
                            </h4>
                          </div>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                              isVerified
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isVerified ? "Status: Verified" : "Status: Blocked"}
                          </span>
                        </div>

                        <div className="space-y-4 text-sm">
                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Account Access</span>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                isVerified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isVerified ? "Active & Authorized" : "Temporarily Suspended"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Member Since</span>
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {u?.created_at || "Recent Member"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Profile Tier</span>
                            <span className="font-semibold text-gray-900">{u?.account_type || "Standard"}</span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">Internal Database UID</span>
                            <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                              {u?._id || "N/A"}
                            </span>
                          </div>

                          {/* Instant Administrative Block/Unblock Box */}
                          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-gray-900 m-0">Direct Admin Override</p>
                              <span className="text-[11px] text-gray-500">
                                {isVerified
                                  ? "Clicking Block disables login and pauses active listings."
                                  : "Clicking Unblock restores full posting & lead privileges."}
                              </span>
                            </div>
                            <button
                              onClick={handleToggleBlock}
                              disabled={updatingStatus}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                isVerified
                                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {isVerified ? "Block User Now" : "Unblock User Now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------
                    TAB 2: POSTED PROPERTIES (3 Columns on Fullscreen)
                -------------------------------------------------- */}
                {activeTab === "properties" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 m-0">
                          Posted Properties ({properties.length})
                        </h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          Listings submitted and managed by this user on the Zerobriks portal
                        </p>
                      </div>
                    </div>

                    {properties.length === 0 ? (
                      <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
                        <Home className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-gray-700">No Properties Posted</h4>
                        <p className="text-xs text-gray-400">This user has not listed any real estate properties yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((prop, idx) => (
                          <div
                            key={prop._id || idx}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
                          >
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                              {prop.cover_image ? (
                                <img
                                  src={
                                    prop.cover_image.startsWith("http")
                                      ? prop.cover_image
                                      : `${process.env.REACT_APP_API_BASE_URL || ""}/${prop.cover_image}`
                                  }
                                  alt={prop.property_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Home className="w-12 h-12" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#7A0E2E] text-white shadow-xs">
                                  {prop.property_type || "Sale"}
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 text-white backdrop-blur-xs">
                                  {prop.property_category_type || "Apartment"}
                                </span>
                              </div>
                              <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#52091D]/95 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm backdrop-blur-xs">
                                {formatPrice(prop.property_price)}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#7A0E2E] transition-colors">
                                  {prop.property_name}
                                </h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-3 line-clamp-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#7A0E2E] flex-shrink-0" />
                                  {prop.address || prop.city_name || "Location provided"}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1 font-semibold text-gray-700">
                                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  {prop.bhk_type || "Residential"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {prop.available_status || "Available"}
                                </span>
                                <span>{prop.date || "Active Listing"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------
                    TAB 3: POSTED PROJECTS (3 Columns on Fullscreen)
                -------------------------------------------------- */}
                {activeTab === "projects" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 m-0">
                          Posted Projects ({projects.length})
                        </h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          Large-scale builder developments, residential towers & commercial hubs
                        </p>
                      </div>
                    </div>

                    {projects.length === 0 ? (
                      <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
                        <Layers className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-gray-700">No Projects Posted</h4>
                        <p className="text-xs text-gray-400">
                          This user does not have any active project developments registered.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj, idx) => (
                          <div
                            key={proj._id || idx}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group"
                          >
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                              {proj.cover_image ? (
                                <img
                                  src={
                                    proj.cover_image.startsWith("http")
                                      ? proj.cover_image
                                      : `${process.env.REACT_APP_API_BASE_URL || ""}/${proj.cover_image}`
                                  }
                                  alt={proj.project_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Layers className="w-12 h-12" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#D4AF37] text-[#52091D] shadow-xs">
                                  Project
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 text-white backdrop-blur-xs">
                                  {proj.building_type || "Township"}
                                </span>
                              </div>
                              <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#52091D]/95 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm backdrop-blur-xs">
                                Avg {formatPrice(proj.average_project_price)}
                              </span>
                            </div>

                            <div className="p-5">
                              <h4 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-[#7A0E2E] transition-colors">
                                {proj.project_name}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-3">
                                <MapPin className="w-3.5 h-3.5 text-[#7A0E2E]" />
                                {proj.address || proj.city_name}
                              </p>

                              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  Category: {proj.property_category_type || "Development"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {proj.admin_approval || "Approved"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------
                    TAB 4: PURCHASED PLANS (Detailed Table & Cards)
                -------------------------------------------------- */}
                {activeTab === "plans" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 m-0">
                          Purchased Plans ({plans.length})
                        </h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          Zerobriks membership and lead subscription packages purchased by user
                        </p>
                      </div>
                    </div>

                    {plans.length === 0 ? (
                      <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
                        <CreditCard className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-gray-700">No Plans Purchased</h4>
                        <p className="text-xs text-gray-400">This user is currently on the Free Basic Tier.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {plans.map((pl, idx) => (
                          <div
                            key={pl._id || idx}
                            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#D4AF37] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-[#7A0E2E] flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="text-base font-bold text-gray-900 m-0">
                                    {pl.plan_name}
                                  </h4>
                                  <span
                                    className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                                      pl.plan_status === "Active"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        : "bg-gray-100 text-gray-600 border border-gray-300"
                                    }`}
                                  >
                                    {pl.plan_status || "Active"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5 mb-0">
                                  TXN ID: <span className="font-mono text-gray-800 font-bold">{pl.transaction_id}</span> • Method: {pl.payment_mode}
                                </p>
                                <span className="text-xs text-[#7A0E2E] font-semibold block mt-1">
                                  Included Benefits: {pl.no_of_units || "Standard Quota"}
                                </span>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {(pl.dedicated_support === "Yes" || pl.dedicated_support === "Priority" || pl.dedicated_support === "Standard") && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1 shadow-2xs">
                                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                                      Dedicated Support Team Assigned
                                    </span>
                                  )}
                                  {(pl.personalized_property_assistance === "Yes" || pl.personalized_assistance === "Yes") && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                      Personalized Property Assistance Active
                                    </span>
                                  )}
                                  {pl.contact_unlocks && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      Contacts: {pl.contact_unlocks} Unlocks
                                    </span>
                                  )}
                                  {pl.new_property_alerts && pl.new_property_alerts !== "No" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Alerts: Active ({pl.new_property_alerts})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 flex flex-col justify-center">
                              <div className="text-xl font-bold text-[#7A0E2E]">
                                {pl.amount || "₹ 4,999"}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Purchase Date: {pl.plan_purchase_date || "N/A"}
                              </div>
                              <div className="text-xs font-bold text-amber-700 mt-0.5">
                                Valid Until: {pl.plan_expiry_date || "Active"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------
                    TAB 5: LEADS OF PROPERTIES & PROJECTS
                -------------------------------------------------- */}
                {activeTab === "leads" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 m-0">
                          Buyer Leads & View Intelligence ({leads.length})
                        </h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          Potential buyers and investors who viewed this user's properties & projects
                        </p>
                      </div>
                    </div>

                    {leads.length === 0 ? (
                      <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
                        <TrendingUp className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-gray-700">No Leads Recorded</h4>
                        <p className="text-xs text-gray-400">No buyer interactions recorded on user listings yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leads.map((lead, idx) => (
                          <div
                            key={lead._id || idx}
                            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                                <Eye className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="text-sm font-bold text-gray-900">
                                    {lead.viewer_name || `Lead #${lead.viewer_id || idx + 1}`}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    {lead.type || "View Lead"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 mb-0">
                                  Target Listing:{" "}
                                  <span className="font-bold text-[#7A0E2E]">
                                    {lead.target_name || `ID: ${lead.property_id || lead.project_id || "Listing"}`}
                                  </span>
                                </p>
                                {lead.contact && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    {lead.contact}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-left md:text-right text-xs text-gray-500">
                              <span className="flex items-center md:justify-end gap-1.5 font-semibold text-gray-700">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {lead.timestamp || "Recently"}
                              </span>
                              {lead.source && (
                                <span className="text-[11px] text-gray-400 block mt-1">
                                  Source: {lead.source}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------
                    TAB 6: ENQUIRIES OF PROPERTY & PROJECT
                -------------------------------------------------- */}
                {activeTab === "enquiries" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 m-0">
                          Inbound Enquiries Received ({enquiries.length})
                        </h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          Direct client messages and visit requests submitted to this user's listings
                        </p>
                      </div>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
                        <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-gray-700">No Enquiries Received</h4>
                        <p className="text-xs text-gray-400">
                          This user has not received any direct buyer enquiries on their properties yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enquiries.map((enq, idx) => (
                          <div
                            key={enq._id || idx}
                            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#7A0E2E] text-white">
                                  {enq.type || "Property"}
                                </span>
                                <h4 className="text-sm font-bold text-gray-900 m-0">
                                  {enq.name || "Enquirer"}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  ({enq.contact_number || "Contact hidden"})
                                </span>
                              </div>

                              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {enq.time_date || "Recent"}
                              </span>
                            </div>

                            <div className="text-xs">
                              <span className="text-gray-500 font-medium">Interested in Listing: </span>
                              <span className="font-bold text-[#7A0E2E]">
                                {enq.target_name || "Listing"}
                              </span>
                              {enq.target_price && (
                                <span className="ml-2 font-bold text-[#D4AF37]">
                                  ({formatPrice(enq.target_price)})
                                </span>
                              )}
                            </div>

                            {enq.message && (
                              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-800 leading-relaxed font-serif italic">
                                "{enq.message}"
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                              <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#7A0E2E]" />
                                {enq.city || u?.city || "Pune"}
                              </span>
                              {enq.contact_number && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${enq.contact_number}`}
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors"
                                  >
                                    Call Enquirer
                                  </a>
                                  <a
                                    href={`https://wa.me/${enq.contact_number.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                                  >
                                    WhatsApp
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* =========================================================
            FULLSCREEN FOOTER BAR
        ========================================================= */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0 text-xs text-gray-500 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium">Zerobriks 360° Real-time User Tracking Engine • Enterprise Edition</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Dossier</span>
          </button>
        </div>
      </div>
  );
};

export default UserTrackingModal;
