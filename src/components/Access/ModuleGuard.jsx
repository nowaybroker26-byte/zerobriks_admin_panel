import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MyContext } from "../../App";

// Usage: <ModuleGuard module="myInventory" action="view"><Properties /></ModuleGuard>
// action defaults to "view" — that's what most routes should check.
const ModuleGuard = ({ module, action = "view", children }) => {
  const { can } = useContext(MyContext);

  if (!can(module, action)) {
    return <Navigate to="/no-access" replace />;
  }

  return children;
};

export default ModuleGuard;