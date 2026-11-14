import { React, useState, useRef, useEffect } from "react";
import { FaBed, FaBath, FaRupeeSign } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { FaRulerCombined } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // import for routing
import { useParams, useLocation } from "react-router-dom";
import ContactDetails from "../AdminProperties/ContactDetails";
import { PiCricketThin } from "react-icons/pi";

import { useContext } from "react";
// import { MyContext } from "../../context/MyContext";
import { MyContext } from "../../App";

const PropertyDetail = () => {
  const { can } = useContext(MyContext);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({});
  const userId = "67f0ff69d7908f15767d3e64";
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (!price) return "";
    if (price >= 10000000) {
      return (price / 10000000).toFixed(1) + " Cr";
    } else if (price >= 100000) {
      return (price / 100000).toFixed(1) + " L";
    } else if (price >= 1000) {
      return (price / 1000).toFixed(1) + " K";
    } else {
      return price;
    }
  };

  const convertToSquareFeet = (area, unit) => {
    if (!area || !unit) return null;
    const areaNum = parseFloat(area);
    if (isNaN(areaNum)) return null;

    switch (unit.toLowerCase()) {
      case "sq ft":
      case "sqft":
      case "square feet":
        return areaNum;
      case "sq yd":
      case "sqyd":
      case "square yards":
        return areaNum * 9;
      case "sq mt":
      case "sqmt":
      case "square meters":
        return areaNum * 10.7639;
      case "acre":
      case "acres":
        return areaNum * 43560;
      default:
        return areaNum; // Return as-is if unit is unknown
    }
  };

  const formatArea = (area, unit) => {
    const convertedArea = convertToSquareFeet(area, unit);
    return convertedArea ? `${Math.round(convertedArea)} Sq Ft` : null;
  };
  // for the image section with 'get_property_detail' api

  const { id } = useParams();
  const location = useLocation();
  const property_owner_id = location.state?.property_owner_id;
  const [aboutPropertyText, setAboutPropertyText] = useState("");

  const [showAll, setShowAll] = useState(false);
  const [allAmenities, setAllAmenities] = useState([]);
  const visibleAmenities = showAll ? allAmenities : allAmenities.slice(0, 8);

  const [propertyImages, setPropertyImages] = useState([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [userDetails, setuserDetails] = useState([]);
  const [loading, setLoading] = useState(false);


  const user_id = sessionStorage.getItem("accessToken");
  useEffect(() => {
    const customer_id = user_id;

    if (propertyDetails?._id && propertyDetails?.user_id && customer_id) {
      const formData = new FormData();
      formData.append("property_id", propertyDetails?._id);
      formData.append("user_id", propertyDetails?.user_id);
      formData.append("customer_id", customer_id);

      axios
        .post(`${process.env.REACT_APP_API_BASE_URL}/cust_api/add_view_property`, formData)
        .then((res) => {
          if (res.data?.status === 1) {
            console.log("View property recorded");
          }
        })
        .catch((err) => {
          console.error("Failed to record property view:", err);
        });
    }
  }, [propertyDetails?.propertyId, user_id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchPropertyDetails = async (id) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_property_details`,
        { property_id: id, user_id: userId }
      );

      const data = res.data?.data;

      if (data?.property_images?.length > 0) {
        setPropertyImages(data.property_images);
      } else {
        setPropertyImages([]);
      }

      if (data?.amenities?.length > 0) {
        setAllAmenities(data.amenities);
      } else {
        setAllAmenities([]);
      }

      if (data?.property_details?.property_description) {
        setAboutPropertyText(data.property_details.property_description);
      } else {
        setAboutPropertyText("");
      }

      if (data?.property_details) {
        setPropertyDetails(data.property_details);
      } else {
        setPropertyDetails({});
      }

      if (data.user_details) {
        setuserDetails(data.user_details[0]); // <-- Add this
      }
      console.log("userdetails", userDetails);

      const pd = data.property_details;
      setLatitude(pd.latitude);
      setLongitude(pd.longitude);
    } catch (err) {
      console.error("Error fetching property details", err);
      setPropertyImages([]);
      setAllAmenities([]);
    }
  };

  useEffect(() => {
    fetchPropertyDetails(id);
  }, [id]);

  // for send Enquiry 'add_property_enquiry' api

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState(null); // success or error

  // Existing useEffect (on mount)
  useEffect(() => {
    const mobileNumber = sessionStorage.getItem("Mobile_Number");
    if (mobileNumber) {
      setContactNumber(mobileNumber);
    }
  }, []);

  //  New useEffect to check sessionStorage and update contact number after login
  useEffect(() => {
    let interval;

    if (isLoginModalOpen === false && !contactNumber) {
      interval = setInterval(() => {
        const mobileNumber = sessionStorage.getItem("Mobile_Number");
        if (mobileNumber) {
          setContactNumber(mobileNumber);
          clearInterval(interval); // Stop checking once we have it
        }
      }, 500); // Check every 500ms
    }

    return () => clearInterval(interval); // Cleanup
  }, [isLoginModalOpen, contactNumber]);




  //for the contact details
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [openContactModalAfterLogin, setOpenContactModalAfterLogin] =
    useState(false);


  useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("accessToken") && openContactModalAfterLogin) {
      setIsContactModalOpen(true);
      setOpenContactModalAfterLogin(false);
    }
  }, [openContactModalAfterLogin]);

  // Add this line below all useState declarations or just before return:
  const overviewFields = [
    [
      "Area",
      propertyDetails?.area
        ? formatArea(propertyDetails.area, propertyDetails.area_in)
        : null,
    ],
    ["Status", propertyDetails?.available_status || null],
    ["Developer", propertyDetails?.developer || null],
    ["Additional Rooms", propertyDetails?.additional_rooms || null],
    ["Project", propertyDetails?.property_name || null],
    ["Facing", propertyDetails?.facing || null],
    [
      "Floor",
      propertyDetails?.property_floor && propertyDetails?.total_floor
        ? `${propertyDetails.property_floor} (Out of ${propertyDetails.total_floor} Floors)`
        : null,
    ],
    ["Tower/Block", propertyDetails?.block || null],
    ["Lifts", propertyDetails?.lift_availability || null],
    ["Transaction Type", propertyDetails?.property_category_type || null],
    ["Building Type", propertyDetails?.building_type || null],
    ["Property Type", propertyDetails?.property_type || null],
    ["Plot No.", propertyDetails?.plot_no || null],
    ["Operating Since", propertyDetails?.operating_since || null],
  ].filter(([_, value]) => value);

  //more details

   const moreDetailsFields = [
    ["Food Available", propertyDetails?.food_available || null],
    ["Notice Period", propertyDetails?.notice_period || null],
    [
      "Notice Period Other Days",
      propertyDetails?.notice_period_other_days || null,
    ],
    [
      "Electricity Charges Included",
      propertyDetails?.electricity_charges_included || null,
    ],
    ["Total Beds", propertyDetails?.total_beds || null],
    ["Additional Rooms", propertyDetails?.additional_rooms || null],
    ["PG Rules", propertyDetails?.pg_rules || null],
    ["Gate Closing Time", propertyDetails?.gate_closing_time || null],
    ["Gate Closing Hour", propertyDetails?.gate_closing_hour || null],
    ["PG Services", propertyDetails?.pg_services || null],
    ["Age of Property", propertyDetails?.age_of_property || null],
    ["Office Space Type", propertyDetails?.office_space_type || null],
    ["Pantry", propertyDetails?.pantry || null],
    ["Personal Washroom", propertyDetails?.personal_washroom || null],
    ["Bathroom", propertyDetails?.bathroom || null],
    ["Covered Parking", propertyDetails?.covered_parking || null],
    ["Uncovered Parking", propertyDetails?.uncovered_parking || null],
    ["Balcony", propertyDetails?.balcony || null],
    ["Power Backup", propertyDetails?.power_backup || null],
    ["Lift Availability", propertyDetails?.lift_availability || null],
    ["Water Source", propertyDetails?.water_source || null],
    ["View", propertyDetails?.view || null],
    ["Flooring", propertyDetails?.flooring || null],
    ["Total Floor", propertyDetails?.total_floor || null],
    ["Property Floor", propertyDetails?.property_floor || null],
    ["Facing", propertyDetails?.facing || null],
    ["Ceiling Height", propertyDetails?.ceiling_height || null],
    ["Parking Availability", propertyDetails?.parking_availability || null],
    ["Min Lockin Period", propertyDetails?.min_lockin_period || null],
    ["Seat Type", propertyDetails?.seat_type || null],
    [
      "Number of Seats Available",
      propertyDetails?.number_of_seats_available || null,
    ],
    ["Plot No.", propertyDetails?.plot_no || null],
    // ["Loan Availability", propertyDetails?.loan_availability || null],
    //some other fileds
    ["RERA ID", propertyDetails?.property_no || null],
    ["Landmarks", propertyDetails?.landmarks || null],
    ["Furnishing", propertyDetails?.furnished_type || null],
    ["Near Landmark", propertyDetails?.near_landmark || null],
    ["Flat Name", propertyDetails?.flat_name || null],
    ["Maintenance Frequency", propertyDetails?.maintenance_frequency || null],
    [
      "Maintenance Included",
      propertyDetails?.maintenance_included ? "Yes" : "No",
    ],
    ["Security Deposit Type", propertyDetails?.security_deposit_type || null],
    [
      "Available for Company Lease",
      propertyDetails?.available_for_company_lease || null,
    ],
    ["Available For", propertyDetails?.available_for || null],
    ["Suited For", propertyDetails?.suited_for || null],
    ["Room Type", propertyDetails?.room_type || null],
    ["Food Charges Included", propertyDetails?.food_charges_included || null],
    // [
    //   "Virtual Tour Availability",
    //   propertyDetails?.virtual_tour_availability || null,
    // ],
    ["Property Category Type", propertyDetails?.property_category_type || null],
    ["Rent", propertyDetails?.rent || null],
    ["Rent Duration", propertyDetails?.rent_duration || null],
    ["Property Added Date", propertyDetails?.property_added_date || null],
    ["Possession Status", propertyDetails?.possession_status || null],
    ["Possession Date", propertyDetails?.possession_date || null],
    
    ["Area Type", propertyDetails?.area_type || null],
    ["Built up Area", propertyDetails?.area || null],
    ["Built-up Area Unit", propertyDetails?.area_in || null],
    ["Carpet Area", propertyDetails?.carpet_area || null],
    ["Carpet Area Unit", propertyDetails?.carpet_area_unit || null],
    ["Available Status", propertyDetails?.available_status || null],
    ["Investment Options", propertyDetails?.investment_options || null],
    ["All Inclusive Price", propertyDetails?.all_inclusive_price || null],
    ["Price Negotiable", propertyDetails?.price_negotiable || null],
    ["Tax And Goverment Charges", propertyDetails?.tax_and_goverment_charges || null],
    ["Electricity And Water Charges", propertyDetails?.electricity_and_water_charges || null],
    ["No Of Open Sides", propertyDetails?.no_of_open_sides || null],
    ["No Of Peoples", propertyDetails?.no_of_peoples || null],
["Type Of Construction", propertyDetails?.type_of_construction || null],
["Quality Rating", propertyDetails?.quality_rating || null],
["Central AC", propertyDetails?.central_AC || null],
["Total Number Parking", propertyDetails?.total_number_parking || null],
["Block", propertyDetails?.block || null],
["Developer", propertyDetails?.developer || null],
["Project Type", propertyDetails?.project_type || null],
["Transaction Type", propertyDetails?.transaction_type || null],
["Builder Floor Type", propertyDetails?.builder_floor_type || null],
["Attached Bathroom", propertyDetails?.attached_bathroom || null],
["Attached Balcony", propertyDetails?.attached_balcony || null],
["Pantry Option", propertyDetails?.pantry_option || null],
["Parking Types", propertyDetails?.parking_types || null],
["Possession By", propertyDetails?.possession_by || null],
["Property Dimensions Length", propertyDetails?.property_dimensions_length || null],
["Property Dimensions Breadth", propertyDetails?.property_dimensions_breadth || null],
["Length Of Land", propertyDetails?.length_of_land || null],
["Breadth Of Land", propertyDetails?.breadthOfLand || null],
["Open Sides Of Land", propertyDetails?.openSidesOfLand || null],
["Construction On Land", propertyDetails?.constructionOnLand || null],
["Selected Construction On Land", propertyDetails?.selectedConstructionOnLand || null],
["Commercial Washroom", propertyDetails?.commercial_washroom || null],
["Number Of Minimum Bathrooms", propertyDetails?.number_of_minimum_bathrooms || null],
["Maintenance Cost", propertyDetails?.maintenance_cost || null],
["Available Beds", propertyDetails?.available_beds || null],
["Available From", propertyDetails?.available_from || null],
["Available On", propertyDetails?.available_on || null],

["No Of Cabines", propertyDetails?.no_of_cabines || null],
["No Of Meeting Rooms", propertyDetails?.no_of_meeting_Rooms || null],
["No Of Conference Room", propertyDetails?.no_of_conference_room || null],
// ["Posted By Admin", propertyDetails?.posted_by_admin || null],
// ["UPS", propertyDetails?.ups || null],
// ["Oxygen Duct", propertyDetails?.oxygenDuct || null],
// ["Central AC", propertyDetails?.central_AC || null],
// ["Conference Room", propertyDetails?.conferenceRoom || null],
// ["Washroom", propertyDetails?.washroom || null],
// ["Washroom Check", propertyDetails?.washroom_Check || null],
["Reception Area", propertyDetails?.reception_area || null],
// ["Created At",
//   propertyDetails?.created_at
//     ? new Date(propertyDetails.created_at).toLocaleDateString("en-GB")
//     : null,
// ],

// ["Updated At",
//   propertyDetails?.updated_at
//     ? new Date(propertyDetails.updated_at).toLocaleDateString("en-GB")
//     : null,
// ],
  ].filter(([_, value]) => value);




  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isContactModalOpen || showAllImages) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isContactModalOpen, showAllImages]);

  const handleApproval = async (approvalStatus, propertyId) => {
    try {
      setLoading(true); // Set loading true
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/update_property_status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            property_id: propertyId,
            admin_approval: approvalStatus,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Update the property state with new approval status
        setPropertyDetails((prevState) => ({
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
    <div className="w-100 container-fluid mt-28">
      {/* Breadcrumb aligned right */}
      <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
          <li>
            <Link
              to="/properties"
              className="font-medium text-blue-600 transition-colors hover:underline"
            >
              Go To Properties
            </Link>
          </li>

          <li>
            <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
              Property Details Page
            </span>
          </li>

          <li className="text-gray-400">/</li>
        </ol>
      </nav>

      <div className="max-w-full p-4 mx-auto bg-white sm:px-16">
        <div className="p-4 text-end">
          {/* Approve/Disapprove Buttons */}
          {/* {propertyDetails.admin_approval === "Pending" ? (
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => handleApproval("Approved", propertyDetails._id)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Approve"}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleApproval("Disapproved", propertyDetails._id)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Disapprove"}
              </button>
            </div>
          ) : propertyDetails.admin_approval === "Approved" ? (
            <button
              className="btn btn-danger"
              onClick={() => handleApproval("Disapproved", propertyDetails._id)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Disapprove"}
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => handleApproval("Approved", propertyDetails._id)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          )} */}

          {/* Approve/Disapprove Buttons */}
          {(can("myInventory", "approve") ||
            can("inquiries", "approve") ||
            can("admin", "approve")) && (
            <>
              {propertyDetails.admin_approval === "Pending" ? (
                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={() =>
                      handleApproval("Approved", propertyDetails._id)
                    }
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Approve"}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleApproval("Disapproved", propertyDetails._id)
                    }
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Disapprove"}
                  </button>
                </div>
              ) : propertyDetails.admin_approval === "Approved" ? (
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleApproval("Disapproved", propertyDetails._id)
                  }
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Disapprove"}
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() =>
                    handleApproval("Approved", propertyDetails._id)
                  }
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Approve"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Property Details Section */}
        <div className="relative w-full h-auto p-2 mb-4 rounded-lg shadow-sm bg-purple-50">
          {(propertyDetails?.property_price || propertyDetails?.rent) && (
            <div className="absolute flex items-center space-x-4 top-4 right-4">
              <p className="flex items-center mt-5 text-3xl font-bold text-purple-600">
                <FaRupeeSign className="mr-2" />
                {propertyDetails?.property_category_type === "Rent" ? (
                  <>
                    {formatPrice(propertyDetails?.rent)}{" "}
                    <span className="ml-1 text-xl gray-700 text-">
                      {propertyDetails?.rent_duration
                        ? ` / ${propertyDetails.rent_duration}`
                        : ""}
                    </span>
                  </>
                ) : (
                  formatPrice(propertyDetails?.property_price)
                )}
              </p>
            </div>
          )}

          {/* <h2 className="mt-2 ml-6 text-3xl font-normal">
                    {propertyDetails?.bhk_type ? `${propertyDetails.bhk_type} ` : ""}
                    {propertyDetails?.area ? `${propertyDetails.area} Sq-ft ` : ""}
                    {propertyDetails?.property_type
                      ? `${propertyDetails.property_type} `
                      : ""}
                    for {propertyDetails?.property_category_type
                      ? `${propertyDetails.property_category_type}`
                      : ""}
                  </h2> */}

          <h2 className="mt-2 ml-6 text-3xl font-normal">
            {propertyDetails?.property_name
              ? `${propertyDetails.property_name} `
              : ""}
          </h2>

          <p className="ml-6 text-xl font-bold text-gray-700 break-words whitespace-normal max-w-[80ch]">
            <img
              src="/admin/image/address_icon.png"
              alt="Address Icon"
              className="inline-block w-5 h-5 mr-2"
            />
            {propertyDetails?.address || "Address N/A"}
          </p>
          <div className="flex items-center mt-6 ml-5 space-x-8">
            {propertyDetails?.bhk_type && (
              <div className="flex items-center space-x-2">
                <FaBed className="text-2xl text-purple-600" />
                <span className="text-lg font-bold">
                  {propertyDetails.bhk_type}
                </span>
              </div>
            )}

            {propertyDetails?.area && (
              <div className="flex items-center space-x-2">
                <FaRulerCombined className="text-2xl text-purple-600" />
                <span className="text-lg font-bold">
                  {formatArea(propertyDetails.area, propertyDetails.area_in)}
                </span>
              </div>
            )}

            {propertyDetails?.bathroom && (
              <div className="flex items-center space-x-2">
                <FaBath className="text-2xl text-purple-600" />
                <span className="text-lg font-bold">
                  {propertyDetails.bathroom} Bathroom
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <div
              className="w-full px-3 py-1 text-sm text-white bg-purple-600 rounded-lg cursor-pointer sm:px-4 sm:py-2 sm:text-lg sm:w-auto"
              onClick={() => {
                setIsContactModalOpen(true);
              }}
            >
              Contact Details
            </div>
            {isContactModalOpen &&
              userDetails &&
              !Array.isArray(userDetails) &&
              userDetails.full_name && (
                <ContactDetails
                  onClose={() => setIsContactModalOpen(false)}
                  fullName={userDetails.full_name || "N/A"}
                  mobile={userDetails.mobile_number || "N/A"}
                />
              )}
          </div>
        </div>
        {/* Image Section & Contact Form */}
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-2 h-auto md:h-[550px]">
          {/* Left Side Image Section */}
          <div className="grid grid-cols-1 col-span-2 gap-1 md:grid-cols-1">
            {/* Image Section */}
            <div className="flex flex-col gap-2 mt-6 md:flex-row">
              {propertyImages.length === 0 ? (
                <div className="w-full">
                  <img
                    src={propertyDetails?.cover_image}
                    alt="Main"
                    className="rounded-2xl w-full h-64 md:h-[400px] object-cover"
                  />
                </div>
              ) : (
                <>
                  {/* Left Side - Main Image */}
                  <div className="md:basis-[60%]">
                    <img
                      src={propertyDetails.cover_image}
                      alt="Main"
                      className="rounded-2xl w-full h-64 md:h-[400px] object-cover"
                    />
                  </div>

                  {/* Right Side - Video on Top + One Image Below */}
                  <div className="md:basis-[40%] flex flex-col justify-start gap-2 px-2">
                    {/* Property Main Image Section */}
                    <div
                      className="relative cursor-pointer"
                      onClick={() => setShowAllImages(true)}
                    >
                      {propertyImages.length > 0 && (
                        <img
                          src={propertyImages[0].image}
                          alt="Preview"
                          className="rounded-2xl w-full h-48 md:h-[195px] object-cover"
                        />
                      )}
                    </div>

                    {/* Property Additional Images Section */}
                    {propertyImages.length > 1 && (
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {(() => {
                          const filteredImages = propertyImages.filter(
                            (img) => img.image !== propertyDetails.cover_image,
                          );

                          // Case 1: No images after filtering → Don’t render
                          if (filteredImages.length === 0) {
                            return null;
                          }

                          // Case 2: Only one image → Don’t render second section
                          if (filteredImages.length === 1) {
                            return null;
                          }

                          // Case 3: More than one image → Render the 2nd preview + overlay
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
                                      (propertyDetails?.property_video ? 1 : 0);

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
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Add the Overview Component Below */}
            {overviewFields.length > 0 && (
              <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                <h3 className="mb-4 text-3xl font-semibold">Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-[18px]">
                  {overviewFields.map(([key, value], index) => (
                    <div
                      key={index}
                      className="flex justify-start p-2 border-gray-200"
                    >
                      <span className="w-1/2 text-gray-500">{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* More Details Section */}
            {moreDetailsFields.length > 0 && (
              <div className="w-full p-4 mt-4 bg-white rounded-lg shadow-sm">
                <h3 className="mb-4 ml-2 text-3xl font-semibold">
                  More Details
                </h3>
                <table className="min-w-full table-auto text-left text-[16px] text-black ml-2">
                  <tbody>
                    {moreDetailsFields.map(([label, value], index) => (
                      <tr key={index} className="align-top">
                        <td className="py-1 pr-2 text-gray-500 sm:pr-6 md:pr-12 lg:pr-20 whitespace-nowrap">
                          {label}:
                        </td>
                        <td className="py-1 pl-1 break-words">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Amenities Section */}
            <div className="w-full p-3 mt-4 bg-white rounded-lg shadow-sm">
              <h3 className="ml-4 font-semibold text-lm">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 mt-4 ml-4 text-[18px]">
                {visibleAmenities.map((amenity, index) => (
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
              {!showAll && allAmenities.length > 8 && (
                <p
                  className="mt-2 ml-4 font-bold text-purple-500 cursor-pointer "
                  onClick={() => setShowAll(true)}
                >
                  +{allAmenities.length - 8} More
                </p>
              )}
            </div>

            {/* About Property Section */}
            <div className="bg-white shadow-sm mt-4 rounded-2xl p-3 h-auto md:h-[250px] w-full">
              <h2 className="justify-center ml-4 font-bold text-gray-700 text-ml">
                About property
              </h2>
              <p className="mt-3 text-gray-700 justify-center ml-4 text-[18px]">
                {aboutPropertyText}
              </p>
            </div>

            {/* Location Section with Map */}
            <div className="bg-white shadow-sm mt-4 rounded-2xl p-3 h-auto md:h-[600px] w-full">
              <h2 className="ml-4 text-3xl font-bold text-gray-900">
                Location
              </h2>
              <div className="mt-4 overflow-hidden rounded-lg">
                <iframe
                  className="w-full h-48 md:h-[450px] rounded-2xl"
                  src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Viewing All Images */}
        {showAllImages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white p-6 rounded-lg w-[80%] h-[80%] overflow-auto">
              <button
                className="absolute text-3xl text-white top-4 right-4"
                onClick={() => setShowAllImages(false)}
              >
                ×
              </button>
              <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {propertyImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.image}
                    alt={`Room ${index + 1}`}
                    className="object-cover w-full h-48 rounded-lg"
                  />
                ))}

                {/* Property  Video at the end */}
                {propertyDetails?.property_video && (
                  <video
                    controls
                    className="rounded-2xl w-full h-48 md:h-[195px] object-cover"
                  >
                    <source
                      src={propertyDetails.property_video}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
