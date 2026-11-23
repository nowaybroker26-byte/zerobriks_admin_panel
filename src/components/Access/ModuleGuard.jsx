import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MyContext } from "../../App";
import {
  firstAccessibleModule,
  MODULE_ROUTES,
} from "../../permissions/permissionConfig";

// Usage: <ModuleGuard module="myInventory" action="view"><Properties /></ModuleGuard>
// action defaults to "view" — that's what most routes should check.
const ModuleGuard = ({ module, action = "view", children }) => {
  const { can, currentRole } = useContext(MyContext) || {};

  const allowed = typeof can === "function" ? can(module, action) : true;

  if (!allowed) {
    if (module === "admin") {
      const firstMod = firstAccessibleModule(currentRole);
      if (firstMod && MODULE_ROUTES[firstMod] && firstMod !== "admin") {
        return <Navigate to={MODULE_ROUTES[firstMod]} replace />;
      }
    }
    return <Navigate to="/no-access" replace />;
  }

  return children;
};

export default ModuleGuard;