import { EP } from '../../Api/endpoints';
import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Pencil,
  Plus,
  Trash2,
  Users,
  Search,
  ArrowLeft,
  Mail,
  Shield,
  RefreshCw,
} from "lucide-react";
import { MyContext } from "../../App";
import { normalizeStaff } from "../../permissions/permissionConfig";

const AdminStaffList = () => {
  const { adminStaff, setAdminStaff, roles } = useContext(MyContext);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";

  const fetchAdminStaff = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${EP.ADMIN_STAFF_LIST}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setAdminStaff(response.data.map(normalizeStaff));
    } catch (error) {
      console.error("Failed to fetch admin staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStaff();
  }, [setAdminStaff]);

  const roleName = (roleId) =>
    (roles || []).find((r) => r.roleId === roleId)?.roleName || "Unassigned";

  const handleDelete = async (staff) => {
    const confirmed = window.confirm(
      `Delete staff account for ${staff.name || staff.email}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${EP.ADMIN_STAFF_DELETE}${staff.staffId}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setAdminStaff((prev) => prev.filter((s) => s.staffId !== staff.staffId));
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete staff member.";
      alert(message);
      console.error("Failed to delete admin staff:", error);
    }
  };

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return adminStaff || [];
    const q = search.toLowerCase();
    return (adminStaff || []).filter((staff) => {
      const role = roleName(staff.roleId).toLowerCase();
      return (
        staff.name?.toLowerCase().includes(q) ||
        staff.email?.toLowerCase().includes(q) ||
        role.includes(q)
      );
    });
  }, [adminStaff, search, roles]);

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Main Container Card */}
      <div className="bg-white rounded-4 shadow-sm border p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link
                to="/dashboard"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <ArrowLeft size={14} className="me-1" />
                Back to Dashboard
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
                Team Access
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
                <Users size={18} />
              </span>
              Admin Staff Management
            </h3>
            <p className="text-muted small mb-0">
              Manage internal administrative accounts, credentials, and role assignments.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchAdminStaff}
              disabled={loading}
              className="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-pill shadow-xs transition d-inline-flex align-items-center"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              <RefreshCw size={14} className={`me-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => navigate(`${prefix}/admin-staff/add`)}
              className="btn text-white px-3.5 py-2 fw-semibold rounded-pill shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <Plus size={16} className="me-1" />
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="row g-3 align-items-center mb-4">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span
                className="input-group-text bg-white border-end-0 text-muted"
                style={{ borderColor: "#E2E8F0" }}
              >
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                style={{ borderColor: "#E2E8F0", fontSize: "14px" }}
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-7 d-flex justify-content-md-end">
            <span className="text-muted small fw-semibold">
              Total Staff: <strong className="text-dark">{(adminStaff || []).length}</strong>
              {search && (
                <span className="text-muted ms-2">
                  (Showing <strong>{filteredStaff.length}</strong> matching)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Staff Table */}
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
                <th style={{ minWidth: "200px" }} className="py-3">
                  Staff Member
                </th>
                <th style={{ minWidth: "220px" }} className="py-3">
                  Email Address
                </th>
                <th style={{ minWidth: "160px" }} className="py-3">
                  Assigned Role
                </th>
                <th style={{ width: "120px" }} className="py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => {
                  const currentRoleTitle = roleName(staff.roleId);

                  return (
                    <tr
                      key={staff.staffId || index}
                      className="transition"
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td className="px-3 text-center text-muted fw-semibold small">
                        {index + 1}
                      </td>

                      {/* Staff Member */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2.5 text-white fw-bold flex-shrink-0"
                            style={{
                              width: "34px",
                              height: "34px",
                              backgroundColor: "#7A0E2E",
                              fontSize: "13px",
                            }}
                          >
                            {(staff.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">
                              {staff.name || "Unnamed Staff"}
                            </span>
                            {staff.phone && (
                              <span className="text-muted small" style={{ fontSize: "11px" }}>
                                {staff.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3">
                        <a
                          href={`mailto:${staff.email}`}
                          className="text-muted small text-decoration-none d-inline-flex align-items-center hover-underline"
                        >
                          <Mail size={13} className="me-1.5 text-muted" />
                          {staff.email}
                        </a>
                      </td>

                      {/* Role */}
                      <td className="py-3">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center"
                          style={{
                            backgroundColor: "rgba(166, 129, 57, 0.12)",
                            color: "#85621e",
                            border: "1px solid rgba(166, 129, 57, 0.25)",
                            fontSize: "11px",
                          }}
                        >
                          <Shield size={11} className="me-1" />
                          {currentRoleTitle}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-center">
                        <div className="d-inline-flex align-items-center gap-1.5">
                          <button
                            onClick={() =>
                              navigate(`${prefix}/admin-staff/edit/${staff.staffId}`)
                            }
                            className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                            style={{ width: "32px", height: "32px" }}
                            title="Edit Staff Member"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(staff)}
                            className="btn btn-sm btn-outline-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition shadow-xs"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderColor: "#FCA5A5",
                              color: "#DC2626",
                              backgroundColor: "#FEF2F2",
                            }}
                            title="Delete Staff Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No admin staff members found matching your search.
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

export default AdminStaffList;
