import { EP, API_BASE_URL } from '../../Api/endpoints';
import { React, useState, useRef, useEffect } from "react";
import { FaBed, FaBath, FaRupeeSign } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { FaRulerCombined } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // import for routing
import { useParams, useLocation } from "react-router-dom";
import ContactDetails from "./ContactDetails";
import { PiCricketThin } from "react-icons/pi";



const PropertyImages = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({});
  const userId =  "67f0ff69d7908f15767d3e64";
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

  // for the image section with 'get_property_detail' api

  const { propertyId } = useParams();
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
  const[loading ,setLoading]=useState(false);


  const user_id = sessionStorage.getItem("accessToken");
  useEffect(() => {
    const customer_id = user_id;

    if (propertyDetails?._id && propertyDetails?.user_id && customer_id) {
      const formData = new FormData();
      formData.append("property_id", propertyDetails?._id);
      formData.append("user_id", propertyDetails?.user_id);
      formData.append("customer_id", customer_id);

      axios
        .post(`${EP.CUST_API_ADD_VIEW_PROPERTY}`, formData)
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
        `${EP.CUST_API_GET_PROPERTY_DETAILS}`,
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
    fetchPropertyDetails(propertyId);
  }, [propertyId]);

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

  const userType = sessionStorage.getItem("user_type");
  // Handle Enquiry Form submission
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }

    const enquiryData = {
      property_id: propertyDetails?._id,
      user_id: propertyDetails?.user_id,
      customer_id: accessToken,
      name,
      user_type: userType,
      contact_number: contactNumber,
      message,
    };

    try {
      const response = await axios.post(
        `${EP.CUST_API_ADD_PROPERTY_ENQUIRY}`,
        enquiryData
      );

      if (response.data.status) {
        setEnquiryStatus({
          type: "success",
          message: "Enquiry sent successfully!",
        });
        setName("");
        setMessage("");
      } else {
        setEnquiryStatus({ type: "error", message: "Failed to send enquiry!" });
      }
    } catch (error) {
      setEnquiryStatus({ type: "error", message: "Something went wrong!" });
    }
  };


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
        ? `${propertyDetails.area} ${propertyDetails.area_in || ""}`
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
    ["Lifts", propertyDetails?.lift_availability || null],
    ["Transaction Type", propertyDetails?.property_category_type || null],
  ].filter(([_, value]) => value);

  //more details

  const moreDetailsFields = [
    [
      "Price",
      propertyDetails?.property_price
        ? `₹${formatPrice(propertyDetails.property_price)}` +
        (propertyDetails?.maintenance_cost
          ? ` | ₹${formatPrice(
            propertyDetails.maintenance_cost
          )} | Maintenance Cost ₹${propertyDetails.maintenance_cost}`
          : "")
        : null,
    ],
    [
      "Booking Amount",
      propertyDetails?.custom_deposit_amount
        ? `₹${propertyDetails.custom_deposit_amount}`
        : null,
    ],
    // ["RERA ID", propertyDetails?.property_no || null],
    [
      "Address",
      propertyDetails?.address &&
        propertyDetails?.city_name &&
        propertyDetails?.state &&
        propertyDetails?.zip_code
        ? `${propertyDetails.address}, ${propertyDetails.city_name}, ${propertyDetails.state}, ${propertyDetails.zip_code}`
        : null,
    ],
    ["Landmarks", propertyDetails?.landmarks || null],
    ["Furnishing", propertyDetails?.furnished_type || null],
    ["Flooring", propertyDetails?.flooring || null],
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
    ["Food Available", propertyDetails?.food_available || null],
    ["Food Charges Included", propertyDetails?.food_charges_included || null],
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
    ["PG Rules", propertyDetails?.pg_rules || null],
    ["Gate Closing Time", propertyDetails?.gate_closing_time || null],
    ["Gate Closing Hour", propertyDetails?.gate_closing_hour || null],
    ["PG Services", propertyDetails?.pg_services || null],
    ["Min Lockin Period", propertyDetails?.min_lockin_period || null],
    [
      "Virtual Tour Availability",
      propertyDetails?.virtual_tour_availability || null,
    ],
    ["Property Category Type", propertyDetails?.property_category_type || null],
    ["Water Source", propertyDetails?.water_source || null],
    ["Additional Rooms", propertyDetails?.additional_rooms || null],
    ["Lift Availability", propertyDetails?.lift_availability || null],
    ["Loan Availability", propertyDetails?.loan_availability || null],
    ["Office Space Type", propertyDetails?.office_space_type || null],
    ["Pantry", propertyDetails?.pantry || null],
    ["Personal Washroom", propertyDetails?.personal_washroom || null],
    ["Ceiling Height", propertyDetails?.ceiling_height || null],
    ["Parking Availability", propertyDetails?.parking_availability || null],
    ["Seat Type", propertyDetails?.seat_type || null],
    [
      "Number of Seats Available",
      propertyDetails?.number_of_seats_available || null,
    ],
    ["Rent", propertyDetails?.rent || null],
    ["Rent Duration", propertyDetails?.rent_duration || null],
    ["Property Added Date", propertyDetails?.property_added_date || null],
    ["Possession Status", propertyDetails?.possession_status || null],
    ["Possession Date", propertyDetails?.possession_date || null],
    ["Age of Property", propertyDetails?.age_of_property || null],
    ["Covered Parking", propertyDetails?.covered_parking || null],
    ["Uncovered Parking", propertyDetails?.uncovered_parking || null],
    ["Balcony", propertyDetails?.balcony || null],
    ["Power Backup", propertyDetails?.power_backup || null],
    ["Facing", propertyDetails?.facing || null],
    ["View", propertyDetails?.view || null],
    ["Area In", propertyDetails?.area_in || null],
    ["Area Type", propertyDetails?.area_type || null],
    ["Total Floor", propertyDetails?.total_floor || null],
    ["Property Floor", propertyDetails?.property_floor || null],
    ["Available Status", propertyDetails?.available_status || null],
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
        `${EP.API_UPDATE_PROPERTY_STATUS}`,
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
        <ol className="flex flex-wrap items-center space-x-2 md:space-x-4 text-sm">
          <li>
            <Link
              to="/properties"
              className="text-blue-600 font-medium hover:underline transition-colors"
            >
              Go To Properties
            </Link>
          </li>

          <li>
            <span className="inline-block px-3 py-1 rounded-full text-gray-800 font-bold text-base">
              Property Details Page
            </span>
          </li>

          <li className="text-gray-400">/</li>
        </ol>
      </nav>

      <div className="max-w-full p-4 mx-auto sm:px-16 bg-white">

         <div className="text-end p-4">
          {/* Approve/Disapprove Buttons */}
          {propertyDetails.admin_approval === "Pending" ? (
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
          )}
        </div>
        
        {/* Property Details Section */}
        <div className="relative w-full h-auto p-2 mb-4 rounded-lg shadow-sm bg-purple-50">
          {propertyDetails?.property_price && (
            
            <div className="absolute flex items-center space-x-4 top-4 right-4">
              <p className="flex items-center mt-5 text-3xl font-bold text-purple-600">
                <FaRupeeSign className="mr-2" />
                {propertyDetails?.property_category_type === "Rent" ? (
                  <>
                    {formatPrice(propertyDetails?.rent)}{" "}
                    <span className="ml-1 text-base text-gray-700">
                      ({propertyDetails?.rent_duration})
                    </span>
                  </>
                ) : (
                  formatPrice(propertyDetails?.property_price)
                )}
              </p>
            </div>
          )}

          <h2 className="mt-2 ml-6 text-3xl font-normal">
            {propertyDetails?.bhk_type ? `${propertyDetails.bhk_type} ` : ""}
            {propertyDetails?.area ? `${propertyDetails.area} Sq-ft ` : ""}
            {propertyDetails?.property_type
              ? `${propertyDetails.property_type} `
              : ""}
            for {propertyDetails?.property_category_type
              ? `${propertyDetails.property_category_type}`
              : ""}
          </h2>

          <p className="ml-6 text-xl font-bold text-gray-700">
            {propertyDetails?.city_name || "City Name N/A"}
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
                  {propertyDetails.area} sqft
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
            {isContactModalOpen && (
              <ContactDetails
                onClose={() => setIsContactModalOpen(false)}
                fullName={
                  userDetails?.full_name || "N/A"
                }
                mobile={

                  userDetails?.mobile_number || "N/A"
                }
                userEmail={
                  userDetails?.email || "N/A"
                }

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
                {/* Video */}
                {propertyDetails?.property_video ? (
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
                ) : (
                  <p className="mt-2 text-lg text-center text-gray-500">
                    No video available for this property.
                  </p>
                )}

                {/* One Image + View All Overlay */}
                {(() => {
                  const filteredImages = propertyImages.filter(
                    (img) => img.image !== propertyDetails.cover_image
                  );

                  if (filteredImages.length === 0) {
                    return (
                      <p className="mt-4 text-lg text-center text-gray-500">
                        No images available for this property.
                      </p>
                    );
                  }

                  return (
                    <div
                      className="relative cursor-pointer"
                      onClick={() => setShowAllImages(true)}
                    >
                      <img
                        src={filteredImages[0].image}
                        alt="Preview"
                        className="rounded-2xl w-full h-48 md:h-[190px] object-cover"
                      />
                      {filteredImages.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white bg-black bg-opacity-50 rounded-2xl">
                          +{filteredImages.length} View All
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
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
                        src={`${API_BASE_URL}/media/${amenity.icon}`}
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

                {/* Property images Video at the end */}
                {/* {propertyDetails?.property_video && (
                  <video
                    controls
                    className="object-cover w-full h-48 rounded-lg"
                  >
                    <source
                      src={propertyDetails?.property_video}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                )} */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyImages;
