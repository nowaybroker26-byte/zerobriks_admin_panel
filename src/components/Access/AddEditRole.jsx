import { EP } from '../../Api/endpoints';
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Shield, ArrowLeft, Save } from "lucide-react";
import { MyContext } from "../../App";
import {
  MODULE_SCHEMA,
  buildEmptyPermissions,
  normalizeRole,
} from "../../permissions/permissionConfig";

const ACTIONS = ["view", "add", "edit", "delete", "approve"];

const AddEditRole = () => {
  const { roles, setRoles } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";
  const backPath = `${prefix}/roles-permissions`;

  const { roleId } = useParams();
  const editingRole = roleId ? (roles || []).find((r) => r.roleId === roleId) : null;

  const [roleName, setRoleName] = useState(editingRole?.roleName || "");
  const [description, setDescription] = useState(
    editingRole?.description || ""
  );
  const [permissions, setPermissions] = useState(
    editingRole?.permissions || buildEmptyPermissions()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch roles if editing on page reload
  useEffect(() => {
    if (roleId && !editingRole) {
      const token = sessionStorage.getItem("token");
      if (token) {
        axios
          .get(`${EP.ROLES_LIST}`, {
            headers: { Authorization: `Token ${token}` },
          })
          .then((res) => {
            if (Array.isArray(res.data) && setRoles) {
              const list = res.data.map(normalizeRole);
              setRoles(list);
              const found = list.find((r) => r.roleId === roleId);
              if (found) {
                setRoleName(found.roleName || "");
                setDescription(found.description || "");
                setPermissions(found.permissions || buildEmptyPermissions());
              }
            }
          })
          .catch((err) => console.error("Failed to fetch roles in AddEditRole:", err));
      }
    }
  }, [roleId, editingRole, setRoles]);

  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.roleName || "");
      setDescription(editingRole.description || "");
      setPermissions(editingRole.permissions || buildEmptyPermissions());
    }
  }, [editingRole]);

  const isReadOnly = editingRole?.isSuperAdmin;

  const toggle = (moduleKey, action) => {
    if (isReadOnly) return;
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: !prev[moduleKey]?.[action] },
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!roleName.trim()) {
      setError("Role name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingRole
        ? `${EP.ROLES_UPDATE}${roleId}`
        : `${EP.ROLES_CREATE}`;

      const method = editingRole ? axios.put : axios.post;
      const token = sessionStorage.getItem("token");

      await method(
        url,
        {
          role_name: roleName,
          description,
          permissions,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      navigate(backPath);
    } catch (err) {
      console.error("Failed to save role:", err);
      setError(err.response?.data?.error || "Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-3 shadow-sm">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to={backPath}
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <ArrowLeft size={14} className="me-1" />
                Back to Roles List
              </Link>
              <span className="text-muted small">•</span>
              <span
                className="badge rounded-pill px-2.5 py-0.5 fw-bold text-uppercase"
                style={{
                  backgroundColor: "rgba(122, 14, 46, 0.08)",
                  color: "#7A0E2E",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                Privilege Matrix
              </span>
            </div>
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(122, 14, 46, 0.1)",
                  color: "#7A0E2E",
                }}
              >
                <Shield size={18} />
              </span>
              {editingRole
                ? isReadOnly
                  ? `View Role: ${editingRole.roleName}`
                  : `Edit Role: ${editingRole.roleName}`
                : "Create New Role"}
            </h3>
            <p className="text-muted small mb-0">
              Configure granular access privileges across dashboard modules and administrative actions.
            </p>
          </div>

          <div className="mt-3 mt-md-0 d-flex gap-2">
            <Link
              to={backPath}
              className="btn btn-outline-secondary px-3.5 py-2 rounded-pill fw-semibold shadow-xs"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              Cancel
            </Link>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
                style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
              >
                <Save size={15} className={`me-1.5 ${saving ? "animate-spin" : ""}`} />
                {saving ? "Saving Role..." : "Save Role"}
              </button>
            )}
          </div>
        </div>

        {/* Role Information Form */}
        <div className="p-3.5 rounded-3 border bg-light mb-4" style={{ borderColor: "#E2E8F0" }}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                Role Name <span className="text-danger">*</span>
              </label>
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Property Manager, Support Specialist"
                className="form-control rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
                placeholder="Brief summary of duties and responsibilities"
                className="form-control rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
              />
            </div>
          </div>
        </div>

        {/* Permissions Table Matrix */}
        <div className="mb-2">
          <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>
            Module Permission Matrix
          </h5>
          <p className="text-muted small mb-3">
            Check the appropriate actions this role is authorized to perform within each module.
          </p>

          <div className="table-responsive rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
            <table className="table table-hover align-middle mb-0">
              <thead
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottom: "2px solid #E2E8F0",
                }}
              >
                <tr
                  className="text-muted small text-uppercase fw-bold"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  <th style={{ minWidth: "200px" }} className="py-3 px-3">
                    Module
                  </th>
                  {ACTIONS.map((a) => (
                    <th key={a} style={{ minWidth: "90px" }} className="py-3 text-center text-capitalize">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULE_SCHEMA.map((mod) => (
                  <tr
                    key={mod.key}
                    className="transition"
                    style={{ borderBottom: "1px solid #F1F5F9" }}
                  >
                    <td className="py-3 px-3">
                      <span className="fw-semibold text-dark d-block">
                        {mod.label}
                      </span>
                    </td>
                    {ACTIONS.map((action) =>
                      mod.actions.includes(action) ? (
                        <td key={action} className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!permissions[mod.key]?.[action]}
                            onChange={() => toggle(mod.key, action)}
                            disabled={isReadOnly}
                            className="form-check-input shadow-none cursor-pointer"
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#7A0E2E",
                              cursor: isReadOnly ? "not-allowed" : "pointer",
                            }}
                          />
                        </td>
                      ) : (
                        <td key={action} className="py-3 text-center text-muted opacity-25">
                          —
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer save bar */}
        {!isReadOnly && (
          <div className="d-flex justify-content-end gap-2 pt-3 mt-4 border-top">
            <Link
              to={backPath}
              className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold shadow-xs"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <Save size={15} className={`me-1.5 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving Role..." : "Save Role"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEditRole;
