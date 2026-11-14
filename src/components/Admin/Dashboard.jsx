import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Users,
  User,
  Home,
  Building2,
  Bed,
  Download,
  ArrowUp,
  MoreHorizontal,
  ShieldCheck,
  MessageSquare,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import UserTrackingModal from "../Customers/UserTrackingModal";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("last_6_months");
  const [distTarget, setDistTarget] = useState("property");
  const [revenuePeriod, setRevenuePeriod] = useState("Monthly");
  const [userTab, setUserTab] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Fetch Dashboard Analytics from Backend
  const fetchDashboard = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);

      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
        const res = await axios.post(`${baseUrl}/api/get_dashboard`, {
          filter_period: periodFilter,
        });

        if (res.data?.data) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setRefreshing(false);
      }
    },
    [periodFilter]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Derived data from database API
  const data = dashboardData || {};
  const kpi = data.kpi || {
    total_users: { count: 0, growth: "+0%" },
    owners: { count: 0, growth: "+0%" },
    buyers: { count: 0, growth: "+0%" },
    tenants: { count: 0, growth: "+0%" },
    pg_seekers: { count: 0, growth: "+0%" },
    builders: { count: 0, growth: "+0%" },
    total_properties: { count: 0, growth: "+0%" },
    total_projects: { count: 0, growth: "+0%" },
  };

  const regTrend = data.registration_trend || {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: {
      owners: [0, 0, 0, 0, 0, 0],
      buyers: [0, 0, 0, 0, 0, 0],
      tenants: [0, 0, 0, 0, 0, 0],
      pg_seekers: [0, 0, 0, 0, 0, 0],
      builders: [0, 0, 0, 0, 0, 0],
    },
  };

  const cityUsers = data.city_wise_users || [];

  const propDist = data.properties_distribution || {
    property_types: [],
    project_types: [],
    total_properties: 0,
    total_projects: 0,
  };

  const revenueOverview = data.revenue_overview || {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    amounts: [0, 0, 0, 0, 0, 0],
    formatted_amounts: ["0", "0", "0", "0", "0", "0"],
    total_revenue: 0,
  };

  const propStatus = data.properties_status || [];
  const userSource = data.user_source || [];
  const recentUsers = useMemo(
    () => data.recent_users || [],
    [data.recent_users]
  );
  const recentActivities = data.recent_activities || [];
  const cityExpansion = data.city_expansion || [];
  const topPerformingCities = data.top_performing_cities || [];
  const conversionFunnel = data.conversion_funnel || [];

  // Filtered recent users by tab & search (Customer ID e.g. ZB-CU-2B379E, Name, Mobile, City)
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return recentUsers.filter((u) => {
      const t = (u.type || "").toLowerCase();
      let matchesTab = true;
      if (userTab === "owners") matchesTab = t.includes("owner");
      else if (userTab === "buyers") matchesTab = t.includes("buyer");
      else if (userTab === "tenants") matchesTab = t.includes("tenant");
      else if (userTab === "pg") matchesTab = t.includes("pg");
      else if (userTab === "builders")
        matchesTab = t.includes("builder") || t.includes("developer");

      if (!matchesTab) return false;
      if (!q) return true;

      const cid = String(u.customer_id || u.user_id || "").toLowerCase();
      const name = String(u.name || "").toLowerCase();
      const mobile = String(u.mobile || "").toLowerCase();
      const city = String(u.city || "").toLowerCase();
      return (
        cid.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        city.includes(q)
      );
    });
  }, [recentUsers, userTab, userSearch]);

  // Export Report Handler
  const handleExportReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Count,Growth\n" +
      `Total Users,${kpi.total_users.count},${kpi.total_users.growth}\n` +
      `Property Owners,${kpi.owners.count},${kpi.owners.growth}\n` +
      `Buyers,${kpi.buyers.count},${kpi.buyers.growth}\n` +
      `Tenants,${kpi.tenants.count},${kpi.tenants.growth}\n` +
      `PG Seekers,${kpi.pg_seekers.count},${kpi.pg_seekers.growth}\n` +
      `Builders,${kpi.builders.count},${kpi.builders.growth}\n` +
      `Total Properties,${kpi.total_properties.count},${kpi.total_properties.growth}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Zerobriks_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart.js Config: 1. User Registration Trend Line Chart
  const trendLineData = {
    labels: regTrend.labels,
    datasets: [
      {
        label: "Owners",
        data: regTrend.datasets?.owners || [],
        borderColor: "#881337",
        backgroundColor: "#881337",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Buyers",
        data: regTrend.datasets?.buyers || [],
        borderColor: "#D97706",
        backgroundColor: "#D97706",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Tenants",
        data: regTrend.datasets?.tenants || [],
        borderColor: "#0284C7",
        backgroundColor: "#0284C7",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "PG Seekers",
        data: regTrend.datasets?.pg_seekers || [],
        borderColor: "#7C3AED",
        backgroundColor: "#7C3AED",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Builders",
        data: regTrend.datasets?.builders || [],
        borderColor: "#10B981",
        backgroundColor: "#10B981",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const trendLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        titleFont: { size: 11, weight: "bold" },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: true, color: "#F1F5F9" },
        ticks: { font: { size: 10 }, color: "#64748B" },
      },
      y: {
        grid: { display: true, color: "#F1F5F9" },
        ticks: { font: { size: 10 }, color: "#64748B", precision: 0 },
        beginAtZero: true,
      },
    },
  };

  // Donut Configs: Properties Distribution
  const activeDistList =
    (distTarget === "project"
      ? propDist.project_types
      : propDist.property_types) || [];
  const currentDistTotal =
    distTarget === "project"
      ? propDist.total_projects
      : propDist.total_properties;

  const propDistChartData = {
    labels: activeDistList.length
      ? activeDistList.map((d) => d.name)
      : ["No Data"],
    datasets: [
      {
        data: activeDistList.length ? activeDistList.map((d) => d.count) : [1],
        backgroundColor: activeDistList.length
          ? activeDistList.map((d) => d.color)
          : ["#E2E8F0"],
        borderWidth: 2,
        borderColor: "#FFFFFF",
        hoverOffset: 4,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 8,
      },
    },
  };

  // Revenue Bar Chart
  const revenueChartData = {
    labels: revenueOverview.labels,
    datasets: [
      {
        data: revenueOverview.amounts,
        backgroundColor: "#780018",
        borderRadius: 4,
        barThickness: 24,
        hoverBackgroundColor: "#9C3A4A",
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${(ctx.raw || 0).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "#64748B" },
      },
      y: {
        grid: { display: true, color: "#F1F5F9" },
        ticks: {
          font: { size: 10 },
          color: "#64748B",
          callback: (value) => {
            if (value >= 100000) return `${value / 100000}L`;
            if (value >= 1000) return `${value / 1000}k`;
            return value;
          },
        },
        beginAtZero: true,
      },
    },
  };

  // Properties Status Donut
  const propStatusChartData = {
    labels: propStatus.length ? propStatus.map((s) => s.name) : ["No Data"],
    datasets: [
      {
        data: propStatus.length ? propStatus.map((s) => s.count) : [1],
        backgroundColor: propStatus.length
          ? propStatus.map((s) => s.color)
          : ["#E2E8F0"],
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  };

  // User Source Donut
  const userSourceChartData = {
    labels: userSource.length ? userSource.map((s) => s.name) : ["No Data"],
    datasets: [
      {
        data: userSource.length ? userSource.map((s) => s.count) : [1],
        backgroundColor: userSource.length
          ? userSource.map((s) => s.color)
          : ["#E2E8F0"],
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  };

  const kpiCards = [
    {
      label: "Total Users",
      count: kpi.total_users.count,
      growth: kpi.total_users.growth,
      icon: Users,
      iconBg: "bg-rose-50 text-[#881337]",
    },
    {
      label: "Property Owners",
      count: kpi.owners.count,
      growth: kpi.owners.growth,
      icon: User,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Buyers",
      count: kpi.buyers.count,
      growth: kpi.buyers.growth,
      icon: Users,
      iconBg: "bg-red-50 text-red-700",
    },
    {
      label: "Tenants",
      count: kpi.tenants.count,
      growth: kpi.tenants.growth,
      icon: Building2,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "PG Seekers",
      count: kpi.pg_seekers.count,
      growth: kpi.pg_seekers.growth,
      icon: Bed,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      label: "Builders",
      count: kpi.builders.count,
      growth: kpi.builders.growth,
      icon: Building2,
      iconBg: "bg-rose-50 text-rose-700",
    },
    {
      label: "Total Properties",
      count: kpi.total_properties.count,
      growth: kpi.total_properties.growth,
      icon: Home,
      iconBg: "bg-amber-50 text-[#C59B27]",
    },
  ];

  if (isTrackingModalOpen && selectedUserForTracking) {
    return (
      <UserTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        user={selectedUserForTracking}
        onStatusChange={() => fetchDashboard(true)}
      />
    );
  }

  return (
    <div className="w-full bg-[#F4F6F9] min-h-[calc(100vh-4rem)] text-[#1E293B] pb-8 font-sans">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 pt-3">
        {/* Top Action Row: Refresh status on left, Export Report Gold Button on right */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {refreshing && (
              <span className="inline-flex items-center gap-1.5 text-[#780018] font-semibold">
                <RefreshCw size={13} className="animate-spin" />
                Updating live data...
              </span>
            )}
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(90deg, #D49B35 0%, #B87D1B 100%)",
            }}
          >
            <Download size={13} />
            <span>Export Report</span>
          </button>
        </div>

        {/* =========================================================================
            ROW 1: 7 KPI STATS CARDS (Exact Screenshot Layout)
        ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-3.5">
          {kpiCards.map((card, i) => {
            const IconComp = card.icon;
            return (
              <div
                key={i}
                className="bg-white px-3.5 py-3 rounded-2xl border border-gray-200/90 shadow-sm flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  <IconComp size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-gray-600 truncate leading-tight">
                    {card.label}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight my-0.5">
                    {card.count.toLocaleString("en-IN")}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 leading-none">
                    <ArrowUp size={11} strokeWidth={3} />
                    <span>{card.growth}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">
                    vs last month
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            ROW 2: USER REGISTRATION TREND | CITY WISE USERS | PROPERTIES DISTRIBUTION
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5">
          {/* 1. User Registration Trend (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                  User Registration Trend
                </h2>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="last_year">Last 1 Year</option>
                  <option value="current_month">Current Month</option>
                </select>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap items-center gap-3 mb-2 text-[10px] font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#881337]" /> Owners
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Buyers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]" /> Tenants
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> PG Seekers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Builders
                </span>
              </div>
            </div>

            <div className="h-[185px] w-full">
              <Line data={trendLineData} options={trendLineOptions} />
            </div>
          </div>

          {/* 2. City Wise Users (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                  City Wise Users
                </h2>
                <select className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                  <option>Top 8 Cities</option>
                </select>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 mb-2.5 text-[10px] font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#881337]" /> Owners
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Buyers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]" /> Tenants
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> PG
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Builders
                </span>
              </div>
            </div>

            <div className="space-y-2 my-auto">
              {cityUsers.slice(0, 8).map((c, idx) => {
                const maxCityTotal = Math.max(
                  ...cityUsers.map((x) => x.total || 1),
                  1
                );
                const widthRatio = Math.max((c.total / maxCityTotal) * 100, 8);
                const t = c.total || 1;

                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-[11px] font-medium text-gray-700 truncate">
                      {c.city}
                    </span>
                    <div className="flex-1 bg-gray-100 h-3 rounded-sm overflow-hidden">
                      <div
                        className="h-full flex"
                        style={{ width: `${widthRatio}%` }}
                      >
                        <div
                          style={{
                            width: `${(c.owners / t) * 100}%`,
                            backgroundColor: "#881337",
                          }}
                        />
                        <div
                          style={{
                            width: `${(c.buyers / t) * 100}%`,
                            backgroundColor: "#D97706",
                          }}
                        />
                        <div
                          style={{
                            width: `${(c.tenants / t) * 100}%`,
                            backgroundColor: "#0284C7",
                          }}
                        />
                        <div
                          style={{
                            width: `${(c.pg / t) * 100}%`,
                            backgroundColor: "#7C3AED",
                          }}
                        />
                        <div
                          style={{
                            width: `${(c.builders / t) * 100}%`,
                            backgroundColor: "#10B981",
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right font-bold text-gray-900 text-[11px]">
                      {c.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Properties Distribution Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                Properties Distribution
              </h2>
              <select
                value={distTarget}
                onChange={(e) => setDistTarget(e.target.value)}
                className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="property">By Property Type</option>
                <option value="project">By Project</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 my-auto h-[195px]">
              {/* Left Donut */}
              <div className="relative w-[150px] h-[150px] flex-shrink-0 mx-auto">
                <Doughnut data={propDistChartData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-gray-900 leading-none">
                    {(currentDistTotal || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                    {distTarget === "project" ? "Projects" : "Properties"}
                  </span>
                </div>
              </div>

              {/* Right Legend */}
              <div className="flex-1 space-y-2 text-xs">
                {activeDistList.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-medium text-gray-700 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap">
                      {item.percentage}%{" "}
                      <span className="text-gray-400 font-normal">
                        ({item.count.toLocaleString("en-IN")})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 3: REVENUE OVERVIEW | PROPERTIES STATUS | USER SOURCE
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5">
          {/* 1. Revenue Overview (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                Revenue Overview
              </h2>
              <select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value)}
                className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <div className="h-[165px] w-full mt-1">
              <Bar data={revenueChartData} options={revenueOptions} />
            </div>
          </div>

          {/* 2. Properties Status Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <h2 className="text-sm font-black text-gray-900 tracking-tight m-0 mb-2">
              Properties Status
            </h2>

            <div className="flex items-center justify-between gap-3 my-auto h-[165px]">
              <div className="relative w-[140px] h-[140px] flex-shrink-0 mx-auto">
                <Doughnut data={propStatusChartData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-gray-900 leading-none">
                    {kpi.total_properties.count.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                    Total
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {propStatus.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-medium text-gray-700 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap">
                      {item.percentage}%{" "}
                      <span className="text-gray-400 font-normal">
                        ({item.count.toLocaleString("en-IN")})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. User Source Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <h2 className="text-sm font-black text-gray-900 tracking-tight m-0 mb-2">
              User Source
            </h2>

            <div className="flex items-center justify-between gap-3 my-auto h-[165px]">
              <div className="relative w-[140px] h-[140px] flex-shrink-0 mx-auto">
                <Doughnut data={userSourceChartData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-gray-900 leading-none">
                    {kpi.total_users.count.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                    Users
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {userSource.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-medium text-gray-700 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 4: RECENT USER REGISTRATIONS (8 cols) | RECENT ACTIVITIES (4 cols)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5">
          {/* Left Table: Recent User Registrations (8 cols) */}
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                Recent User Registrations
              </h2>
              <div className="flex items-center gap-2.5">
                <div className="relative w-52 sm:w-64">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search ID (ZB-CU-2B379E), Name..."
                    className="w-full pl-7 pr-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#780018]"
                  />
                </div>
                <button
                  onClick={() => navigate("/customers")}
                  className="text-xs font-bold text-[#881337] hover:text-[#780018] flex items-center gap-0.5 whitespace-nowrap"
                >
                  <span>View All</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 border-b border-gray-100 scrollbar-none">
              {[
                {
                  id: "all",
                  label: `All (${kpi.total_users.count.toLocaleString("en-IN")})`,
                },
                {
                  id: "owners",
                  label: `Owners (${kpi.owners.count.toLocaleString("en-IN")})`,
                },
                {
                  id: "buyers",
                  label: `Buyers (${kpi.buyers.count.toLocaleString("en-IN")})`,
                },
                {
                  id: "tenants",
                  label: `Tenants (${kpi.tenants.count.toLocaleString("en-IN")})`,
                },
                {
                  id: "pg",
                  label: `PG (${kpi.pg_seekers.count.toLocaleString("en-IN")})`,
                },
                {
                  id: "builders",
                  label: `Builders (${kpi.builders.count.toLocaleString("en-IN")})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setUserTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
                    userTab === tab.id
                      ? "bg-[#780018] text-white border-[#780018] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                    <th className="py-2 px-2">User ID</th>
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Mobile</th>
                    <th className="py-2 px-2">City</th>
                    <th className="py-2 px-2">Registration Date</th>
                    <th className="py-2 px-2">T&C</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.slice(0, 6).map((u, idx) => {
                    const typeLower = (u.type || "").toLowerCase();
                    let badgeClass = "bg-gray-100 text-gray-700";
                    if (typeLower.includes("owner"))
                      badgeClass =
                        "bg-amber-50 text-amber-700 border border-amber-200";
                    else if (typeLower.includes("buyer"))
                      badgeClass =
                        "bg-sky-50 text-sky-700 border border-sky-200";
                    else if (typeLower.includes("tenant"))
                      badgeClass =
                        "bg-emerald-50 text-emerald-700 border border-emerald-200";
                    else if (typeLower.includes("pg"))
                      badgeClass =
                        "bg-purple-50 text-purple-700 border border-purple-200";
                    else if (
                      typeLower.includes("builder") ||
                      typeLower.includes("developer")
                    )
                      badgeClass =
                        "bg-rose-50 text-rose-700 border border-rose-200";

                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedUserForTracking(u);
                          setIsTrackingModalOpen(true);
                        }}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-2 font-mono font-bold text-gray-800 group-hover:text-[#780018]">
                          {u.user_id}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-gray-900">
                          {u.name}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeClass}`}
                          >
                            {u.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-700 font-medium">
                          {u.mobile}
                        </td>
                        <td className="py-2.5 px-2 text-gray-700 font-medium">
                          {u.city}
                        </td>
                        <td className="py-2.5 px-2 text-gray-600">
                          {u.registration_date}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-full text-[10px]">
                            {u.terms || "Accepted"}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-full text-[10px]">
                            {u.status || "Active"}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserForTracking(u);
                              setIsTrackingModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100"
                            title="Open User Tracking Dossier"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Feed: Recent Activities (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                  Recent Activities
                </h2>
                <button
                  onClick={() => navigate("/recent-properties")}
                  className="text-xs font-bold text-[#881337] hover:text-[#780018] flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((act, i) => {
                  let IconComp = Home;
                  let bgCol = "bg-rose-50 text-rose-600";
                  if (act.icon === "user") {
                    IconComp = Users;
                    bgCol = "bg-emerald-50 text-emerald-600";
                  } else if (act.icon === "check") {
                    IconComp = ShieldCheck;
                    bgCol = "bg-amber-50 text-amber-600";
                  } else if (act.icon === "message") {
                    IconComp = MessageSquare;
                    bgCol = "bg-purple-50 text-purple-600";
                  } else if (act.icon === "dollar") {
                    IconComp = DollarSign;
                    bgCol = "bg-amber-50 text-[#B87D1B]";
                  }

                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 pb-2.5 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${bgCol}`}
                        >
                          <IconComp size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 leading-snug truncate">
                            {act.title}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {act.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
                        {act.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 5: CITY EXPANSION | TOP PERFORMING CITIES | USER CONVERSION FUNNEL
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* 1. City Expansion Opportunity (5 cols) */}
          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 tracking-tight m-0 mb-3">
              City Expansion Opportunity
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold text-[10px]">
                    <th className="pb-2 pr-2">City</th>
                    <th className="pb-2 px-1.5 text-center">Owners</th>
                    <th className="pb-2 px-1.5 text-center">Buyers</th>
                    <th className="pb-2 px-1.5 text-center">Tenants</th>
                    <th className="pb-2 px-1.5 text-center">PG Seekers</th>
                    <th className="pb-2 px-1.5 text-center">Total Users</th>
                    <th className="pb-2 px-1.5 text-center">Properties</th>
                    <th className="pb-2 pl-1.5 text-right">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cityExpansion.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70">
                      <td className="py-2.5 pr-2 font-bold text-gray-900">
                        {row.city}
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-gray-600">
                        {row.owners.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-gray-600">
                        {row.buyers.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-gray-600">
                        {row.tenants.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-gray-600">
                        {row.pg.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-bold text-gray-900">
                        {row.total_users.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-semibold text-gray-700">
                        {row.properties.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pl-1.5 text-right">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-full text-[10px]">
                          {row.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Top Performing Cities (Properties) (3 cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <h2 className="text-sm font-black text-gray-900 tracking-tight m-0 mb-3">
              Top Performing Cities (Properties)
            </h2>

            <div className="space-y-3 my-auto">
              {topPerformingCities.map((item, idx) => {
                const maxProps = Math.max(
                  ...topPerformingCities.map((c) => c.properties || 1),
                  1
                );
                const pct = Math.max((item.properties / maxProps) * 100, 12);
                const barColor = idx === 0 ? "#881337" : "#D49B35";

                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <span className="w-16 text-[11px] font-semibold text-gray-700 truncate">
                      {item.city}
                    </span>
                    <div className="flex-1 bg-gray-100 h-3 rounded-r-full overflow-hidden">
                      <div
                        className="h-full rounded-r-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-black text-gray-900 text-xs">
                      {item.properties.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. User Conversion Funnel (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-black text-gray-900 tracking-tight m-0">
                User Conversion Funnel
              </h2>
              <select className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                <option>Last 6 Months</option>
              </select>
            </div>

            <div className="space-y-2.5 my-auto">
              {conversionFunnel.map((item, idx) => {
                const barWidth = Math.min(Math.max(item.percentage, 8), 100);
                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <span className="w-36 text-[11px] font-medium text-gray-700 truncate flex-shrink-0">
                      {item.stage}
                    </span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-r-full overflow-hidden">
                      <div
                        className="h-full rounded-r-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          background:
                            "linear-gradient(90deg, #7A0E2E 0%, #D48C9B 100%)",
                        }}
                      />
                    </div>
                    <div className="w-20 text-right flex items-center justify-end gap-1.5 flex-shrink-0">
                      <span className="font-black text-gray-900 text-xs">
                        {item.count.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 w-8">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
