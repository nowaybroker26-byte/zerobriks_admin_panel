import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaRupeeSign, FaEdit, FaTrashAlt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

const RecentProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/recently_posted_project`
      );
      if (!response.ok) throw new Error("Failed to fetch projects.");
      const result = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) setProjects(result.data);
      else throw new Error("Invalid data format.");
    } catch (error) {
      console.error("Error fetching projects:", error);
      setErrors("Failed to fetch projects. Please try again later.");
    }
  };

  const formatPrice = (price) => {
    if (!price) return "";
    price = Number(price);
    if (isNaN(price)) return "";

    const formatValue = (value, divisor, unit) => {
      let result = value / divisor;
      result = result % 1 === 0 ? result.toFixed(0) : result.toFixed(1);
      return `₹${result} ${unit}`;
    };

    if (price >= 10000000) return formatValue(price, 10000000, "Cr");
    if (price >= 100000) return formatValue(price, 100000, "L");
    if (price >= 1000) return formatValue(price, 1000, "K");
    return `₹${price}`;
  };

  const getValidImageUrl = (img, type = "cover") => {
    const placeholder = type === "cover" ? "https://placehold.co/400x375" : "https://placehold.co/55x55";
    if (!img || !img.trim()) return placeholder;
    return img.startsWith("http") ? img : `${process.env.REACT_APP_API_BASE_URL}${img}`;
  };

  const handleImageClick = (projectId) => {
    if (projectId) navigate(`/project-details/${projectId}`);
  };

  const handleImageError = (projectId, type, e) => {
    if (!imageErrors[`${projectId}-${type}`]) {
      setImageErrors((prev) => ({ ...prev, [`${projectId}-${type}`]: true }));
      e.target.onerror = null;
      e.target.src = type === "cover" ? "https://placehold.co/400x375" : "https://placehold.co/55x55";
    }
  };

  return (
    <div className="w-full mx-auto container-fluid mt-28">
      {errors && <div className="alert alert-danger">{errors}</div>}

      {/* Breadcrumb */}
      <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
          <li>
            <Link to="/admin" className="font-medium text-blue-600 transition-colors hover:underline">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
              Recent Projects Page
            </span>
          </li>
        </ol>
      </nav>

      <div className="p-2 bg-white border rounded shadow-lg">
        <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
          <FontAwesomeIcon icon={faBuilding} className="mr-2" />
          All Recent Projects
        </h4>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => {
            const imageUrl = getValidImageUrl(project.cover_image, "cover");
            const logoUrl = getValidImageUrl(project.logo || "", "logo");

            // Calculate min-max price from project properties
            let minPrice = null, maxPrice = null;
            if (project.project_properties?.length) {
              const prices = project.project_properties.map((p) => Number(p.price));
              minPrice = Math.min(...prices);
              maxPrice = Math.max(...prices);
            }

            // Format configurations
            let configurations = "No Configurations";
            if (project.congfigurations) {
              configurations = project.congfigurations.includes("BHK")
                ? project.congfigurations
                : project.congfigurations.split(",").map((c) => `${c.trim()} BHK`).join(", ");
            }

            return (
              <div key={project._id} className="max-w-[400px] w-full bg-transparent rounded-3xl">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={project.project_name || "No Project Name Available"}
                    className="w-full h-[375px] object-cover rounded-3xl cursor-pointer"
                    onClick={() => handleImageClick(project._id)}
                    onError={(e) => handleImageError(project._id, "cover", e)}
                  />

                  {/* Logo + Project Name Overlay */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[70%] sm:w-72 h-[100px] bg-gray-800/60 backdrop-blur-md flex flex-col justify-end p-4 rounded-t-3xl">
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-200 w-[55px] h-[55px] rounded-full flex justify-center items-center shadow-lg overflow-hidden">
                      <img
                        src={logoUrl}
                        alt="Project Logo"
                        className="object-cover w-full h-full"
                        onError={(e) => handleImageError(project._id, "logo", e)}
                      />
                    </div>
                    <h3 className="text-center text-white text-lg font-semibold min-h-[24px]">
                      {project.project_name || "No Project Name Available"}
                    </h3>
                  </div>
                </div>

                {/* Description & Price */}
                <div className="px-8">
                  <div className="p-2 text-center bg-white shadow-sm rounded-b-3xl">
                    <p className="text-[17px] text-gray-500 line-clamp-2 min-h-[48px]">
                      {project.project_description?.trim() || "No Project Description Available"}
                    </p>

                    <p className="text-[16px] text-gray-600 mt-1">{configurations}</p>

                    {minPrice !== null && (
                      <h4 className="flex items-center justify-center mt-2 text-xl font-bold text-purple-600">
                        {minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                      </h4>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentProjects;
