import { EP } from '../../Api/endpoints';
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { UserPlus, ArrowLeft, Save, MapPin, Shield, Mail, Phone, Lock, User } from "lucide-react";
import { MyContext } from "../../App";

const AddAdminStaff = () => {
  const { roles, adminStaff, setAdminStaff } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";
  const backPath = `${prefix}/admin-staff`;

  const { staffId } = useParams();
  const editing = staffId
    ? (adminStaff || []).find((s) => s.staffId === staffId)
    : null;

  const [name, setName] = useState(editing?.name || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(editing?.roleId || "");
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState(
    editing?.allowedCities || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setEmail(editing.email || "");
      setPhone(editing.phone || "");
      setRoleId(editing.roleId || "");
      setSelectedCities(editing.allowedCities || []);
    }
  }, [editing]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    axios
      .get(`${EP.API_CITIES}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCities(res.data);
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          setCities(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch cities:", err));
  }, []);

  const toggleCity = (cityName) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName]
    );
  };

  const handleSelectAllCities = () => {
    if (selectedCities.length === cities.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities(cities.map((c) => c.city_name));
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!roleId) {
      setError("Please select an assigned role.");
      return;
    }
    if (!editing && !password) {
      setError("Password is required for new accounts.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      if (editing) {
        await axios.put(
          `${EP.ADMIN_STAFF_UPDATE}${staffId}`,
          {
            name,
            email,
            phone,
            role_id: roleId,
            allowed_cities: selectedCities,
          },
          { headers: { Authorization: `Token ${token}` } }
        );
      } else {
        await axios.post(
          `${EP.ADMIN_STAFF_CREATE}`,
          {
            name,
            email,
            password,
            phone,
            role_id: roleId,
            allowed_cities: selectedCities,
          },
          { headers: { Authorization: `Token ${token}` } }
        );
      }

      navigate(backPath);
    } catch (err) {
      console.error("Admin staff save error:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save staff member account."
      );
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
                Back to Staff List
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
                Account Credentials
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
                <UserPlus size={18} />
              </span>
              {editing ? `Edit Staff: ${editing.name || editing.email}` : "Add Staff Member"}
            </h3>
            <p className="text-muted small mb-0">
              Set staff identification, credentials, role authorization, and city jurisdiction.
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

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <Save size={15} className={`me-1.5 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving..." : editing ? "Update Account" : "Create Account"}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <User size={13} className="me-1 text-muted" /> Full Name <span className="text-danger">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="form-control rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <Mail size={13} className="me-1 text-muted" /> Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@zerobriks.com"
                className="form-control rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <Phone size={13} className="me-1 text-muted" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="form-control rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <Shield size={13} className="me-1 text-muted" /> Assigned Role <span className="text-danger">*</span>
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="form-select rounded-3 shadow-none"
                style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
                required
              >
                <option value="">Select an authorization role...</option>
                {(roles || []).map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            {!editing && (
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark mb-1">
                  <Lock size={13} className="me-1 text-muted" /> Initial Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial login password"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "14px" }}
                  required
                />
              </div>
            )}
          </div>

          {/* City Scope Section */}
          <div className="p-3.5 rounded-3 border bg-light mb-4" style={{ borderColor: "#E2E8F0" }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
              <div>
                <label className="form-label small fw-bold text-dark mb-0 d-flex align-items-center">
                  <MapPin size={14} className="me-1.5 text-danger" /> City Jurisdiction Access
                </label>
                <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: "12px" }}>
                  Restrict this user's view to listings within specific cities. Leave all unselected to grant unrestricted pan-city access.
                </p>
              </div>

              {cities.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllCities}
                  className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                  style={{ color: "#7A0E2E", fontSize: "12px" }}
                >
                  {selectedCities.length === cities.length ? "Deselect All" : "Select All Cities"}
                </button>
              )}
            </div>

            {cities.length === 0 ? (
              <span className="text-muted small fst-italic">Loading available cities...</span>
            ) : (
              <div className="row g-2 mt-1">
                {cities.map((c) => {
                  const isChecked = selectedCities.includes(c.city_name);
                  return (
                    <div key={c._id || c.city_name} className="col-6 col-md-4 col-lg-3">
                      <label
                        className="p-2 px-2.5 rounded-2 border d-flex align-items-center gap-2 cursor-pointer transition w-100 mb-0"
                        style={{
                          backgroundColor: isChecked ? "rgba(122, 14, 46, 0.06)" : "#FFFFFF",
                          borderColor: isChecked ? "#7A0E2E" : "#E2E8F0",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCity(c.city_name)}
                          className="form-check-input mt-0 shadow-none"
                          style={{ accentColor: "#7A0E2E" }}
                        />
                        <span className={`text-truncate ${isChecked ? "fw-bold text-dark" : "text-muted"}`}>
                          {c.city_name}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer save bar */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Link
              to={backPath}
              className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold shadow-xs"
              style={{ borderColor: "#CBD5E1", color: "#334155" }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <Save size={15} className={`me-1.5 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving..." : editing ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminStaff;
