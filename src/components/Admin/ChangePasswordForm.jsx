import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/change-password/`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSuccess(response.data.detail || "Password changed successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An error occurred while updating your password. Please verify your old password.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReLogin = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/60 pb-20 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
            <Link
              to="/profile"
              className="hover:text-[#7A0E2E] transition-colors"
            >
              Profile
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Change Password</span>
          </nav>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#7A0E2E]/10 flex items-center justify-center text-[#7A0E2E] shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Change Password
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Ensure your administrative account remains protected with a strong password.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm font-medium">{error}</div>
            <button
              onClick={() => setError("")}
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
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#7A0E2E]/20 focus:border-[#7A0E2E] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/profile")}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#7A0E2E] hover:bg-[#600b24] rounded-xl transition-all shadow-sm active:scale-95 ${
                  isSubmitting ? "opacity-75 cursor-wait" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Password Changed Successfully
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Your administrative credentials have been updated. Please log in again with your new password to maintain account security.
            </p>
            <button
              onClick={handleConfirmReLogin}
              className="w-full py-2.5 px-4 bg-[#7A0E2E] hover:bg-[#600b24] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Log In Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordForm;
