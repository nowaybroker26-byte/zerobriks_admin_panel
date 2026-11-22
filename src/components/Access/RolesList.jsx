import { EP } from '../../Api/endpoints';
import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  Shield,
  Search,
  Users,
  RefreshCw,
} from "lucide-react";
import { MyContext } from "../../App";
import { normalizeRole } from "../../permissions/permissionConfig";

const RolesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { roles, setRoles, adminStaff, setAdminStaff } = useContext(MyContext);

  const fetchRoles = () => {
    setLoading(true);
    const token = sessionStorage.getItem("token");
    axios
      .get(`${EP.ROLES_LIST}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setRoles(res.data.map(normalizeRole));
      })
      .catch((error) => {
        console.error("Failed to fetch roles:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userCountForRole = (roleId) =>
    (adminStaff || []).filter((s) => s.roleId === roleId).length;

  const handleDelete = async (role) => {
    const count = userCountForRole(role.roleId);
    const confirmed = window.confirm(
      count > 0
        ? `Delete "${role.roleName}"? This will also delete its ${count} assigned user(s) and cannot be undone.`
        : `Delete "${role.roleName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${EP.ROLES_DELETE}${role.roleId}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setRoles((prev) => prev.filter((r) => r.roleId !== role.roleId));
      setAdminStaff((prev) => prev.filter((s) => s.roleId !== role.roleId));
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete role.";
      alert(message);
      console.error("Failed to delete role:", error);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles || [];
    const q = search.toLowerCase();
    return (roles || []).filter(
      (r) =>
        r.roleName?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [roles, search]);

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Main Container Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* ================================================================
            PAGE HEADER (Compact, Sleek, Professional)
        ================================================================= */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-3 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#7A0E2E",
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold text-dark m-0" style={{ letterSpacing: "-0.3px" }}>
                  Roles & Permissions
                </h5>
                <span
                  className="badge rounded-pill fw-semibold"
                  style={{
                    backgroundColor: "rgba(122, 14, 46, 0.08)",
                    color: "#7A0E2E",
                    fontSize: "11px",
                    padding: "3px 8px",
                  }}
                >
                  {(roles || []).length} Total
                </span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: "12.5px" }}>
                Define administrative roles and grant granular module access for your staff.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={fetchRoles}
              disabled={loading}
              className="btn btn-outline-secondary px-3 py-1.5 fw-semibold rounded-2 transition d-inline-flex align-items-center justify-content-center"
              style={{
                borderColor: "#CBD5E1",
                color: "#334155",
                fontSize: "13px",
                height: "36px",
              }}
            >
              <RefreshCw size={14} className={`me-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => navigate(`${prefix}/roles-permissions/add`)}
              className="btn text-white px-3.5 py-1.5 fw-semibold rounded-2 shadow-sm transition d-inline-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#7A0E2E",
                borderColor: "#7A0E2E",
                fontSize: "13px",
                height: "36px",
              }}
            >
              <Plus size={16} className="me-1" />
              Add Role
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="row g-2 align-items-center mb-3">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span
                className="input-group-text bg-white border-end-0 text-muted"
                style={{ borderColor: "#E2E8F0" }}
              >
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                style={{ borderColor: "#E2E8F0", fontSize: "13.5px", height: "36px" }}
                placeholder="Search by role name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-7 d-flex justify-content-md-end align-items-center">
            <span className="text-muted small fw-medium" style={{ fontSize: "12.5px" }}>
              Total Roles: <strong className="text-dark">{(roles || []).length}</strong>
              {search && (
                <span className="text-muted ms-2">
                  (Showing <strong>{filteredRoles.length}</strong> matching)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Roles Table */}
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
                <th style={{ width: "45px" }} className="py-3 px-3 text-center">
                  #
                </th>
                <th style={{ minWidth: "180px" }} className="py-3">
                  Role Name
                </th>
                <th style={{ minWidth: "280px" }} className="py-3">
                  Description
                </th>
                <th style={{ minWidth: "120px" }} className="py-3 text-center">
                  Active Users
                </th>
                <th style={{ width: "120px" }} className="py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      style={{ color: "#7A0E2E" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="text-muted small fw-medium">Loading roles & permissions...</span>
                  </td>
                </tr>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((role, index) => {
                  const assignedCount = userCountForRole(role.roleId);

                  return (
                    <tr
                      key={role.roleId || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {index + 1}
                      </td>

                      {/* Role Name */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold text-dark" style={{ fontSize: "14px" }}>
                            {role.roleName}
                          </span>
                          {role.isSuperAdmin && (
                            <span
                              className="badge rounded-pill px-2 py-0.5 fw-bold text-uppercase"
                              style={{
                                backgroundColor: "rgba(122, 14, 46, 0.1)",
                                color: "#7A0E2E",
                                fontSize: "10px",
                              }}
                            >
                              Super Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 text-muted small">
                        {role.description || "—"}
                      </td>

                      {/* User Count */}
                      <td className="py-3 text-center">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                          style={{
                            backgroundColor:
                              assignedCount > 0
                                ? "rgba(166, 129, 57, 0.12)"
                                : "#F1F5F9",
                            color: assignedCount > 0 ? "#85621e" : "#64748B",
                            fontSize: "11px",
                          }}
                        >
                          <Users size={12} className="me-1" />
                          {assignedCount} {assignedCount === 1 ? "user" : "users"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-center">
                        <div className="d-inline-flex align-items-center gap-1.5">
                          <button
                            onClick={() =>
                              navigate(`${prefix}/roles-permissions/edit/${role.roleId}`)
                            }
                            className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                            style={{ width: "32px", height: "32px" }}
                            title={role.isSuperAdmin ? "View Role" : "Edit Role"}
                          >
                            {role.isSuperAdmin ? <Eye size={15} /> : <Pencil size={14} />}
                          </button>

                          {!role.isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(role)}
                              className="btn btn-sm btn-outline-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderColor: "#FCA5A5",
                                color: "#DC2626",
                                backgroundColor: "#FEF2F2",
                              }}
                              title="Delete Role"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No roles found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesList;
