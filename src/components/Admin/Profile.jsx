import React, { useState, useEffect } from "react";
import { EP } from '../../Api/endpoints';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2,
  BadgeCheck,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [initialProfile, setInitialProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("user_type") || "Super Admin";

  useEffect(() => {
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${EP?.API_PROFILE || `${process.env.REACT_APP_API_BASE_URL}/api/profile/`}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      if (res.data) {
        setProfile(res.data);
        setInitialProfile(res.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data
        ? typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : JSON.stringify(err.response.data)
        : err.message;
      setError("Failed to fetch profile details: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.put(
        `${EP?.API_PROFILE || `${process.env.REACT_APP_API_BASE_URL}/api/profile/`}`,
        profile,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setProfile(res.data);
      setInitialProfile(res.data);
      setSuccess("Your profile has been updated successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorMessage = err.response?.data
        ? typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : JSON.stringify(err.response.data)
        : err.message;
      setError("Error updating profile: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.trim()?.charAt(0) || "";
    const last = profile.last_name?.trim()?.charAt(0) || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    return (profile.username?.charAt(0) || "A").toUpperCase();
  };

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Administrator";

  return (
    <div className="w-full min-h-screen bg-gray-50/60 pb-20 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link
              to="/admin"
              className="hover:text-[#7A0E2E] transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Admin Profile</span>
          </nav>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#7A0E2E]/10 flex items-center justify-center text-[#7A0E2E] shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Admin Profile
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your administrative credentials, contact details, and account settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/change-password"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#7A0E2E] bg-[#7A0E2E]/10 hover:bg-[#7A0E2E]/15 border border-[#7A0E2E]/20 rounded-xl transition-all shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Change Password
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm font-medium">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm font-medium">{success}</div>
            <button
              onClick={() => setSuccess(null)}
              className="text-emerald-400 hover:text-emerald-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Layout */}
        {loading ? (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-16 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#7A0E2E] animate-spin" />
            <p className="text-sm font-medium text-gray-500">
              Loading profile information...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Summary & Avatar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#7A0E2E] to-[#A3163E] text-white flex items-center justify-center text-3xl font-extrabold shadow-md border-2 border-white ring-4 ring-[#7A0E2E]/10">
                    {getInitials()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow">
                    <BadgeCheck className="w-5 h-5 text-[#7A0E2E]" />
                  </div>
                </div>

                {/* Identity */}
                <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full mt-1 border border-gray-200">
                  @{profile.username || "admin"}
                </span>

                <div className="w-full border-t border-gray-100 my-5"></div>

                {/* Account Details */}
                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      Role
                    </span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {userType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      Email
                    </span>
                    <span className="font-medium text-gray-700 truncate max-w-[170px]" title={profile.email}>
                      {profile.email || "Not set"}
                    </span>
                  </div>
                </div>

                <div className="w-full border-t border-gray-100 my-5"></div>

                {/* Quick Security Link */}
                <Link
                  to="/change-password"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
                >
                  <KeyRound className="w-4 h-4 text-[#7A0E2E]" />
                  Update Password
                </Link>
              </div>
            </div>

            {/* Right Card: Edit Form */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Personal Information
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update your account names, email contact, and identity.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    Administrator
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username (Fixed / Identity) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Username <span className="text-gray-400 font-normal">(System Handle)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={profile.username}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl text-sm font-medium cursor-not-allowed outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Username cannot be changed as it identifies your administrator account.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        required
                        placeholder="admin@zerobriks.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Names Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSaving}
                      className="px-4 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#7A0E2E] hover:bg-[#600b24] rounded-xl transition-all shadow-sm active:scale-95 ${
                        isSaving ? "opacity-75 cursor-wait" : ""
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
