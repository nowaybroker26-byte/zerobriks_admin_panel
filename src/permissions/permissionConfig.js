// src/permissions/permissionConfig.js

// Which actions exist per module. Anything not listed here is a "–" —
// permanently not applicable, not just unchecked.
export const MODULE_SCHEMA = [
  { key: "admin",         label: "Admin",         actions: ["view", "add", "approve"] },
  { key: "myInventory",   label: "My Inventory",  actions: ["view", "add", "edit", "delete", "approve"] },
  { key: "projects",      label: "Projects",      actions: ["view", "add", "edit", "delete", "approve"] },
  { key: "users",         label: "Users",         actions: ["view", "approve"] },
  { key: "notifications", label: "Notifications", actions: ["view", "add"] },
  { key: "plans",         label: "Plans",         actions: ["view", "add", "edit", "delete"] },
  { key: "inquiries",     label: "Inquiries",     actions: ["view", "approve"] },
  { key: "virtualTour",   label: "Virtual Tour",  actions: ["view"] },
  { key: "feedback",      label: "Feedback",      actions: ["view"] },
  { key: "offers",        label: "Offers",        actions: ["view", "approve"] },
  { key: "planHistory",   label: "Plan History",  actions: ["view"] },
  { key: "setting",       label: "Setting",       actions: ["view"] },
  { key: "legal",         label: "Legal",         actions: ["view"] },
];

const ALL_ACTIONS = ["view", "add", "edit", "delete", "approve"];

// Builds a fully-granted permissions object for a module list — used for Super Admin
// and as a starting point for "check every box" style role creation.
export function buildFullPermissions() {
  const perms = {};
  MODULE_SCHEMA.forEach((mod) => {
    perms[mod.key] = {};
    mod.actions.forEach((action) => {
      perms[mod.key][action] = true;
    });
  });
  return perms;
}

// Builds an empty (all-false) permissions object — starting point for a brand new role.
export function buildEmptyPermissions() {
  const perms = {};
  MODULE_SCHEMA.forEach((mod) => {
    perms[mod.key] = {};
    mod.actions.forEach((action) => {
      perms[mod.key][action] = false;
    });
  });
  return perms;
}

// ---- Mock data (frontend-only, stands in for the backend until Phase 2) ----

export const DEFAULT_ROLES = [
  {
    roleId: "role_super_admin",
    roleName: "Super Admin",
    description: "Full access to all modules and settings",
    isSuperAdmin: true,
    permissions: buildFullPermissions(),
  },

  {
    roleId: "role_admin",
    roleName: "Admin",
    description: "Can manage all business data",
    isSuperAdmin: false,
    permissions: {
      admin:         { view: true, add: true, approve: true },
      myInventory:   { view: true, add: true, edit: true, delete: true, approve: true },
      projects:      { view: true, add: true, edit: true, delete: true, approve: true },
      users:         { view: true, approve: true },
      notifications: { view: true, add: true },
      plans:         { view: true, add: true, edit: true, delete: true },
      inquiries:     { view: true, approve: true },
      virtualTour:   { view: true },
      feedback:      { view: true },
      offers:        { view: true, approve: true },
      planHistory:   { view: true },
      setting:       { view: true },
      legal:         { view: true },
    },
  },

  {
    roleId: "role_manager",
    roleName: "Manager",
    description: "Can work with data but cannot delete",
    isSuperAdmin: false,
    permissions: {
      admin:         { view: true, add: false, approve: true },
      myInventory:   { view: true, add: true, edit: true, delete: false, approve: true },
      projects:      { view: true, add: true, edit: true, delete: false, approve: true },
      users:         { view: true, approve: false },
      notifications: { view: true, add: false },
      plans:         { view: true, add: true, edit: true, delete: false },
      inquiries:     { view: true, approve: true },
      virtualTour:   { view: true },
      feedback:      { view: true },
      offers:        { view: true, approve: false },
      planHistory:   { view: false },
      setting:       { view: false },
      legal:         { view: false },
    },
  },
  {
    roleId: "role_viewer",
    roleName: "Viewer",
    description: "Read-only access to data and reports",
    isSuperAdmin: false,
    permissions: buildEmptyPermissions(), // View gets turned on below
  },
];

// Viewer = every "view" true, everything else false
// DEFAULT_ROLES[2].permissions = (() => {
  DEFAULT_ROLES[3].permissions = (() => {
  const perms = buildEmptyPermissions();
  MODULE_SCHEMA.forEach((mod) => {
    perms[mod.key].view = true;
  });
  return perms;
})();

export const DEFAULT_ADMIN_STAFF = [
  {
    staffId: "staff_001",
    name: "Existing Admin",           // <-- rename to your real logged-in admin's name
    email: "admin@nowaybroker.com",   // <-- rename to your real logged-in admin's email
    roleId: "role_super_admin",
  },
];

// ---- Core permission check ----
// Returns a `can(module, action)` function bound to one specific role object.
export function buildCan(role) {
  return function can(moduleKey, action) {
    if (!role) return false;
    if (role.isSuperAdmin) return true; // hardcoded bypass, never touches the matrix
    const modulePerms = role.permissions?.[moduleKey];
    if (!modulePerms) return false;
    return !!modulePerms[action];
  };
}

// Does this role have View on at least one module? Used for the "No Access" fallback.
export function hasAnyViewAccess(role) {
  if (!role) return false;
  if (role.isSuperAdmin) return true;
  return MODULE_SCHEMA.some((mod) => role.permissions?.[mod.key]?.view);
}

// First module (in sidebar order) this role can actually view — used to redirect
// somewhere real instead of always assuming "/admin" is accessible.
export function firstAccessibleModule(role) {
  if (!role) return null;
  if (role.isSuperAdmin) return MODULE_SCHEMA[0].key;
  const found = MODULE_SCHEMA.find((mod) => role.permissions?.[mod.key]?.view);
  return found ? found.key : null;
}

// Route path each module resolves to, for the redirect above and for ProtectRout-style checks.
export const MODULE_ROUTES = {
  admin: "/admin",
  myInventory: "/properties",
  projects: "/projects",
  users: "/customers",
  notifications: "/notificationsList",
  plans: "/plans-purchase",
  inquiries: "/inquiry",
  virtualTour: "/virtual-tour-all",
  feedback: "/feedbacks",
  offers: "/offers",
  planHistory: "/plans-purchase-history",
  setting: "/admin-settings",
  legal: "/about-us",
};

// ---- sessionStorage helpers (mock "login response" persistence) ----
const ROLE_STORAGE_KEY = "currentRole";
const ALLOWED_CITIES_STORAGE_KEY = "allowedCities";

export function saveRoleToSession(role) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(role));
}

export function getRoleFromSession() {
  const raw = sessionStorage.getItem(ROLE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearRoleFromSession() {
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
}

export function saveAllowedCitiesToSession(cities) {
  sessionStorage.setItem(ALLOWED_CITIES_STORAGE_KEY, JSON.stringify(cities || []));
}

// Returns [] for "unrestricted" (matches the backend's empty-list convention),
// so callers can do `allowedCities.length > 0` to decide whether to filter.
export function getAllowedCitiesFromSession() {
  const raw = sessionStorage.getItem(ALLOWED_CITIES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAllowedCitiesFromSession() {
  sessionStorage.removeItem(ALLOWED_CITIES_STORAGE_KEY);
}

export function normalizeRole(apiRole) {
  if (!apiRole) return null;
  return {
    roleId: apiRole.id,
    roleName: apiRole.role_name,
    description: apiRole.description,
    isSuperAdmin: apiRole.is_super_admin,
    permissions: apiRole.permissions,
  };
}

export function normalizeStaff(apiStaff) {
  return {
    staffId: apiStaff.id,
    name: apiStaff.name,
    email: apiStaff.email,
    roleId: apiStaff.role_id,
    roleName: apiStaff.role_name,
  };
}