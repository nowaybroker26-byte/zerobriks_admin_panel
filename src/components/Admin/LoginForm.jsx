import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import zerobriksLogo from "../../assets/zerobriks_logo.png";
import { MyContext } from "../../App";
import {
  DEFAULT_ROLES,
  saveRoleToSession,
  normalizeRole,
  saveAllowedCitiesToSession,
} from "../../permissions/permissionConfig";

const BRAND = {
  royalMaroon: "#7A0E2E",
  darkRed: "#52091D",
  royalGold: "#D4AF37",
  charcoal: "#1F1F1F",
};

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsAuthenticated, setCurrentRole } = useContext(MyContext);

  const handleLogin = async (userVal, passVal) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/login/`,
        { username: userVal, password: passVal }
      );

      sessionStorage.setItem("token", response.data.token);

      if (response.data.role) {
        const normalized = normalizeRole(response.data.role);
        saveRoleToSession(normalized);
        setCurrentRole(normalized);
      } else {
        const superAdminRole = DEFAULT_ROLES.find((r) => r.isSuperAdmin);
        saveRoleToSession(superAdminRole);
        setCurrentRole(superAdminRole);
      }

      saveAllowedCitiesToSession(response.data.allowed_cities);
      setIsAuthenticated(true);

      setTimeout(() => {
        navigate("/admin");
      }, 100);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || "Invalid username or password. Please try again.");
      } else if (err.request) {
        setError("Unable to connect to backend server. You can also use Demo Login below.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Allows immediate local evaluation of the admin dashboard
    const superAdminRole = DEFAULT_ROLES.find((r) => r.isSuperAdmin);
    sessionStorage.setItem("token", "zerobriks_demo_admin_token");
    saveRoleToSession(superAdminRole);
    setCurrentRole(superAdminRole);
    setIsAuthenticated(true);
    setTimeout(() => {
      navigate("/admin");
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    handleLogin(username, password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[#2D0510] via-[#1F1F1F] to-[#140307]">
      {/* Background Decorative Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#7A0E2E]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:28px_28px] opacity-5 pointer-events-none" />

      {/* Main Luxury Login Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/40 z-10 transition-all duration-300">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-sm border border-gray-100 mb-3">
            <img
              src={zerobriksLogo}
              alt="Zerobriks"
              className="h-12 max-w-[200px] object-contain mx-auto"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
            Admin Portal
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sign in to manage analytics, listings, and operations
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <span className="font-bold text-sm leading-none">•</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="username">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7A0E2E]/25 focus:border-[#7A0E2E] transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-11 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7A0E2E]/25 focus:border-[#7A0E2E] transition-all text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-[#7A0E2E] focus:ring-[#7A0E2E]"
              />
              <span>Remember this session</span>
            </label>
            <span className="text-gray-400">Secure 256-bit SSL</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: `linear-gradient(135deg, ${BRAND.royalMaroon} 0%, ${BRAND.darkRed} 100%)`,
            }}
            className="w-full py-3 px-4 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Login Quick Access Option */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">Local Development / Quick Access</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 text-xs font-semibold text-[#7A0E2E] bg-[#7A0E2E]/8 hover:bg-[#7A0E2E]/15 rounded-xl border border-[#7A0E2E]/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span>Instant Demo Access (Super Admin)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-3xs text-gray-400">
          ZEROBRIKS Real Estate Technologies • All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
