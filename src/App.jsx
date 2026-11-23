import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";


// Admin
import Dashboard from "./components/Admin/Dashboard";
import LoginForm from "./components/Admin/LoginForm";
import Profile from "./components/Admin/Profile";
import ChangePasswordForm from "./components/Admin/ChangePasswordForm";
import Settings from "./components/Admin/Settings";
import GeneralSetting from "./components/Admin/GeneralSetting";
import DynamicPricing from "./components/Admin/DynamicPricing";
import TimeSlot from "./components/Admin/TimeSlot";
import AllSchedules from "./components/Admin/AllSchedules";
import MySchedules from "./components/Admin/MySchedules";

// Legals
import AboutUsForm from "./components/Legals/AboutUsForm";
import PrivacyForm from "./components/Legals/PrivacyForm";
import TermsForm from "./components/Legals/TermsForm";
import FaqForm from "./components/Legals/FaqForm";

// Properties admin
import Properties from "./components/AdminProperties/Properties";
import Projects from "./components/AdminProperties/Projects";
import AddProperty from "./components/AdminProperties/AddProperty";
import AddProject from "./components/AdminProperties/AddProject";
import UpdateProperty from "./components/AdminProperties/UpdateProperty";
import UpdateProject from "./components/AdminProperties/UpdateProject";
import CustomerReviews from "./components/AdminProperties/CustomerReviews";
import PropertyImages from "./components/AdminProperties/PropertyImages";
import Amenities from "./components/AdminProperties/Amenities";
import AddAmenity from "./components/AdminProperties/AddAmenity";

// Properties customers
import PropertyCategoriesUsers from "./components/CustomerProperties/PropertyCategoriesUsers";
import PropertiesAddedBy from "./components/CustomerProperties/PropertiesAddedBy";
import CategoryUsersList from "./components/CustomerProperties/CategoryUsersList";
import PropertyDetails from "./components/CustomerProperties/PropertyDetail";
import ProjectDetail from "./components/CustomerProperties/ProjectDetail";
import RecentProperties from "./components/CustomerProperties/RecentProperties";
import RecentProjects from "./components/CustomerProperties/RecentProjects";

// Customers
import CustomerList from "./components/Customers/CustomerList";
import DeveloperList from "./components/Customers/DeveloperList";
import Offers from "./components/Customers/Offers";

// Enquiries
import InquiriesList from "./components/Enquiry/InquiriesList";
import FeedbackList from "./components/Enquiry/FeedbackList";

// Notification for customers
import NotificationForm from "./components/Notifications/NotificationForm";
import NotificationList from "./components/Notifications/NotificationList";

// Plans Purchase and History
import PlansPurchase from "./components/PlansPurchase/PlansPurchase";
import AddPlan from "./components/PlansPurchase/AddPlan";
import UpdatePlan from "./components/PlansPurchase/UpdatePlan";
import PlansPurchaseHistory from "./components/PlansPurchase/PlansPurchaseHistory";

// Access / Roles & Permissions
import ModuleGuard from "./components/Access/ModuleGuard";
import NoAccess from "./components/Access/NoAccess";
import RolesList from "./components/Access/RolesList";
import AddEditRole from "./components/Access/AddEditRole";
import AdminStaffList from "./components/Access/AdminStaffList";
import AddAdminStaff from "./components/Access/AddAdminStaff";
import HeroSliderManager from "./components/Sliders/HeroSliderManager";

import Sidebar from "./components/Sidebar";
// Permission configuration
import {
  DEFAULT_ROLES,
  DEFAULT_ADMIN_STAFF,
  buildCan,
  getRoleFromSession,
} from "./permissions/permissionConfig";


/*
|--------------------------------------------------------------------------
| Context
|--------------------------------------------------------------------------
*/

export const MyContext = createContext();


/*
|--------------------------------------------------------------------------
| App Component
|--------------------------------------------------------------------------
*/

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token")
  );

  /*
  |--------------------------------------------------------------------------
  | Role / Permission State
  |--------------------------------------------------------------------------
  */

  const [currentRole, setCurrentRole] = useState(getRoleFromSession());

  const [roles, setRoles] = useState(() => {
    const saved = sessionStorage.getItem("mockRoles");
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const [adminStaff, setAdminStaff] = useState(() => {
    const saved = sessionStorage.getItem("mockAdminStaff");
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_STAFF;
  });

  const [dashboardDateRange, setDashboardDateRange] = useState(() => {
    const saved = sessionStorage.getItem("dashboardDateRange");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.preset &&
          parsed.preset !== "this_month" &&
          parsed.preset !== "last_6_months"
        ) {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      startDate: "",
      endDate: "",
      label: "All Time (Overall Data)",
      preset: "all_time",
    };
  });

  useEffect(() => {
    sessionStorage.setItem("dashboardDateRange", JSON.stringify(dashboardDateRange));
  }, [dashboardDateRange]);

  /*
|--------------------------------------------------------------------------
| Permission Helper
|--------------------------------------------------------------------------
*/

  const can = buildCan(currentRole);

  /*
|--------------------------------------------------------------------------
| Sidebar Toggle
|--------------------------------------------------------------------------
*/

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  /*
|--------------------------------------------------------------------------
| Authentication / Session Storage Listener
|--------------------------------------------------------------------------
*/

  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem("token");

      setIsAuthenticated(!!token);

      setCurrentRole(getRoleFromSession());
    };

    // Check immediately on mount
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /*
|--------------------------------------------------------------------------
| Persist Roles
|--------------------------------------------------------------------------
*/

  useEffect(() => {
    sessionStorage.setItem("mockRoles", JSON.stringify(roles));
  }, [roles]);

  /*
|--------------------------------------------------------------------------
| Persist Admin Staff
|--------------------------------------------------------------------------
*/

  useEffect(() => {
    sessionStorage.setItem("mockAdminStaff", JSON.stringify(adminStaff));
  }, [adminStaff]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "" || p === "/" || !p.startsWith("/admin")) {
        const target = "/admin" + (p === "/" ? "" : p) + window.location.search + window.location.hash;
        window.location.replace(target);
      }
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | App
  |--------------------------------------------------------------------------
  */

  return (
    <BrowserRouter basename="/admin">

      <MyContext.Provider
        value={{
          // Authentication
          isAuthenticated,
          setIsAuthenticated,

          // Sidebar
          isSidebarOpen,
          setIsSidebarOpen,
          toggleSidebar,

          // Role
          currentRole,
          setCurrentRole,

          // Permissions
          can,

          // Roles
          roles,
          setRoles,

          // Admin Staff
          adminStaff,
          setAdminStaff,

          // Dashboard Date Range Filter
          dashboardDateRange,
          setDashboardDateRange,
        }}
      >

        <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full relative">

          <ConditionalContent />

        </div>

      </MyContext.Provider>

    </BrowserRouter>
  );
};


/*
|--------------------------------------------------------------------------
| Conditional Content
|--------------------------------------------------------------------------
*/

const ConditionalContent = () => {

  const location = useLocation();


  /*
  |--------------------------------------------------------------------------
  | Context
  |--------------------------------------------------------------------------
  */

  const {
    isAuthenticated,
    isSidebarOpen,
    toggleSidebar,
    currentRole,
  } = useContext(MyContext);


  /*
  |--------------------------------------------------------------------------
  | Login Page
  |--------------------------------------------------------------------------
  */

  if (location.pathname === "/" || location.pathname === "") {

    return (
      <div className="container-fluid w-100 p-0 m-0">

        <Routes>

          <Route
            path="/"
            element={<LoginForm />}
          />

          <Route
            path="*"
            element={<LoginForm />}
          />

        </Routes>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Authentication Check
  |--------------------------------------------------------------------------
  */

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Super Admin Only Guard
  |--------------------------------------------------------------------------
  */

  const isAdminOnly = (element) => {

    return currentRole?.isSuperAdmin
      ? element
      : <NoAccess />;

  };


  /*
  |--------------------------------------------------------------------------
  | Authenticated Layout
  |--------------------------------------------------------------------------
  */

  return (
    <>

      {/* Sidebar & Navbar */}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />


      {/* Main Content Area */}

      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-60" : "md:ml-20"
        } pt-16 min-h-screen w-auto`}
      >

        <Routes>


        {/* ================================================================
            ADMIN
        ================================================================= */}

        <Route
          path="/admin"
          element={
            <ModuleGuard module="admin">
              <Dashboard />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/admin"
          element={
            <ModuleGuard module="admin">
              <Dashboard />
            </ModuleGuard>
          }
        />

        {/* Hero Sliders / Mobile Banners / Advertising */}
        <Route
          path="/hero-sliders"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />
        <Route
          path="/sliders"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />
        <Route
          path="/advertising"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />
        <Route
          path="/advertisement"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/advertising"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/hero-sliders"
          element={
            <ModuleGuard module="offers">
              <HeroSliderManager />
            </ModuleGuard>
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />
        <Route
          path="/admin/profile"
          element={<Profile />}
        />

        <Route
          path="/change-password"
          element={<ChangePasswordForm />}
        />
        <Route
          path="/admin/change-password"
          element={<ChangePasswordForm />}
        />

        <Route
          path="/admin-settings"
          element={
            <ModuleGuard module="setting">
              <Settings />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/admin-settings"
          element={
            <ModuleGuard module="setting">
              <Settings />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/admin/admin-settings"
          element={
            <ModuleGuard module="setting">
              <Settings />
            </ModuleGuard>
          }
        />

        <Route
          path="/admin-settings/general-setting"
          element={<GeneralSetting />}
        />
        <Route
          path="/admin/admin-settings/general-setting"
          element={<GeneralSetting />}
        />
        <Route
          path="/admin/admin/admin-settings/general-setting"
          element={<GeneralSetting />}
        />

        {/* Description */}

        {/* 
        <Route
          path="/admin-settings/descriptions"
          element={<Description />}
        />
        */}

        <Route
          path="/admin-settings/dynamic-price"
          element={<DynamicPricing />}
        />
        <Route
          path="/admin/admin-settings/dynamic-price"
          element={<DynamicPricing />}
        />
        <Route
          path="/admin/admin/admin-settings/dynamic-price"
          element={<DynamicPricing />}
        />

        <Route
          path="/admin-settings/time-slot"
          element={<TimeSlot />}
        />
        <Route
          path="/admin/admin-settings/time-slot"
          element={<TimeSlot />}
        />
        <Route
          path="/admin/admin/admin-settings/time-slot"
          element={<TimeSlot />}
        />


        {/* ================================================================
            LEGALS
        ================================================================= */}

        <Route
          path="/about-us"
          element={
            <ModuleGuard module="legal">
              <AboutUsForm />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/about-us"
          element={
            <ModuleGuard module="legal">
              <AboutUsForm />
            </ModuleGuard>
          }
        />

        <Route
          path="/privacy"
          element={
            <ModuleGuard module="legal">
              <PrivacyForm />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/privacy"
          element={
            <ModuleGuard module="legal">
              <PrivacyForm />
            </ModuleGuard>
          }
        />

        <Route
          path="/terms"
          element={
            <ModuleGuard module="legal">
              <TermsForm />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/terms"
          element={
            <ModuleGuard module="legal">
              <TermsForm />
            </ModuleGuard>
          }
        />

        <Route
          path="/faq"
          element={
            <ModuleGuard module="legal">
              <FaqForm />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/faq"
          element={
            <ModuleGuard module="legal">
              <FaqForm />
            </ModuleGuard>
          }
        />


        {/* ================================================================
            CUSTOMERS
        ================================================================= */}

        <Route
          path="/customers"
          element={
            <ModuleGuard module="users">
              <CustomerList />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ModuleGuard module="users">
              <CustomerList />
            </ModuleGuard>
          }
        />

        <Route
          path="/developers"
          element={<DeveloperList />}
        />
        <Route
          path="/admin/developers"
          element={<DeveloperList />}
        />

        <Route
          path="/offers"
          element={
            <ModuleGuard module="offers">
              <Offers />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <ModuleGuard module="offers">
              <Offers />
            </ModuleGuard>
          }
        />


        {/* ================================================================
            VIRTUAL TOURS
        ================================================================= */}

        <Route
          path="/virtual-tour-all"
          element={
            <ModuleGuard module="virtualTour">
              <AllSchedules />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/virtual-tour-all"
          element={
            <ModuleGuard module="virtualTour">
              <AllSchedules />
            </ModuleGuard>
          }
        />

        <Route
          path="/virtual-tour-my"
          element={<MySchedules />}
        />
        <Route
          path="/admin/virtual-tour-my"
          element={<MySchedules />}
        />


        {/* ================================================================
            CUSTOMER PROPERTIES
        ================================================================= */}

        <Route
          path="/recent-properties"
          element={<RecentProperties />}
        />

        <Route
          path="/properties-added-by"
          element={<PropertyCategoriesUsers />}
        />

        <Route
          path="/user-type/:user"
          element={<CategoryUsersList />}
        />
        <Route
          path="/admin/user-type/:user"
          element={<CategoryUsersList />}
        />

        <Route
          path="/properties/:user_id"
          element={<PropertiesAddedBy />}
        />

        <Route
          path="/property-details/:id"
          element={<PropertyDetails />}
        />
        <Route
          path="/admin/property-details/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/project-details/:id"
          element={<ProjectDetail />}
        />
        <Route
          path="/admin/project-details/:id"
          element={<ProjectDetail />}
        />

        <Route
          path="/recent-project"
          element={<RecentProjects />}
        />


        {/* ================================================================
            ADMIN PROPERTIES
        ================================================================= */}

        <Route
          path="/properties"
          element={
            <ModuleGuard module="myInventory">
              <Properties />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <ModuleGuard module="myInventory">
              <Properties />
            </ModuleGuard>
          }
        />

        <Route
          path="/projects"
          element={
            <ModuleGuard module="projects">
              <Projects />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ModuleGuard module="projects">
              <Projects />
            </ModuleGuard>
          }
        />

        <Route
          path="/add-property"
          element={
            <ModuleGuard
              module="myInventory"
              action="add"
            >
              <AddProperty
                isSidebarOpen={isSidebarOpen}
              />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/add-property"
          element={
            <ModuleGuard
              module="myInventory"
              action="add"
            >
              <AddProperty
                isSidebarOpen={isSidebarOpen}
              />
            </ModuleGuard>
          }
        />

        <Route
          path="/update-property/:id"
          element={
            <ModuleGuard
              module="myInventory"
              action="edit"
            >
              <UpdateProperty />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/update-property/:id"
          element={
            <ModuleGuard
              module="myInventory"
              action="edit"
            >
              <UpdateProperty />
            </ModuleGuard>
          }
        />

        <Route
          path="/add-project"
          element={
            <ModuleGuard
              module="projects"
              action="add"
            >
              <AddProject />
            </ModuleGuard>
          }
        />

        <Route
          path="/update-project/:id"
          element={
            <ModuleGuard
              module="projects"
              action="edit"
            >
              <UpdateProject />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/update-project/:id"
          element={
            <ModuleGuard
              module="projects"
              action="edit"
            >
              <UpdateProject />
            </ModuleGuard>
          }
        />

        <Route
          path="/amenities"
          element={<Amenities />}
        />
        <Route
          path="/admin/amenities"
          element={<Amenities />}
        />

        <Route
          path="/add-amenity"
          element={<AddAmenity />}
        />
        <Route
          path="/admin/add-amenity"
          element={<AddAmenity />}
        />

        <Route
          path="/property-images/:propertyId"
          element={<PropertyImages />}
        />

        <Route
          path="/activities"
          element={<CustomerReviews />}
        />


        {/* ================================================================
            NOTIFICATIONS
        ================================================================= */}

        <Route
          path="/notification"
          element={
            <ModuleGuard
              module="notifications"
              action="add"
            >
              <NotificationForm />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/notification"
          element={
            <ModuleGuard
              module="notifications"
              action="add"
            >
              <NotificationForm />
            </ModuleGuard>
          }
        />

        <Route
          path="/notificationsList"
          element={
            <ModuleGuard module="notifications">
              <NotificationList />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/notificationsList"
          element={
            <ModuleGuard module="notifications">
              <NotificationList />
            </ModuleGuard>
          }
        />


        {/* ================================================================
            ENQUIRIES
        ================================================================= */}

        <Route
          path="/inquiry"
          element={
            <ModuleGuard module="inquiries">
              <InquiriesList />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/inquiry"
          element={
            <ModuleGuard module="inquiries">
              <InquiriesList />
            </ModuleGuard>
          }
        />

        <Route
          path="/feedbacks"
          element={
            <ModuleGuard module="feedback">
              <FeedbackList />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/feedbacks"
          element={
            <ModuleGuard module="feedback">
              <FeedbackList />
            </ModuleGuard>
          }
        />


        {/* ================================================================
            PLANS PURCHASE
        ================================================================= */}

        <Route
          path="/plans-purchase"
          element={
            <ModuleGuard module="plans">
              <PlansPurchase />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/plans-purchase"
          element={
            <ModuleGuard module="plans">
              <PlansPurchase />
            </ModuleGuard>
          }
        />

        <Route
          path="/add-plan"
          element={
            <ModuleGuard
              module="plans"
              action="add"
            >
              <AddPlan />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/add-plan"
          element={
            <ModuleGuard
              module="plans"
              action="add"
            >
              <AddPlan />
            </ModuleGuard>
          }
        />

        <Route
          path="/update-plan/:plan_id"
          element={
            <ModuleGuard
              module="plans"
              action="edit"
            >
              <UpdatePlan />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/update-plan/:plan_id"
          element={
            <ModuleGuard
              module="plans"
              action="edit"
            >
              <UpdatePlan />
            </ModuleGuard>
          }
        />

        <Route
          path="/plans-purchase-history"
          element={
            <ModuleGuard module="planHistory">
              <PlansPurchaseHistory />
            </ModuleGuard>
          }
        />
        <Route
          path="/admin/plans-purchase-history"
          element={
            <ModuleGuard module="planHistory">
              <PlansPurchaseHistory />
            </ModuleGuard>
          }
        />


        {/* ================================================================
            ROLES & PERMISSIONS
            SUPER ADMIN ONLY
        ================================================================= */}

        <Route
          path="/roles-permissions"
          element={isAdminOnly(<RolesList />)}
        />
        <Route
          path="/admin/roles-permissions"
          element={isAdminOnly(<RolesList />)}
        />

        <Route
          path="/roles-permissions/add"
          element={isAdminOnly(<AddEditRole />)}
        />
        <Route
          path="/admin/roles-permissions/add"
          element={isAdminOnly(<AddEditRole />)}
        />

        <Route
          path="/roles-permissions/edit/:roleId"
          element={isAdminOnly(<AddEditRole />)}
        />
        <Route
          path="/admin/roles-permissions/edit/:roleId"
          element={isAdminOnly(<AddEditRole />)}
        />


        {/* ================================================================
            ADMIN STAFF
            SUPER ADMIN ONLY
        ================================================================= */}

        <Route
          path="/admin-staff"
          element={isAdminOnly(<AdminStaffList />)}
        />
        <Route
          path="/admin/admin-staff"
          element={isAdminOnly(<AdminStaffList />)}
        />

        <Route
          path="/admin-staff/add"
          element={isAdminOnly(<AddAdminStaff />)}
        />
        <Route
          path="/admin/admin-staff/add"
          element={isAdminOnly(<AddAdminStaff />)}
        />

        <Route
          path="/admin-staff/edit/:staffId"
          element={isAdminOnly(<AddAdminStaff />)}
        />
        <Route
          path="/admin/admin-staff/edit/:staffId"
          element={isAdminOnly(<AddAdminStaff />)}
        />


        {/* ================================================================
            NO ACCESS
        ================================================================= */}

        <Route
          path="/no-access"
          element={<NoAccess />}
        />


        {/* ================================================================
            FALLBACK
        ================================================================= */}

        <Route
          path="*"
          element={<Navigate to="/admin" replace />}
        />

        </Routes>

      </main>

    </>
  );
};


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default App;
