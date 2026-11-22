import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useContext } from "react";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import TextEditor from "./TextEditor";
import { stateToHTML } from "draft-js-export-html";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faArrowLeft,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { MyContext } from "../../App";

const AboutUsForm = () => {
  const { currentRole } = useContext(MyContext) || {};
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const prefix = isAdminPath ? "/admin" : "";

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [aboutId, setAboutId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchContent = () => {
    setLoading(true);
    fetch(`${EP.CUST_API_GET_ABOUT_US}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1 && data.data?.length > 0) {
          const aboutData = data.data[0];
          setAboutId(aboutData._id);

          if (aboutData.content) {
            const blocksFromHTML = convertFromHTML(aboutData.content);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setEditorState(EditorState.createWithContent(contentState));
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching About Us content:", err);
        setError("Failed to fetch About Us content.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setError("");

    const contentState = editorState.getCurrentContent();
    const htmlContent = stateToHTML(contentState);

    const payload = {
      content: htmlContent,
      about_id: aboutId,
    };

    fetch(`${EP.API_ADD_ABOUT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1) {
          setSuccessMessage("About Us content updated successfully!");
          fetchContent();
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setError("Failed to update About Us.");
        }
      })
      .catch((err) => {
        console.error("Error updating About Us:", err);
        setError("Failed to update About Us.");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const canSave = currentRole?.isSuperAdmin ?? true;

  const legalNavTabs = [
    { label: "About Us", path: `${prefix}/about-us`, active: true },
    { label: "Privacy Policy", path: `${prefix}/privacy`, active: false },
    { label: "Terms & Conditions", path: `${prefix}/terms`, active: false },
    { label: "FAQs", path: `${prefix}/faq`, active: false },
  ];

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
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm rounded-3 mb-3 d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <div className="flex-grow-1">{successMessage}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
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
                to="/dashboard"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
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
                Legal & Compliance
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
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
              About Us Management
            </h3>
            <p className="text-muted small mb-0">
              Draft and publish the platform introduction, mission statement, and corporate profile.
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
                {saving ? "Saving Changes..." : "Save Content"}
              </button>
            )}
          </div>
        </div>

        {/* Legal Navigation Tabs */}
        <div className="d-flex flex-wrap gap-1.5 mb-4 p-1 rounded-pill border bg-light w-fit" style={{ borderColor: "#E2E8F0" }}>
          {legalNavTabs.map((tab, idx) => (
            <Link
              key={idx}
              to={tab.path}
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition ${
                tab.active ? "text-white shadow-xs" : "text-muted border-0"
              }`}
              style={{
                backgroundColor: tab.active ? "#7A0E2E" : "transparent",
                fontSize: "12px",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Rich Text Editor */}
        <div className="p-3 rounded-3 border bg-white" style={{ borderColor: "#E2E8F0" }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status" style={{ color: "#7A0E2E" }}>
                <span className="visually-hidden">Loading content...</span>
              </div>
              <p className="text-muted small mt-2">Loading editor content...</p>
            </div>
          ) : (
            <TextEditor
              editorState={editorState}
              onEditorStateChange={setEditorState}
            />
          )}
        </div>

        {/* Footer save bar */}
        {canSave && (
          <div className="d-flex justify-content-end gap-2 pt-3 mt-3 border-top">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm transition d-inline-flex align-items-center"
              style={{ backgroundColor: "#7A0E2E", borderColor: "#7A0E2E" }}
            >
              <FontAwesomeIcon icon={faSave} className={`me-2 ${saving ? "fa-spin" : ""}`} />
              {saving ? "Saving Changes..." : "Save Content"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsForm;
