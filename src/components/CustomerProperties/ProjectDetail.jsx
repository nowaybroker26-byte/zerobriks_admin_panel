// import React, { useState, useRef, useEffect } from "react";
import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { MdDateRange } from "react-icons/md";
import { BiShapeSquare } from "react-icons/bi";
import { PiCricketThin } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ContactDetails from "../AdminProperties/ContactDetails";
import { Link } from "react-router-dom";

// import { MyContext } from "../../context/MyContext";
import { MyContext } from "../../App";

const ProjectDetail = () => {

  const { can } = useContext(MyContext);

  const sliderRef = useRef(null);
  const navigate = useNavigate();


  const { id } = useParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [displayedAmenities, setDisplayedAmenities] = useState([]);

  const [selectedBHK, setSelectedBHK] = useState("2");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // For image popup (if needed)
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [projectDetails, setProjectDetails] = useState({});
  const [userDetails, setuserDetails] = useState([]);

  //for schedule virtula tour


  const [images, setImages] = useState([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const userId = "67f0ff69d7908f15767d3e64";

 
    const formatAverageProjectPrice = (price) => {
      if (!price) return "";
  
      // If it's a range (contains "-"), split and format both
      if (typeof price === "string" && price.includes("-")) {
        const parts = price.split("-").map((p) => p.trim());
        return (
          <>
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center">
                <FaRupeeSign className="inline-block mr-1" />
                {formatPrice(p)}
                {idx === 0 && " - "}
              </span>
            ))}
          </>
        );
      }
  
      // Normal number formatting
      price = parseInt(price);
      if (isNaN(price)) return "";
  
      let formatted;
      if (price >= 10000000) {
        formatted = parseFloat((price / 10000000).toFixed(1)) + " Cr";
      } else if (price >= 100000) {
        formatted = parseFloat((price / 100000).toFixed(1)) + " L";
      } else if (price >= 1000) {
        formatted = parseFloat((price / 1000).toFixed(1)) + " K";
      } else {
        formatted = price.toString();
      }
  
      return (
        <span className="inline-flex items-center">
          <FaRupeeSign className="inline-block mr-1" />
          {formatted}
        </span>
      );
    };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch Project Data
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_project_details`,
        { project_id: id, user_id: userId },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = response.data;

      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        });
      };

      if (result && result.data) {
        const overviewData = {
          project_size:
            result.data?.project_details?.total_project_size || "N/A",
          launch_date: formatDate(result.data?.project_details?.launch_date),
          avg_price:
            result.data?.project_details?.average_project_price || "N/A",
          possession_starts: formatDate(
            result.data?.project_details?.possession_start
          ),
          construction_status:
            result.data?.project_details?.construction_status || "N/A",
          rera_id: result.data?.project_details?.rera_id || "N/A",
        };

        if (result.data.project_details) {
          setProjectDetails(result.data.project_details);
        }

        if (result.data.project_images) {
          setImages(result.data.project_images);
        } else {
          setImages([]);
        }

        const pd = result.data.project_details;
        setLatitude(pd.latitude);
        setLongitude(pd.longitude);

        const finishingData = {
          Floors: [
            ["Living/Dining", pd.floor_living_dining],
            ["Kitchen and Toilets", pd.floor_kitchen_toilet],
            ["Bedroom", pd.floor_bedroom],
            ["Balcony", pd.floor_balcony],
          ],
          Walls: [
            ["Living/Dining", pd.walls_living_dining],
            ["Kitchen and Toilets", pd.walls_kitchen_toilet],
            ["Servant Room", pd.walls_servant_room],
          ],
          Ceilings: [
            ["General", pd.ceiling],
            ["Servant Room", pd.ceilings_servant_room],
          ],
          Counters: [["Kitchen and Toilets", pd.counters_kitchen_toilet]],
          "Fittings/Fixtures": [
            ["Kitchen and Toilets", pd.fittings_fixtures_kitchen_toilet],
            ["Servant Room Toilet", pd.fittings_fixtures_servant_room_toilet],
          ],
          "Door and Window": [
            ["Internal Door", pd.door_window_internal_door],
            ["External Glazing", pd.door_window_external_glazing],
          ],
          Electrical: [
            ["Main", pd.electrical],
            ["Backup", pd.backup],
          ],
          "Security System": [["Available", pd.security_system]],
        };

        const amenities = result.data.amenities;
        setAmenitiesList(amenities);
        setDisplayedAmenities(amenities.slice(0, 8));

        result.data.overview = overviewData;
        result.data.finishingData = finishingData;

        if (result.data.user_details) {
          setuserDetails(result.data.user_details[0]);
        }
        console.log("userdetails", userDetails);

        setProjects([result.data]);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);





  // Update Filtered Properties when selectedBHK or selectedFloorPlan changes
  useEffect(() => {
    if (projects.length > 0) {
      const allProperties = projects[0].project_properties || [];
      const bhkFiltered = allProperties.filter(
        (item) => item.bhk === selectedBHK
      );
      setFilteredProperties(bhkFiltered);
      setSelectedFloorPlan(bhkFiltered[0]?.area || null); // Default first plan
    }
  }, [projects, selectedBHK]);

  // Toggle Amenities Show/Hide
  const toggleAmenities = () => {
    setShowAllAmenities(!showAllAmenities);
    if (!showAllAmenities) {
      setDisplayedAmenities(amenitiesList);
    } else {
      setDisplayedAmenities(amenitiesList.slice(0, 8));
    }
  };

  //for the contact details
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);


  const formatPrice = (price) => {
    if (!price) return "";
    price = parseInt(price);
    if (price >= 10000000) {
      return (price / 10000000).toFixed(1) + " Cr";
    } else if (price >= 100000) {
      return (price / 100000).toFixed(1) + " L";
    } else if (price >= 1000) {
      return (price / 1000).toFixed(1) + " K";
    } else {
      return price.toString();
    }
  };



  useEffect(() => {
    if (isContactModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isContactModalOpen]);

  // Handle approval/disapproval
  const handleApproval = async (approvalStatus, projectId) => {
    try {
      setLoading(true); // Set loading true
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/update_project_status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: projectId,
            admin_approval: approvalStatus,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Update the project state with new approval status
        setProjectDetails((prevState) => ({
          ...prevState,
          admin_approval: approvalStatus,
        }));
        setLoading(false);

      } else {

        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen px-6 py-1 mx-auto mt-24 container-fluid w-100">
      {/* Breadcrumb aligned right */}
      <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
          <li>
            <Link
              to="/projects"
              className="font-medium text-blue-600 transition-colors hover:underline"
            >
              Go To My Projects
            </Link>
          </li>

          <li className="text-gray-400">/</li>

          <li>
            <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
              Project Deatils Page
            </span>
          </li>
        </ol>
      </nav>

      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        {/* Project Image */}
        <div className="p-4 text-end">
          {/* Approve/Disapprove Buttons */}
          {(can("projects", "approve") || can("admin", "approve")) && (
            <>
              {projectDetails.admin_approval === "Pending" ? (
                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={() =>
                      handleApproval("Approved", projectDetails._id)
                    }
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Approve"}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleApproval("Disapproved", projectDetails._id)
                    }
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Disapprove"}
                  </button>
                </div>
              ) : projectDetails.admin_approval === "Approved" ? (
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleApproval("Disapproved", projectDetails._id)
                  }
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Disapprove"}
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => handleApproval("Approved", projectDetails._id)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Approve"}
                </button>
              )}
            </>
          )}
        </div>
        <div className="max-w-full px-4 mx-auto md:px-16">
          {/* Property Details Section */}
          <div className="relative p-4 mb-4 rounded-lg shadow-sm bg-purple-50">
            {/* Price Section - Moved to top on mobile */}
            <div className="flex flex-col items-start mb-4 space-y-1 sm:absolute sm:top-4 sm:right-4 sm:items-end sm:mb-0">
              {loading ? (
                <p className="text-xl font-bold text-purple-600 sm:text-2xl">
                  Loading...
                </p>
              ) : (
                <>
                  {projects[0]?.project_properties?.length > 0 &&
                    (() => {
                      const prices = projects[0].project_properties.map((p) =>
                        Number(p.price),
                      );
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);

                      return (
                        <p className="flex items-center mb-0 text-xl font-bold text-purple-600 sm:text-2xl">
                          {minPrice === maxPrice ? (
                            <>
                              <FaRupeeSign className="mr-1" />
                              {formatPrice(minPrice)}
                            </>
                          ) : (
                            <>
                              <FaRupeeSign className="mr-1" />
                              {formatPrice(minPrice)}
                              {" - "}
                              <FaRupeeSign className="mx-1" />
                              {formatPrice(maxPrice)}
                            </>
                          )}
                        </p>
                      );
                    })()}

                  {projects[0]?.project_properties?.length > 0 &&
                    (() => {
                      // Calculate price per sqft for each property
                      const pricePerSqftList = projects[0].project_properties
                        .map((p) => {
                          const price = Number(p.price);
                          const area = Number(p.area);
                          return area > 0 ? price / area : null;
                        })
                        .filter((v) => v !== null);

                      if (pricePerSqftList.length === 0) return null;

                      const minPrice = Math.min(...pricePerSqftList);
                      const maxPrice = Math.max(...pricePerSqftList);

                      return (
                        <p className="flex items-center text-base font-bold text-black sm:text-xs sm:-mt-2">
                          {minPrice === maxPrice ? (
                            <>
                              <FaRupeeSign className="mr-1" />
                              {formatPrice(Math.round(minPrice))} per sqft
                            </>
                          ) : (
                            <>
                              <FaRupeeSign className="mr-1" />
                              {formatPrice(Math.round(minPrice))}
                              {" - "}
                              <FaRupeeSign className="mx-1" />
                              {formatPrice(Math.round(maxPrice))} per sqft
                            </>
                          )}
                        </p>
                      );
                    })()}
                </>
              )}
            </div>

            {/* Property Title and Info */}
            <div className="mt-0 ml-0 sm:ml-2 sm:mt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-normal sm:text-3xl">
                  {projects[0]?.project_details?.project_name || "Project Name"}
                </h2>

                {/* RERA badge  */}
                {projects[0]?.project_details?.rera_id &&
                  projects[0]?.project_details?.rera_id !== "" && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white shadow-sm">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-400 rounded-full">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        RERA
                      </span>
                    </div>
                  )}
              </div>

              {(projects[0]?.project_details?.address ||
                projects[0]?.project_details?.city_name ||
                projects[0]?.project_details?.state) && (
                <>
                  <p className="text-xl font-bold text-gray-700 sm:text-xl">
                    By{" "}
                    <span className="text-purple-500">
                      {projects[0]?.project_details?.connect_to_name}
                    </span>
                  </p>

                  <p className="mt-1 text-base text-gray-600 sm:text-lg">
                    {projects[0]?.project_details?.address && (
                      <>
                        <img
                          src="/admin/image/address_icon.png"
                          alt="Address Icon"
                          className="inline-block w-5 h-5 mr-2"
                        />
                        {projects[0].project_details.address}
                        <br className="hidden sm:block" />
                      </>
                    )}

                    {(projects[0]?.project_details?.city_name ||
                      projects[0]?.project_details?.state) && (
                      <>
                        {projects[0]?.project_details?.city_name || ""}
                        {projects[0]?.project_details?.city_name &&
                        projects[0]?.project_details?.state
                          ? ", "
                          : ""}
                        {projects[0]?.project_details?.state || ""}
                      </>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* Property Features */}
            <div className="flex flex-col items-start justify-between w-full mt-4 md:flex-row md:items-center">
              <div className="flex flex-wrap justify-between w-full gap-3 sm:gap-4 sm:w-auto sm:justify-start">
                {/* Price */}
                {projects[0]?.project_details?.average_project_price && (
                  <div className="flex flex-col items-start pr-3 border-r-2 border-rose-100 sm:items-center">
                    <p className="flex items-center text-base sm:text-lg">
                      <FaRupeeSign className="mr-1 text-lg text-rose-700 sm:text-xl" />

                      {formatAverageProjectPrice(
                        projects[0]?.project_details?.average_project_price,
                      )}
                    </p>

                    <span className="text-base leading-none text-gray-600 sm:text-lg">
                      Price
                    </span>
                  </div>
                )}

                {/* BHK */}
                {projects[0]?.project_details?.bhk_type && (
                  <div className="flex flex-col items-start pr-3 border-r-2 border-rose-100 sm:items-center">
                    <p className="flex items-center text-base sm:text-lg">
                      <AiFillHome className="mt-1 mr-1 text-lg text-rose-700 sm:text-xl" />

                      {projects[0]?.project_details?.bhk_type}
                    </p>

                    <span className="text-base leading-none text-gray-600 sm:text-lg">
                      BHK
                    </span>
                  </div>
                )}

                {/* Area */}
                {projects[0]?.project_details?.area && (
                  <div className="flex flex-col items-start px-3 border-r-2 border-rose-100 sm:items-center">
                    <p className="flex items-center text-base sm:text-lg">
                      <BiShapeSquare className="text-lg text-rose-700 sm:text-xl" />

                      <span className="ml-1">
                        {projects[0]?.project_details?.area}{" "}
                        {projects[0]?.project_details?.area_in}
                      </span>
                    </p>

                    <span className="text-base leading-none text-gray-600 sm:text-lg">
                      Area
                    </span>
                  </div>
                )}

                {/* Carpet Area */}
                {projects[0]?.project_details?.carpet_area && (
                  <div className="flex flex-col items-start px-3 border-r-2 border-rose-100 sm:items-center">
                    <p className="flex items-center text-base sm:text-lg">
                      <BiShapeSquare className="text-lg text-rose-700 sm:text-xl" />

                      <span className="ml-1">
                        {projects[0]?.project_details?.carpet_area}{" "}
                        {projects[0]?.project_details?.carpet_area_unit}
                      </span>
                    </p>

                    <span className="text-base leading-none text-gray-600 sm:text-lg">
                      Carpet Area
                    </span>
                  </div>
                )}

                {/* Possession */}
                {projects[0]?.project_details?.possession_date && (
                  <div className="flex flex-col items-start pl-2 sm:pl-3 sm:items-center">
                    <p className="flex items-center text-base sm:text-lg">
                      <MdDateRange className="text-lg text-rose-700 sm:text-xl" />

                      <span className="ml-1">
                        {new Date(
                          projects[0]?.project_details?.possession_date,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>

                    <span className="text-base leading-none text-gray-600 sm:text-lg">
                      Possession
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons - Stacked on mobile 'virtual tour */}
              <div className="flex flex-wrap w-full gap-2 mt-4 sm:gap-4 md:mt-0 sm:w-auto">
                <button
                  className="w-full px-3 py-1 text-sm text-black bg-white border rounded-lg sm:px-4 sm:py-2 sm:text-lg sm:w-auto"
                  onClick={() => {
                    const filePath = projects[0]?.project_details?.brochure_doc;

                    if (filePath) {
                      // If brochure_doc already includes full URL, use it directly
                      const isFullUrl = filePath.startsWith("http");
                      const fileUrl = isFullUrl
                        ? filePath
                        : `${process.env.REACT_APP_API_BASE_URL}/media/${filePath}`;

                      const link = document.createElement("a");
                      link.href = fileUrl;
                      link.target = "_blank";
                      link.rel = "noopener noreferrer";
                      link.download = filePath.split("/").pop();
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert("No brochure found.");
                    }
                  }}
                >
                  Download Brochure
                </button>
                <div
                  className="w-full px-3 py-1 text-sm text-white bg-purple-600 rounded-lg cursor-pointer sm:px-4 sm:py-2 sm:text-lg sm:w-auto"
                  onClick={() => {
                    setIsContactModalOpen(true);
                  }}
                >
                  Contact Details
                </div>

                {isContactModalOpen && (
                  <ContactDetails
                    onClose={() => setIsContactModalOpen(false)}
                    fullName={userDetails.full_name}
                    mobile={userDetails.mobile_number}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Image Section & Contact Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-auto md:h-[550px]">
            <div className="grid grid-cols-1 col-span-2 gap-1 md:grid-cols-1">
              <div className="flex flex-col gap-2 mt-6 md:flex-row">
                {images.length === 0 ? (
                  // Case: No images → Cover takes full width
                  <div className="w-full">
                    <img
                      src={projects[0]?.project_details?.cover_image}
                      alt="Main"
                      className="rounded-2xl w-full h-64 md:h-[400px] object-cover"
                    />
                  </div>
                ) : (
                  <>
                    {/* Left Side - Main Image (Always shown) */}
                    <div className="md:basis-[60%]">
                      <img
                        src={projects[0]?.project_details?.cover_image}
                        alt="Main"
                        className="rounded-2xl w-full h-64 md:h-[400px] object-cover"
                      />
                    </div>

                    {/* Right Side - Video and Other Images */}
                    <div className="md:basis-[40%] flex flex-col justify-start gap-2 px-2">
                      {/* Property Video Section (if available) */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setShowAllImages(true)}
                      >
                        {images.length > 0 ? (
                          <img
                            src={images[0].image}
                            alt="Preview"
                            className="rounded-2xl w-full h-48 md:h-[195px] object-cover"
                          />
                        ) : (
                          <p className="mt-2 text-lg text-center text-gray-500">
                            No images available for this project.
                          </p>
                        )}
                      </div>

                      {/* Property Images Section */}
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {(() => {
                          const filteredImages = images.filter(
                            (img) =>
                              img.image !==
                              projects[0]?.project_details?.cover_image,
                          );

                          // Case 1: No images
                          if (filteredImages.length === 0) {
                            return (
                              <p className="mt-4 text-lg text-center text-gray-500">
                                No images available for this project.
                              </p>
                            );
                          }

                          //  Case 2: Only one image → Don't render anything
                          if (filteredImages.length === 1) {
                            return null;
                          }

                          // Case 3: More than one image → Render as usual
                          return (
                            <div
                              className="relative cursor-pointer"
                              onClick={() => setShowAllImages(true)}
                            >
                              <img
                                src={filteredImages[1]?.image}
                                alt="Preview"
                                className="rounded-2xl w-full h-48 md:h-[190px] object-cover"
                              />
                              {filteredImages.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white bg-black bg-opacity-50 rounded-2xl">
                                  {(() => {
                                    const count =
                                      filteredImages.length -
                                      1 +
                                      (projects[0]?.project_details
                                        ?.property_video
                                        ? 1
                                        : 0);

                                    return count > 0 ? (
                                      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white bg-black bg-opacity-50 rounded-2xl">
                                        +{count} View All
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {showAllImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                  <div className="relative w-11/12 p-6 overflow-auto bg-white rounded-lg h-5/6">
                    <button
                      className="absolute text-3xl text-black top-4 right-4"
                      onClick={() => setShowAllImages(false)}
                    >
                      ×
                    </button>
                    <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      {/* All Images */}
                      {images.map((img, index) => (
                        <img
                          key={img._id || index}
                          src={img.image}
                          alt={`Gallery ${index}`}
                          className="object-cover w-full h-48 rounded-lg"
                        />
                      ))}

                      {/* Video inside gallery if available */}
                      {projects[0]?.project_details?.property_video && (
                        <video
                          src={projects[0].project_details.property_video}
                          controls
                          className="object-cover w-full h-48 rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* About Property Section */}
              {projects[0]?.project_details?.project_description && (
                <div className="p-4 mt-4 bg-white shadow-md rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-700">
                    About{" "}
                    {projects[0]?.project_details?.project_name ||
                      "the Property"}
                  </h3>
                  <p className="mt-2 text-lg text-gray-600">
                    {projects[0]?.project_details?.project_description ||
                      "No description available."}
                  </p>
                </div>
              )}

              {/* Property Location Section */}
              {projects[0]?.project_details?.address && (
                <div className="p-3 mt-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold">Project Location</h3>
                  <p className="mt-1 text-lg text-black">
                    <img
                      src="/admin/image/address_icon.png"
                      alt="Address Icon"
                      className="inline-block w-5 h-5 mr-2"
                    />
                    {projects[0].project_details.address}
                  </p>
                </div>
              )}

              {/* Overview Section */}
              <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
                <h3 className="mb-4 text-2xl font-bold">Overview</h3>

                {(() => {
                  const project = projects[0]?.project_details || {};

                  // Add / Remove anything from here manually
                  // Whatever is here will show in UI
                  const overviewFields = {
                    mark_as_featured: "Featured",
                    project_type: "Project Type",
                    furnished_type: "Furnishing",
                    total_floor: "Total Floors",
                    project_floor: "Project Floor",
                    bathroom: "Bathrooms",
                    balcony: "Balconies",
                    additional_rooms: "Additional Rooms",
                    number_of_minimum_bathrooms: "Minimum Bathrooms",
                    parking_availability: "Parking Availability",
                    total_number_parking: "Total Parking",
                    covered_parking: "Covered Parking",
                    uncovered_parking: "Open Parking",
                    pantry_option: "Pantry Option",
                    possession_status: "Possession Status",
                    possession_date: "Possession Date",
                    possession_start: "Possession Start",
                    age_of_property: "Property Age",
                    available_status: "Availability",
                    all_inclusive_price: "All Inclusive Price",
                    price_negotiable: "Price Negotiable",
                    tax_and_goverment_charges: "Tax & Government Charges",
                    maintenance_cost: "Maintenance Cost",
                    maintenance_frequency: "Maintenance Frequency",
                    maintenance_included: "Maintenance Included",
                    facing: "Facing",
                    view: "View",
                    flooring: "Flooring",
                    lift_availability: "Lift Availability",
                    water_source: "Water Source",
                    power_backup: "Power Backup",
                    security_system: "Security System",
                    construction_status: "Construction Status",
                    constructionOnLand: "Construction On Land",
                    launch_date: "Launch Date",
                    near_landmark: "Nearby Landmark",
                    property_no: "Property Number",
                    plot_no: "Plot Number",
                    block: "Block",
                    land_type: "Land Type",
                    breadthOfLand: "Land Breadth",
                    length_of_land: "Land Length",
                    area_type: "Area Type",
                    type_of_construction: "Construction ",
                    quality_rating: "Quality Rating",
                    central_AC: "Central AC",
                    office_type: "Office Type",
                    office_space_type: "Office Space ",
                    washroom_Check: "Washroom Available",
                    washroom: "Washroom",
                    commercial_washroom: "Commercial Washroom",
                    personal_washroom: "Personal Washroom",
                    selectedConstructionOnLand: "Construction On Land",
                    openSidesOfLand: "Open Sides Of Land",
                    no_of_open_sides: "Number Of Open Sides",
                    property_dimensions_breadth: "Property Breadth",
                    property_dimensions_length: "Property Length",
                    room_type: "Room Type",
                    attached_bathroom: "AttachedBathroom",
                    attached_balcony: "Attached Balcony",
                    transaction_type: "Transaction Type",
                    suited_for: "Suited For",
                    available_for: "Available For",
                    available_from: "Available From",
                    available_on: "Available On",
                    rent_duration: "Rent Duration",
                    available_for_company_lease: "Company Lease",
                    loan_availability: "Loan Availability",
                    virtual_tour_availability: "Virtual Tour",
                    video_url: "Video URL",
                    ups: "UPS",
                    oxygenDuct: "Oxygen Duct",
                    pantry: "Pantry",
                    conferenceRoom: "Conference Room",
                  };

                  //  THESE WILL NEVER SHOW
                  const hiddenFields = [
                    "_id",
                    "favorite_id",
                    "is_favorite",
                    "user_id",
                    "cover_image",
                    "logo",
                    "brochure_doc",
                    "property_video",
                    "latitude",
                    "longitude",
                    "deleted_at",
                    "property_owner_image",
                  ];

                  return (
                    <div className="grid grid-cols-1 text-lg text-gray-700 md:grid-cols-2 gap-y-2 gap-x-4">
                      {Object.entries(overviewFields).map(
                        ([key, label], index) => {
                          // skip hidden fields
                          if (hiddenFields.includes(key)) return null;

                          const value = project[key];

                          // skip empty values
                          if (
                            value === null ||
                            value === undefined ||
                            value === "" ||
                            value === "NA" ||
                            value === "N/A" ||
                            value === false
                          ) {
                            return null;
                          }

                          // format date
                          let formattedValue = value;

                          if (
                            key.includes("date") ||
                            key.includes("_at") ||
                            key === "available_from" ||
                            key === "available_on"
                          ) {
                            try {
                              formattedValue = new Date(
                                value,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              });
                            } catch (e) {}
                          }

                          // boolean handling
                          if (typeof value === "boolean") {
                            formattedValue = value ? "Yes" : "No";
                          }

                          return (
                            <div
                              key={index}
                              className="flex justify-between gap-4 p-3 border-b border-gray-100"
                            >
                              <span className="w-1/2 text-gray-500">
                                {label}
                              </span>

                              <span className="w-1/2 font-semibold text-black break-words text-right">
                                {formattedValue}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Price & Floor Plan Section */}
              <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-bold">Price & Floor Plan</h2>

                {/* BHK Buttons */}
                <div className="flex flex-wrap gap-4 mt-4 text-lg">
                  {[
                    ...new Set(
                      projects[0]?.project_properties?.map((item) => item.bhk),
                    ),
                  ].map((bhk) => (
                    <button
                      key={bhk}
                      onClick={() => {
                        setSelectedBHK(bhk);
                        setSelectedFloorPlan(null); // Reset on BHK change
                      }}
                      className={`${
                        selectedBHK === bhk
                          ? "bg-purple-50 text-purple-600"
                          : "bg-gray-100"
                      } border px-4 py-2 rounded-lg`}
                    >
                      {bhk}
                      <br />₹{" "}
                      {projects[0]?.project_properties
                        ?.filter((item) => item.bhk === bhk)
                        .map((item) => formatPrice(parseFloat(item.price)))
                        .sort((a, b) => a - b)
                        .slice(0, 2)
                        .join(" - ₹")}
                    </button>
                  ))}
                </div>

                {/* Floor Plan Details */}
                <div className="flex flex-col gap-0 mt-4 lg:flex-row">
                  {filteredProperties.length > 0 && (
                    <>
                      {/* Area list */}
                      <div className="w-fit lg:w-1/5 pr-1 mr-[1px] space-y-1">
                        {filteredProperties.map((item, idx) => (
                          <p
                            key={idx}
                            onClick={() => setSelectedFloorPlan(item.area)}
                            className={`cursor-pointer ${
                              item.area === selectedFloorPlan
                                ? "text-purple-600 underline"
                                : "text-gray-400"
                            }`}
                          >
                            {item.area} {item.area_in}
                          </p>
                        ))}
                      </div>

                      {/* Image + Price block */}
                      <div className="flex flex-col w-full gap-6 sm:flex-row sm:gap-11">
                        {/* Image */}
                        <img
                          src={
                            filteredProperties.find(
                              (item) => item.area === selectedFloorPlan,
                            )?.image || filteredProperties[0].image
                          }
                          alt="Floor Plan"
                          className="object-cover w-full cursor-pointer h-72 sm:w-1/2 lg:w-96 rounded-xl"
                          onClick={() => setIsOpen(true)}
                        />

                        {/* Price and Carpet Area */}
                        <div className="w-full text-left sm:w-1/2 lg:w-96 sm:text-right">
                          <p className="text-gray-400">Price</p>
                          <p className="text-xl font-bold">
                            ₹{" "}
                            {formatPrice(
                              filteredProperties.find(
                                (item) => item.area === selectedFloorPlan,
                              )?.price || filteredProperties[0].price,
                            )}
                          </p>
                          <p className="mt-4 text-gray-400">
                            {filteredProperties.find(
                              (item) => item.area === selectedFloorPlan,
                            )?.area_type ||
                              filteredProperties[0]?.area_type ||
                              "Area"}
                          </p>
                          <p className="font-semibold">
                            {filteredProperties
                              .map((item) => `${item.area} ${item.area_in}`)
                              .join(" / ")}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Amenities Section */}
              {amenitiesList.length > 0 && (
                <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold">Amenities</h3>
                  <div className="grid grid-cols-1 gap-4 mt-4 text-lg md:grid-cols-2 lg:grid-cols-4">
                    {displayedAmenities.map((amenity, index) => (
                      // <p key={index} className="flex items-center text-lg">
                      //   <PiCricketThin className="mr-2 text-lg text-black" />{" "}
                      //   {amenity.name}
                      // </p>
                      <p key={index} className="flex items-center text-lg">
                        {amenity.icon ? (
                          <img
                            src={`${process.env.REACT_APP_API_BASE_URL}/media/${amenity.icon}`}
                            alt={amenity.name}
                            className="w-10 h-10 mr-2"
                          />
                        ) : (
                          <PiCricketThin className="mr-2 text-lg text-black" />
                        )}
                        {amenity.name}
                      </p>
                    ))}
                  </div>
                  {amenitiesList.length > 8 && !showAllAmenities && (
                    <p
                      className="mt-2 ml-4 text-lg font-bold text-purple-500 cursor-pointer"
                      onClick={toggleAmenities}
                    >
                      +{amenitiesList.length - 8} More
                    </p>
                  )}
                </div>
              )}

              {/* Floors, Walls, Ceilings, Counters, Fittings/Fixtures, Door and Window, Electrical, Security System Sections */}
              {[
                "Floors",
                "Walls",
                "Ceilings",
                "Counters",
                "Fittings/Fixtures",
                "Door and Window",
                "Electrical",
                "Security System",
              ].map((section, index) => {
                const validItems = (
                  projects[0]?.finishingData[section] || []
                ).filter(([_, value]) => value && value !== "N/A");

                // If no valid items, skip rendering the whole section
                if (validItems.length === 0) return null;

                return (
                  <div
                    key={index}
                    className="p-4 mt-4 text-lg bg-white rounded-lg shadow-sm"
                  >
                    <h3 className="text-xl font-bold">{section}</h3>
                    <div className="grid grid-cols-1 mt-4 text-gray-700 md:grid-cols-2 gap-y-2">
                      {validItems.map(([key, value], i) => (
                        <div
                          key={i}
                          className="flex justify-start p-2 border-gray-200"
                        >
                          <span className="w-1/2 text-gray-500">{key}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Location Section with Map */}
              <div className="p-4 mt-4 bg-white shadow-sm rounded-2xl">
                <h2 className="text-xl font-bold text-gray-900">Location</h2>
                <div className="mt-4 overflow-hidden rounded-lg">
                  <iframe
                    className="w-full h-96 rounded-2xl"
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
