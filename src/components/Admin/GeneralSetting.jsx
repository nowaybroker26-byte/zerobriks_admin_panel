import { EP } from '../../Api/endpoints';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faCog,
  faMapMarkerAlt,
  faInfoCircle,
  faEnvelope,
  faArrowLeft,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faSlidersH,
  faBuilding,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faFacebook,
  faYoutube,
  faInstagram,
  faTwitter,
  faAppStore,
} from "@fortawesome/free-brands-svg-icons";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { MyContext } from "../../App";

const libraries = ["places"];

const GeneralSetting = () => {
  const { currentRole } = useContext(MyContext) || {};
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const backPath = isAdminPath ? "/admin/admin-settings" : "/admin-settings";

  const [formData, setFormData] = useState({
    setting_id: "",
    free_view_count: "",
    free_post_count: "",
    free_project_view_count: "",
    free_project_post_count: "",
    contact: "",
    emaild_id: "",
    address: "",
    latitude: "",
    longitude: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
    about_houzza: "",
    playstore: "",
    appstore: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const autocompleteRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCY4i1-nQFNVTSYetMw7aofzBRwGvCH_Ms",
    libraries,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(
          `${EP.CUST_API_GET_SETTING}`
        );
        if (response.data.status === 1 && response.data.data?.length > 0) {
          const setting = response.data.data[0];
          setFormData({
            setting_id: setting._id || "",
            free_view_count: setting.free_view_count ?? "",
            free_post_count: setting.free_post_count ?? "",
            free_project_view_count: setting.free_project_view_count ?? "",
            free_project_post_count: setting.free_project_post_count ?? "",
            contact: setting.contact ?? "",
            emaild_id: setting.emaild_id ?? "",
            address: setting.address ?? "",
            latitude: setting.latitude ?? "",
            longitude: setting.longitude ?? "",
            facebook: setting.facebook ?? "",
            instagram: setting.instagram ?? "",
            twitter: setting.twitter ?? "",
            youtube: setting.youtube ?? "",
            linkedin: setting.linkedin ?? "",
            about_houzza: setting.about_houzza ?? "",
            playstore: setting.playstore ?? "",
            appstore: setting.appstore ?? "",
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to fetch current settings from server.");
      }
    };

    fetchSettings();
  }, []);

  const handlePlaceSelect = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || "";
      const lat = place.geometry?.location?.lat() || "";
      const lng = place.geometry?.location?.lng() || "";

      setFormData((prevData) => ({
        ...prevData,
        address,
        latitude: lat,
        longitude: lng,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setSaving(true);

    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key] ?? "");
      });

      await axios.post(
        `${EP.CUST_API_ADD_SETTING}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Platform settings updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("There was an error updating the settings!");
    } finally {
      setSaving(false);
    }
  };

  const canSave = currentRole?.isSuperAdmin ?? true;

  return (
    <div className="container-fluid pt-3 px-4 pb-5" style={{ minHeight: "100vh" }}>
      {/* Alert Messages */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div className="flex-grow-1">{error}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <div className="flex-grow-1">{success}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
            aria-label="Close"
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
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Back to Settings Hub
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
                Core Configuration
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
                <FontAwesomeIcon icon={faSlidersH} />
              </span>
              General Platform Settings
            </h3>
            <p className="text-muted small mb-0">
              Manage free customer allowances, official contact channels, and social media links.
            </p>
          </div>

          <div className="mt-3 mt-md-0">
            {canSave && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
                style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
              >
                <FontAwesomeIcon icon={faSave} className={`me-2 ${saving ? "fa-spin" : ""}`} />
                {saving ? "Saving Changes..." : "Save Settings"}
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Group 1: Free Allowances */}
          <div className="mb-4 p-3.5 rounded-3 border bg-light" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
              <span
                className="badge rounded-pill me-2"
                style={{ backgroundColor: "rgba(166, 129, 57, 0.15)", color: "#85621e" }}
              >
                Limits
              </span>
              Free Customer Quotas & View Allowances
            </h5>
            <p className="text-muted small mb-3">
              Standard quota allocated to free users before subscription plan upgrade is required.
            </p>

            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <label htmlFor="free_view_count" className="form-label small fw-semibold text-dark">
                  Free Contacts View
                </label>
                <input
                  id="free_view_count"
                  type="number"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.free_view_count}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label htmlFor="free_post_count" className="form-label small fw-semibold text-dark">
                  Free Properties Post
                </label>
                <input
                  id="free_post_count"
                  type="number"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.free_post_count}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label htmlFor="free_project_view_count" className="form-label small fw-semibold text-dark">
                  Free Project Contacts View
                </label>
                <input
                  id="free_project_view_count"
                  type="number"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.free_project_view_count}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label htmlFor="free_project_post_count" className="form-label small fw-semibold text-dark">
                  Free Project Posts
                </label>
                <input
                  id="free_project_post_count"
                  type="number"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.free_project_post_count}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Group 2: Contact & Address */}
          <div className="mb-4 p-3.5 rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
              <span
                className="badge rounded-pill me-2"
                style={{ backgroundColor: "rgba(122, 14, 46, 0.1)", color: "#7A0E2E" }}
              >
                Channels
              </span>
              Official Contact & Location Details
            </h5>
            <p className="text-muted small mb-3">
              Displayed in app footers, customer invoices, and support pages.
            </p>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="contact" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faPhone} className="me-1.5 text-muted" /> Official Phone Number
                </label>
                <input
                  id="contact"
                  type="text"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="emaild_id" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faEnvelope} className="me-1.5 text-muted" /> Official Support Email
                </label>
                <input
                  id="emaild_id"
                  type="email"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.emaild_id}
                  onChange={handleChange}
                  placeholder="support@zerobriks.com"
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="address" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1.5 text-muted" /> Head Office Address
                </label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceSelect}
                  >
                    <input
                      id="address"
                      className="form-control rounded-3 shadow-none"
                      style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Search and select registered address..."
                      required
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="address"
                    className="form-control rounded-3 shadow-none"
                    style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                )}
                <input type="hidden" name="latitude" value={formData.latitude} />
                <input type="hidden" name="longitude" value={formData.longitude} />
              </div>

              <div className="col-12">
                <label htmlFor="about_houzza" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-1.5 text-muted" /> About Platform Overview
                </label>
                <textarea
                  id="about_houzza"
                  rows="3"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px", lineHeight: "1.5" }}
                  value={formData.about_houzza}
                  onChange={handleChange}
                  placeholder="Summary text describing the platform and its mission..."
                />
              </div>
            </div>
          </div>

          {/* Group 3: Social Profiles & App Links */}
          <div className="mb-4 p-3.5 rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
              <span
                className="badge rounded-pill me-2"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.08)", color: "#1d4ed8" }}
              >
                External
              </span>
              Social Profiles & Mobile App Store Links
            </h5>
            <p className="text-muted small mb-3">
              Links mapped to buttons across public pages and mobile app downloads.
            </p>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="linkedin" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faLinkedin} className="me-1.5 text-primary" /> LinkedIn URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="facebook" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faFacebook} className="me-1.5 text-primary" /> Facebook URL
                </label>
                <input
                  id="facebook"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="youtube" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faYoutube} className="me-1.5 text-danger" /> YouTube URL
                </label>
                <input
                  id="youtube"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="instagram" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faInstagram} className="me-1.5 text-danger" /> Instagram URL
                </label>
                <input
                  id="instagram"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="twitter" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faTwitter} className="me-1.5 text-info" /> Twitter / X URL
                </label>
                <input
                  id="twitter"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="playstore" className="form-label small fw-semibold text-dark d-flex align-items-center">
                  <IoLogoGooglePlaystore className="me-1.5 text-success" /> Google Play Store URL
                </label>
                <input
                  id="playstore"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.playstore}
                  onChange={handleChange}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="appstore" className="form-label small fw-semibold text-dark">
                  <FontAwesomeIcon icon={faAppStore} className="me-1.5 text-dark" /> Apple App Store URL
                </label>
                <input
                  id="appstore"
                  type="url"
                  className="form-control rounded-3 shadow-none"
                  style={{ borderColor: "#CBD5E1", fontSize: "13px" }}
                  value={formData.appstore}
                  onChange={handleChange}
                  placeholder="https://apps.apple.com/app/..."
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          {canSave && (
            <div className="d-flex justify-content-end gap-2 pt-2">
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
                <FontAwesomeIcon icon={faSave} className={`me-2 ${saving ? "fa-spin" : ""}`} />
                {saving ? "Saving Changes..." : "Save Settings"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default GeneralSetting;
