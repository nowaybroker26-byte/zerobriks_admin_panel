import React, { useState, useContext } from "react";
import { FaEdit, FaTrashAlt, FaMapMarkerAlt, FaCopy } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";
import { MyContext } from "../../App";

const ProjectCard = ({ project, onDelete }) => {
  const { can } = useContext(MyContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const getValidImageUrl = (img) => {
    if (typeof img !== "string" || !img.trim()) return null;
    return img.startsWith("http") ? img : `${BASE_URL}/${img.replace(/^\/+/, "")}`;
  };

  const projectId = project._id || project.id || "";
  const imageUrl =
    getValidImageUrl(project.cover_image) ||
    "https://via.placeholder.com/400x205?text=Zerobriks+Project";
  const logoUrl =
    getValidImageUrl(project.logo) ||
    "https://via.placeholder.com/55";

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (projectId) {
      navigator.clipboard.writeText(String(projectId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "";
    const num = Number(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatAverageProjectPrice = (price) => {
    if (!price) return null;

    if (typeof price === "string" && price.includes("-")) {
      const parts = price.split("-").map((p) => p.trim());
      return `${formatPrice(parts[0])} - ${formatPrice(parts[1])}`;
    }

    const num = Number(price);
    if (isNaN(num)) return price.toString();
    return formatPrice(num);
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation();
    if (projectId) {
      navigate(`/update-project/${projectId}`);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (projectId) {
      if (window.confirm("Are you sure you want to delete this development project?")) {
        onDelete(projectId);
      }
    }
  };

  // Compute price range from project_properties if average_project_price is not provided
  let displayPrice = null;
  if (project.average_project_price) {
    displayPrice = formatAverageProjectPrice(project.average_project_price);
  } else if (project.project_properties && project.project_properties.length > 0) {
    const prices = project.project_properties
      .map((p) => Number(p.price))
      .filter((p) => !isNaN(p) && p > 0);
    if (prices.length > 0) {
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      displayPrice = minP === maxP ? formatPrice(minP) : `${formatPrice(minP)} - ${formatPrice(maxP)}`;
    }
  }

  const configurationsText = project.congfigurations
    ? project.congfigurations.includes("BHK")
      ? project.congfigurations
      : project.congfigurations
          .split(",")
          .map((c) => `${c.trim()} BHK`)
          .join(", ")
    : null;

  return (
    <div className="card h-100 border rounded-4 shadow-sm overflow-hidden d-flex flex-column hover-shadow transition-all bg-white">
      {/* Top Cover Image Box */}
      <div
        className="position-relative overflow-hidden cursor-pointer"
        style={{ height: "205px", backgroundColor: "#F1F5F9" }}
        onClick={() => projectId && navigate(`/project-details/${projectId}`)}
      >
        <img
          src={imageUrl}
          alt={project.project_name || "Development Project"}
          className="w-100 h-100 object-cover"
          style={{ height: "205px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x205?text=Zerobriks+Project";
          }}
        />

        {/* Project Tag */}
        <span
          className="position-absolute top-0 start-0 m-2 px-2.5 py-1 rounded-pill text-white fw-semibold"
          style={{
            fontSize: "11px",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          {project.project_type || "Project"}
        </span>

        {/* Action Buttons (Edit / Delete) */}
        <div className="position-absolute top-0 end-0 m-2 d-flex gap-1.5">
          {(can("projects", "edit") || can("myInventory", "edit")) && (
            <button
              onClick={handleUpdateClick}
              className="btn btn-sm btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", color: "#2563EB" }}
              title="Edit Project"
            >
              <FaEdit size={14} />
            </button>
          )}
          {(can("projects", "delete") || can("myInventory", "delete")) && (
            <button
              onClick={handleDeleteClick}
              className="btn btn-sm btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", color: "#DC2626" }}
              title="Delete Project"
            >
              <FaTrashAlt size={13} />
            </button>
          )}
        </div>

        {/* Project Logo Overlay */}
        {project.logo && (
          <div
            className="position-absolute bottom-0 start-0 m-2 rounded-circle bg-white border shadow-sm p-1 d-flex align-items-center justify-content-center overflow-hidden"
            style={{ width: "42px", height: "42px" }}
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="w-100 h-100 object-contain"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body p-3.5 d-flex flex-column flex-grow-1">
        {/* Pricing */}
        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <div className="h5 fw-bolder mb-0" style={{ color: "#7A0E2E" }}>
            {displayPrice || "Price on Request"}
          </div>

          {configurationsText && (
            <span
              className="badge bg-light text-secondary border px-2 py-1 rounded-2"
              style={{ fontSize: "11px" }}
            >
              {configurationsText}
            </span>
          )}
        </div>

        {/* Project Name */}
        <h6 className="fw-bold text-dark mb-1 text-truncate" title={project.project_name}>
          <Link
            to={`/project-details/${project._id}`}
            className="text-dark text-decoration-none"
            style={{ transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.target.style.color = "#7A0E2E")}
            onMouseLeave={(e) => (e.target.style.color = "")}
          >
            {project.project_name || "Unnamed Development"}
          </Link>
        </h6>

        {/* Location / Area */}
        <p className="text-muted small mb-3 text-truncate d-flex align-items-center">
          <FaMapMarkerAlt className="text-danger me-1 flex-shrink-0" style={{ fontSize: "12px", color: "#7A0E2E" }} />
          <span>{project.address_area || project.address || "Location not specified"}</span>
        </p>

        {/* Description Snippet if present */}
        {project.project_description && (
          <p
            className="text-secondary small mb-3 text-truncate-2"
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.project_description}
          </p>
        )}

        {/* Footer Row */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
          <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: "11px" }}>
            <BsBuilding size={13} className="text-secondary" />
            <span>{project.project_properties?.length || 0} Units Listed</span>
          </div>

          {/* Copy ID Button */}
          <button
            onClick={handleCopyId}
            className="btn btn-sm btn-light border px-2 py-1 rounded-2 d-flex align-items-center gap-1 text-muted"
            style={{ fontSize: "11px" }}
            title="Copy Project ID"
          >
            <span>ID</span>
            {copied ? (
              <span className="text-success fw-bold">✓</span>
            ) : (
              <FaCopy size={10} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
