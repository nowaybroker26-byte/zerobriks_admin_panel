import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  FolderKanban,
  CheckSquare,
  Users,
  UserCheck,
  User,
  Bed,
  Globe,
  Bell,
  MessageSquare,
  Mail,
  FileBarChart,
  IndianRupee,
  MapPin,
  Activity,
  CreditCard,
  Gift,
  Smartphone,
  ShieldCheck,
  UserCog,
  Menu,
  LogOut,
  Lock,
  Search,
  Calendar,
  ChevronDown,
  Sliders,
  Video,
  Megaphone,
} from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import "./style.css";
import zerobriksLogo from "./zerobriks_logo.png";
import { MyContext } from "../../App";
import {
  clearRoleFromSession,
  clearAllowedCitiesFromSession,
} from "../../permissions/permissionConfig";

// Categorized Sidebar Configuration matching reference UI
const SIDEBAR_SECTIONS = [
  {
    section: null,
    items: [
      {
        name: "Dashboard",
        icon: Home,
        href: "/admin",
        moduleKey: "admin",
      },
    ],
  },
  {
    section: "PROPERTY MANAGEMENT",
    items: [
      {
        name: "Properties",
        icon: Building2,
        href: "/properties",
        moduleKey: "myInventory",
      },
      {
        name: "Projects",
        icon: FolderKanban,
        href: "/projects",
        moduleKey: "projects",
      },
      {
        name: "Smart Approval",
        icon: CheckSquare,
        href: "/recent-properties",
        moduleKey: "myInventory",
        badge: "12",
      },
    ],
  },
  {
    section: "USERS MANAGEMENT",
    items: [
      {
        name: "Owners",
        icon: UserCheck,
        href: "/user-type/Owner",
        moduleKey: "users",
      },
      {
        name: "Buyers",
        icon: User,
        href: "/user-type/Buyer",
        moduleKey: "users",
      },
      {
        name: "Tenants",
        icon: Users,
        href: "/user-type/Tenant",
        moduleKey: "users",
      },
      {
        name: "PG Seekers",
        icon: Bed,
        href: "/user-type/PG",
        moduleKey: "users",
      },
      {
        name: "Builders",
        icon: Building2,
        href: "/developers",
        moduleKey: "users",
      },
      {
        name: "NRI Clients",
        icon: Globe,
        href: "/customers",
        moduleKey: "users",
      },
      {
        name: "All Users",
        icon: Users,
        href: "/customers",
        moduleKey: "users",
      },
    ],
  },
  {
    section: "COMMUNICATION",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        href: "/notificationsList",
        moduleKey: "notifications",
        dot: true,
      },
      {
        name: "Inquiries",
        icon: Mail,
        href: "/inquiry",
        moduleKey: "inquiries",
      },
      {
        name: "Messages",
        icon: MessageSquare,
        href: "/feedbacks",
        moduleKey: "feedback",
      },
      {
        name: "Virtual Tour",
        icon: Video,
        href: "/virtual-tour-all",
        moduleKey: "virtualTour",
      },
    ],
  },
  {
    section: "ADVERTISING",
    items: [
      {
        name: "Advertising",
        icon: Megaphone,
        href: "/hero-sliders",
      },
      {
        name: "Offers & Coupons",
        icon: Gift,
        href: "/offers",
        moduleKey: "offers",
      },
    ],
  },
  {
    section: "BUSINESS & ANALYTICS",
    items: [
      {
        name: "Reports",
        icon: FileBarChart,
        href: "/admin",
        moduleKey: "admin",
      },
      {
        name: "Revenue",
        icon: IndianRupee,
        href: "/plans-purchase-history",
        moduleKey: "planHistory",
      },
      {
        name: "City Analytics",
        icon: MapPin,
        href: "/admin",
        moduleKey: "admin",
      },
      {
        name: "User Activity",
        icon: Activity,
        href: "/customers",
        moduleKey: "users",
      },
      {
        name: "Plan Subscriptions",
        icon: CreditCard,
        href: "/plans-purchase",
        moduleKey: "plans",
      },
    ],
  },
  {
    section: "SETTINGS",
    items: [
      {
        name: "Website Settings",
        icon: Sliders,
        href: "/hero-sliders",
      },
      {
        name: "App Settings",
        icon: Smartphone,
        href: "/admin-settings",
        moduleKey: "setting",
      },
      {
        name: "Manage Cities",
        icon: MapPin,
        href: "/admin-settings/general-setting",
        moduleKey: "setting",
      },
      {
        name: "Legal & Compliance",
        icon: ShieldCheck,
        href: "/terms",
        moduleKey: "legal",
      },
      {
        name: "Admin Staff",
        icon: UserCog,
        href: "/admin-staff",
        superAdminOnly: true,
      },
      {
        name: "Roles & Permissions",
        icon: Lock,
        href: "/roles-permissions",
        superAdminOnly: true,
      },
    ],
  },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const { can, currentRole } = useContext(MyContext) || { can: () => true };

  const isActive = (path, name) => {
    if (name === "Dashboard" && location.pathname === "/admin") return true;
    if (name === "All Users" && location.pathname === "/customers") return true;
    if (
      ["Reports", "City Analytics", "NRI Clients", "User Activity"].includes(name)
    ) {
      return false;
    }
    if (
      (name === "Advertising" || name === "Website Settings") &&
      [
        "/hero-sliders",
        "/sliders",
        "/advertising",
        "/advertisement",
        "/admin/advertising",
        "/admin/hero-sliders",
      ].includes(location.pathname)
    ) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "w-60 translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
      >
        {/* Top White Logo Header (Matches Reference Screenshot) */}
        <div className="h-16 bg-white flex items-center justify-between px-4 border-b border-r border-gray-200 flex-shrink-0">
          {isSidebarOpen ? (
            <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
              <img
                src={zerobriksLogo}
                alt="ZEROBRIKS"
                className="h-9 w-auto object-contain"
              />
            </Link>
          ) : (
            <Link
              to="/admin"
              className="mx-auto w-9 h-9 rounded-lg bg-[#7A0E2E] flex items-center justify-center font-black text-white text-xs"
            >
              ZB
            </Link>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={19} />
          </button>
        </div>

        {/* Maroon Navigation Body */}
        <div
          className="flex-1 flex flex-col justify-between overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #68091D 0%, #38020D 100%)",
          }}
        >
          {/* Scrollable Menu List */}
          <div className="flex-1 sidebar-no-scrollbar py-3 px-3 space-y-1">
            {SIDEBAR_SECTIONS.map((group, gIdx) => {
              const visibleItems = group.items.filter((item) =>
                item.superAdminOnly
                  ? currentRole?.isSuperAdmin
                  : currentRole?.isSuperAdmin ||
                    !item.moduleKey ||
                    can(item.moduleKey, "view")
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx} className={gIdx > 0 ? "pt-2.5" : ""}>
                  {group.section && isSidebarOpen && (
                    <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-rose-200/60">
                      {group.section}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const active = isActive(item.href, item.name);
                      const IconComp = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => {
                            if (
                              typeof window !== "undefined" &&
                              window.innerWidth < 768
                            ) {
                              toggleSidebar();
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            active
                              ? "text-white shadow-sm font-bold"
                              : "text-rose-100/85 hover:bg-white/10 hover:text-white"
                          }`}
                          style={
                            active
                              ? {
                                  background:
                                    "linear-gradient(90deg, #D99B26 0%, #C48519 100%)",
                                }
                              : {}
                          }
                          title={!isSidebarOpen ? item.name : ""}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative flex-shrink-0">
                              <IconComp
                                size={16}
                                className={
                                  active ? "text-white" : "text-amber-300/90"
                                }
                              />
                              {item.dot && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-[#68091D]" />
                              )}
                            </div>
                            {isSidebarOpen && (
                              <span className="truncate leading-tight">
                                {item.name}
                              </span>
                            )}
                          </div>

                          {isSidebarOpen && item.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white leading-none">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Brand Card matching Screenshot */}
          {isSidebarOpen && (
            <div className="p-3 flex-shrink-0">
              <div
                className="rounded-xl p-2.5 border border-amber-400/25 flex items-center gap-2.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(120, 12, 34, 0.7) 0%, rgba(56, 2, 13, 0.9) 100%)",
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-[#38020D] font-black text-xs shadow-sm flex-shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white tracking-wide leading-tight">
                    ZEROBRIKS
                  </div>
                  <div className="text-[10px] text-amber-300/90 font-medium leading-tight">
                    Version 1.0.0
                  </div>
                  <div className="text-[9px] text-rose-200/70 truncate mt-0.5">
                    Your Digital Agent. Zero Brokerage.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allCachedUsers, setAllCachedUsers] = useState([]);
  const searchContainerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, setIsAuthenticated } = useContext(MyContext) || {};

  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  // Load users for instant global search by Customer ID (e.g. ZB-CU-2B379E), Name, Mobile, Email, City
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/api/get_users`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.status === 1 && Array.isArray(json.data)) {
            setAllCachedUsers(json.data);
          }
        }
      } catch (err) {
        // Ignore background prefetch errors
      }
    };
    fetchAllUsers();
  }, [location.pathname]);

  useEffect(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const matches = allCachedUsers
      .filter((u) => {
        const cid = String(
          u.customer_id || `ZB-CU-${String(u._id || "").slice(-6).toUpperCase()}`
        ).toLowerCase();
        const name = String(u.full_name || "").toLowerCase();
        const mobile = String(u.mobile_number || "").toLowerCase();
        const email = String(u.email || "").toLowerCase();
        const city = String(u.city || "").toLowerCase();
        return (
          cid.includes(q) ||
          name.includes(q) ||
          mobile.includes(q) ||
          email.includes(q) ||
          city.includes(q)
        );
      })
      .slice(0, 6);
    setSearchResults(matches);
  }, [globalSearch, allCachedUsers]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSearchUser = (u) => {
    const cid =
      u.customer_id || `ZB-CU-${String(u._id || "").slice(-6).toUpperCase()}`;
    setIsSearchOpen(false);
    setGlobalSearch(cid);
    navigate(`/customers?search=${encodeURIComponent(cid)}&track=${encodeURIComponent(cid)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      setIsSearchOpen(false);
      if (searchResults.length === 1) {
        handleSelectSearchUser(searchResults[0]);
      } else {
        navigate(`/customers?search=${encodeURIComponent(globalSearch.trim())}`);
      }
    }
  };

  const renderSearchDropdown = () => {
    if (!isSearchOpen || !globalSearch.trim()) return null;
    return (
      <div className="absolute left-0 right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 max-h-80 overflow-y-auto">
        {searchResults.length === 0 ? (
          <div className="px-4 py-3 text-xs text-gray-500 text-center">
            No user found for{" "}
            <span className="font-mono font-bold text-gray-800">
              "{globalSearch}"
            </span>
          </div>
        ) : (
          <>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              Matching Users ({searchResults.length})
            </div>
            {searchResults.map((u) => {
              const cid =
                u.customer_id ||
                `ZB-CU-${String(u._id || "").slice(-6).toUpperCase()}`;
              return (
                <button
                  key={u._id || cid}
                  type="button"
                  onClick={() => handleSelectSearchUser(u)}
                  className="w-full px-3 py-2 text-left hover:bg-amber-50/60 flex items-center justify-between gap-2 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-[#7A0E2E] border border-[#7A0E2E]/20">
                        {cid}
                      </span>
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {u.full_name || "User"}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {u.mobile_number || "No mobile"} • {u.city || "Pune"} •{" "}
                      <span className="font-semibold text-gray-700">
                        {u.user_type || "Owner"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#7A0E2E] whitespace-nowrap">
                    Track →
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    );
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("token");
    try {
      if (token && process.env.REACT_APP_API_BASE_URL) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/logout/`,
          {},
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.warn("Logout endpoint error:", error);
    } finally {
      sessionStorage.removeItem("token");
      clearRoleFromSession();
      clearAllowedCitiesFromSession();
      if (setIsAuthenticated) setIsAuthenticated(false);
      navigate("/");
    }
  };

  const isDashboard = location.pathname === "/admin";

  return (
    <header
      ref={searchContainerRef}
      className={`fixed top-0 right-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        isSidebarOpen ? "md:left-60 left-0" : "md:left-20 left-0"
      }`}
    >
      {/* Left Title or Search */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>

        {isDashboard ? (
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight m-0 leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-[11px] text-gray-500 m-0 hidden lg:block truncate">
              Complete overview of your platform performance, users, properties and business growth.
            </p>
          </div>
        ) : (
          <div className="relative w-64 sm:w-96 lg:w-[440px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={globalSearch}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by Customer ID (e.g. ZB-CU-2B379E), Name, Mobile, Email, City..."
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#7A0E2E]"
            />
            {renderSearchDropdown()}
          </div>
        )}
      </div>

      {/* Right Controls: Search (on dashboard), Date/City selector, Bell, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {isDashboard ? (
          <>
            <div className="relative hidden xl:block w-80">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={globalSearch}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by ID (ZB-CU-2B379E), name, mobile, city..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#7A0E2E]"
              />
              {renderSearchDropdown()}
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
              <Calendar size={14} className="text-amber-600" />
              <span>01 Apr 2026 – 30 Sep 2026</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
            <MapPin size={14} className="text-[#7A0E2E]" />
            <span>All Cities</span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
        )}

        {/* Notification Bell */}
        <Link
          to="/notificationsList"
          className="relative p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900"
        >
          <Bell size={16} />
          <span className="absolute -top-1 -right-0.5 bg-red-600 text-white text-[9px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center">
            {isDashboard ? "1" : "12"}
          </span>
        </Link>

        {/* Admin User Pill */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7A0E2E] to-[#D4AF37] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              A
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-gray-900">Admin</div>
              <div className="text-[10px] text-gray-500 font-medium">
                {currentRole?.name || "Super Admin"}
              </div>
            </div>
            <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
              <Link
                to="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <FaUserCircle size={15} className="text-[#7A0E2E]" />
                <span>Profile Settings</span>
              </Link>
              <Link
                to="/change-password"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Lock size={14} className="text-[#A57F38]" />
                <span>Change Password</span>
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const SidebarLayout = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default SidebarLayout;
