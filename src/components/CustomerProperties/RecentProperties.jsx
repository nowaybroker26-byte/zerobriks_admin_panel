import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { faShareNodes, faChair } from "@fortawesome/free-solid-svg-icons";
import { FaRupeeSign, FaCopy } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { BsHouseDoorFill } from "react-icons/bs";
import { BiShapeSquare } from "react-icons/bi";
import { PiCubeFocus } from "react-icons/pi";
import { FaHeart as Heart } from "react-icons/fa";

const RecentProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState("");
  const [copiedId, setCopiedId] = useState(null);


  useEffect(() => {
    fetchProperties();
  }, []);

  const handleViewClick = (property) => {
    // Navigate to the PropertyDetailsPage with the selected property's ID
    navigate(`/property-details/${property._id}`);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/recently_posted_properties`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customers.");
      }

      const result = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        const data = result.data;
        setProperties(data);
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setErrors("Failed to fetch properties.");
    }
  };

  const truncateText = (text, wordLimit) => {
    if (!text || typeof text !== "string") return "";

    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

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

  const [activeIndexes, setActiveIndexes] = useState({});


  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    cssEase: "linear",
    centerMode: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };


  return (
    <div className="mx-auto container-fluid w-100 mt-28">
      {errors && <div className="alert alert-danger">{errors}</div>}

      {/* Breadcrumb aligned right */}
      <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
          <li>
            <Link
              to="/admin"
              className="font-medium text-blue-600 transition-colors hover:underline"
            >
              Home
            </Link>
          </li>

          <li className="text-gray-400">/</li>

          <li>
            <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
              Recent Properties Page
            </span>
          </li>
        </ol>
      </nav>

      <div className="p-2 bg-white border rounded shadow-lg">
        <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
          <FontAwesomeIcon icon={faBuilding} className="mr-2" />
          All Recent Properties
        </h4>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">

          {properties
            ?.map((property) => {
              const getValidImageUrl = (img) => {
                if (typeof img !== "string" || !img.trim()) return null;
                return img.startsWith("http") ? img : process.env.REACT_APP_API_BASE_URL + img;
              };

              const coverImage = getValidImageUrl(property.cover_image);
              const additionalImages = (property.property_images || [])
                .map((imgObj) => getValidImageUrl(imgObj?.image))
                .filter(Boolean);
              const allImages = [...(coverImage ? [coverImage] : []), ...additionalImages];

              return (
                <div key={property._id} className="box-border p-4">
                  <div className="h-full overflow-hidden shadow rounded-2xl bg-slate-100">
                    <div className="w-full overflow-hidden rounded-xl">
                      <div className="relative">
                        <Link
                          to={`/property-details/${property._id}`}
                          className="block"
                        >
                          {allImages.length > 1 ? (
                            <Slider
                              key={`${property._id}-${activeIndexes[property._id] || 0}`}
                              dots
                              infinite
                              speed={500}
                              slidesToShow={1}
                              slidesToScroll={1}
                              arrows
                              autoplay
                              autoplaySpeed={2000}
                              beforeChange={(current, next) =>
                                setActiveIndexes((prev) => ({ ...prev, [property._id]: next }))
                              }
                              initialSlide={activeIndexes[property._id] || 0}
                              customPaging={(i) => {
                                const activeSlide = activeIndexes[property._id] || 0;
                                const isActive = i === activeSlide % allImages.length;
                                return (
                                  <div
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      borderRadius: "50%",
                                      background: isActive ? "#fff" : "#888",
                                      margin: "0 5px",
                                      cursor: "pointer",
                                    }}
                                  />
                                );
                              }}
                              appendDots={(dots) => (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "100%",
                                  }}
                                >
                                  {dots}
                                </div>
                              )}
                              className="rounded-t-2xl"
                            >
                              {allImages.map((imgUrl, idx) => (
                                <div key={`${property._id}-${idx}`}>
                                  <img
                                    src={imgUrl}
                                    alt="Property"
                                    className="object-cover w-full h-48 rounded-t-2xl"
                                  />
                                </div>
                              ))}
                            </Slider>
                          ) : (
                            <img
                              src={allImages[0]}
                              alt="Property"
                              className="object-cover w-full h-48 rounded-t-2xl"
                              loading="lazy"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                        </Link>
                        {/* Days on Houzza */}
                        <span className="absolute px-2 py-1 text-xs font-normal text-white rounded-full top-2 left-2 bg-gray-800/60 backdrop-blur-sm">
                          {property.days_since_created} days on Houzza
                        </span>


                        <div className="absolute flex items-center space-x-2 top-2 right-2">
                          <span className={`
                            text-white text-xs font-normal py-1 px-2 rounded-full flex items-center gap-1
                            ${property.admin_approval === "Approved"
                                                    ? "bg-green-600"
                                                    : property.admin_approval === "Disapproved"
                                                      ? "bg-red-600"
                                                      : "bg-gray-800/60 backdrop-blur-sm"}
                          `}
                          >

                            {property.admin_approval}
                          </span>

                        </div>

                        {/* FOR BUY / RENT & FEATURED tags */}
                        <div className="absolute bottom-0 left-0">
                          <span
                            className={`text-white text-xs px-3 py-1 rounded-se-lg ${property.property_category_type === "Buy"
                              ? "bg-green-500"
                              : property.property_category_type === "Rent"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                              }`}
                          >
                            {property.property_category_type === "Buy"
                              ? "FOR BUY"
                              : property.property_category_type === "Rent"
                                ? "FOR RENT"
                                : "UNKNOWN"}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0">
                          {property.mark_as_featured === "Yes" && (
                            <span className="px-3 py-1 text-xs text-white bg-yellow-500 rounded-ss-lg">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-4 text-black bg-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold truncate">
                            {property.property_name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap pt-1 text-sm">
                          <div className="flex flex-wrap items-center w-full space-x-6">
                            {property.property_category_type === "Rent" ? (
                              property.rent ? (
                                <p className="flex items-center text-base">
                                  <FaRupeeSign className="mr-1 text-base text-blue-600" />
                                  {formatPrice(property.rent)}
                                  {property.rent_duration && (
                                    <span className="ml-1 text-sm text-gray-500">
                                      / {property.rent_duration}
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="flex items-center opacity-0">&nbsp;</p>
                              )
                            ) : property.property_price ? (
                              <p className="flex items-center text-base">
                                <FaRupeeSign className="mr-1 text-base text-purple-600" />
                                {formatPrice(property.property_price)}
                              </p>
                            ) : (
                              <p className="flex items-center opacity-0">&nbsp;</p>
                            )}

                            {property.bhk_type ? (
                              <p className="flex items-center text-base">
                                <BsHouseDoorFill className="mr-1 text-base text-purple-600" />
                                {property.bhk_type}
                              </p>
                            ) : (
                              <p className="flex items-center opacity-0">&nbsp;</p>
                            )}

                            {property.area_sq ? (
                              <p className="flex items-center text-base">
                                <BiShapeSquare className="mr-1 text-base text-purple-600" />
                                {property.area_sq} sq.ft
                              </p>
                            ) : (
                              <p className="flex items-center opacity-0">&nbsp;</p>
                            )}
                          </div>
                          <div className="flex items-center w-full mt-2">
                            {property.furnished_type ? (
                              <p className="flex items-center text-base">
                                <FontAwesomeIcon
                                  icon={faChair}
                                  className="mr-1 text-purple-600"
                                />
                                {property.furnished_type}
                              </p>
                            ) : (
                              <p className="flex items-center opacity-0">&nbsp;</p>
                            )}
                          </div>
                        </div>

                          <p className="flex items-center gap-2 mt-1 text-sm font-bold text-gray-500 truncate" >
                          <img
                            src="admin/image/address_icon.png" 
                            alt="Location Icon"
                            className="object-contain w-4 h-4"
                          />
                          {property.address_area || "No Address Provided"}
                        </p>
                        <div className="flex items-center mt-1 mb-0 text-sm truncate">
                          {/* <div className="p-2 rounded-full bg-slate-100">
                            <AiOutlineUser className="text-xl text-gray-600" />
                          </div> */}
                          <div className="p-2 rounded-full bg-slate-100">
                            {property.property_owner_image ? (
                              <img
                                src={`${process.env.REACT_APP_API_BASE_URL}/media/${property.property_owner_image}`}
                                alt="Owner"
                                className="object-cover w-6 h-6 rounded-full"
                              />
                            ) : (
                              <AiOutlineUser className="text-xl text-gray-600" size={25} />
                            )}
                          </div>
                          <div className="flex flex-col ml-2">
                            <span className="text-sm font-semibold">
                              {property.connect_to_name}
                            </span>
                            <span>{property.user_type}</span>
                          </div>
                        </div>

                        {/* Property ObjectId — same pattern used in PropertyCard.jsx,
                            so admin can copy the exact ID for use with ObjectId search */}
                        <div className="flex items-center justify-between px-2 py-1 mt-2 text-xs text-gray-500 border-t border-gray-200 rounded bg-gray-50">
                          <span className="font-mono truncate">ID: {property._id}</span>
                          <button
                            onClick={() => handleCopyId(property._id)}
                            className="ml-2 text-gray-400 hover:text-gray-700"
                            title="Copy Property ID"
                          >
                            {copiedId === property._id ? (
                              <span className="text-green-600">Copied!</span>
                            ) : (
                              <FaCopy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
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

export default RecentProperties;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBuilding } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import { faShareNodes, faChair } from "@fortawesome/free-solid-svg-icons";
// import { FaRupeeSign } from "react-icons/fa";
// import { AiOutlineUser } from "react-icons/ai";
// import { BsHouseDoorFill } from "react-icons/bs";
// import { BiShapeSquare } from "react-icons/bi";
// import { PiCubeFocus } from "react-icons/pi";
// import { FaHeart as Heart } from "react-icons/fa";

// const RecentProperties = () => {
//   const navigate = useNavigate();
//   const [properties, setProperties] = useState([]);
//   const [errors, setErrors] = useState("");


//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   const handleViewClick = (property) => {
//     // Navigate to the PropertyDetailsPage with the selected property's ID
//     navigate(`/property-details/${property._id}`);
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL}/api/recently_posted_properties`
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch customers.");
//       }

//       const result = await response.json();
//       if (result.status === 1 && Array.isArray(result.data)) {
//         const data = result.data;
//         setProperties(data);
//       } else {
//         throw new Error("Invalid data format.");
//       }
//     } catch (error) {
//       console.error("Error fetching properties:", error);
//       setErrors("Failed to fetch properties.");
//     }
//   };

//   const truncateText = (text, wordLimit) => {
//     if (!text || typeof text !== "string") return "";

//     const words = text.split(" ");
//     if (words.length > wordLimit) {
//       return words.slice(0, wordLimit).join(" ") + "...";
//     }
//     return text;
//   };

//   const formatPrice = (price) => {
//     if (!price) return "";

//     if (price >= 10000000) {
//       return (price / 10000000).toFixed(1) + " Cr";
//     } else if (price >= 100000) {
//       return (price / 100000).toFixed(1) + " L";
//     } else if (price >= 1000) {
//       return (price / 1000).toFixed(1) + " K";
//     } else {
//       return price;
//     }
//   };

//   const [activeIndexes, setActiveIndexes] = useState({});


//   const settings = {
//     infinite: true,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     arrows: false,
//     cssEase: "linear",
//     centerMode: false,
//     centerPadding: "0px",
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: 2,
//           slidesToScroll: 1,
//         },
//       },
//       {
//         breakpoint: 768,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//         },
//       },
//     ],
//   };


//   return (
//     <div className="mx-auto container-fluid w-100 mt-28">
//       {errors && <div className="alert alert-danger">{errors}</div>}

//       {/* Breadcrumb aligned right */}
//       <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
//         <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
//           <li>
//             <Link
//               to="/admin"
//               className="font-medium text-blue-600 transition-colors hover:underline"
//             >
//               Home
//             </Link>
//           </li>

//           <li className="text-gray-400">/</li>

//           <li>
//             <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
//               Recent Properties Page
//             </span>
//           </li>
//         </ol>
//       </nav>

//       <div className="p-2 bg-white border rounded shadow-lg">
//         <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
//           <FontAwesomeIcon icon={faBuilding} className="mr-2" />
//           All Recent Properties
//         </h4>

//         <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">

//           {properties
//             ?.map((property) => {
//               const getValidImageUrl = (img) => {
//                 if (typeof img !== "string" || !img.trim()) return null;
//                 return img.startsWith("http") ? img : process.env.REACT_APP_API_BASE_URL + img;
//               };

//               const coverImage = getValidImageUrl(property.cover_image);
//               const additionalImages = (property.property_images || [])
//                 .map((imgObj) => getValidImageUrl(imgObj?.image))
//                 .filter(Boolean);
//               const allImages = [...(coverImage ? [coverImage] : []), ...additionalImages];

//               return (
//                 <div key={property._id} className="box-border p-4">
//                   <div className="h-full overflow-hidden shadow rounded-2xl bg-slate-100">
//                     <div className="w-full overflow-hidden rounded-xl">
//                       <div className="relative">
//                         <Link
//                           to={`/property-details/${property._id}`}
//                           className="block"
//                         >
//                           {allImages.length > 1 ? (
//                             <Slider
//                               key={`${property._id}-${activeIndexes[property._id] || 0}`}
//                               dots
//                               infinite
//                               speed={500}
//                               slidesToShow={1}
//                               slidesToScroll={1}
//                               arrows
//                               autoplay
//                               autoplaySpeed={2000}
//                               beforeChange={(current, next) =>
//                                 setActiveIndexes((prev) => ({ ...prev, [property._id]: next }))
//                               }
//                               initialSlide={activeIndexes[property._id] || 0}
//                               customPaging={(i) => {
//                                 const activeSlide = activeIndexes[property._id] || 0;
//                                 const isActive = i === activeSlide % allImages.length;
//                                 return (
//                                   <div
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       borderRadius: "50%",
//                                       background: isActive ? "#fff" : "#888",
//                                       margin: "0 5px",
//                                       cursor: "pointer",
//                                     }}
//                                   />
//                                 );
//                               }}
//                               appendDots={(dots) => (
//                                 <div
//                                   style={{
//                                     position: "absolute",
//                                     bottom: "10px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     display: "flex",
//                                     justifyContent: "center",
//                                     width: "100%",
//                                   }}
//                                 >
//                                   {dots}
//                                 </div>
//                               )}
//                               className="rounded-t-2xl"
//                             >
//                               {allImages.map((imgUrl, idx) => (
//                                 <div key={`${property._id}-${idx}`}>
//                                   <img
//                                     src={imgUrl}
//                                     alt="Property"
//                                     className="object-cover w-full h-48 rounded-t-2xl"
//                                   />
//                                 </div>
//                               ))}
//                             </Slider>
//                           ) : (
//                             <img
//                               src={allImages[0]}
//                               alt="Property"
//                               className="object-cover w-full h-48 rounded-t-2xl"
//                               loading="lazy"
//                               onError={(e) => (e.target.style.display = "none")}
//                             />
//                           )}
//                         </Link>
//                         {/* Days on Houzza */}
//                         <span className="absolute px-2 py-1 text-xs font-normal text-white rounded-full top-2 left-2 bg-gray-800/60 backdrop-blur-sm">
//                           {property.days_since_created} days on Houzza
//                         </span>


//                         <div className="absolute flex items-center space-x-2 top-2 right-2">
//                           <span className={`
//                             text-white text-xs font-normal py-1 px-2 rounded-full flex items-center gap-1
//                             ${property.admin_approval === "Approved"
//                                                     ? "bg-green-600"
//                                                     : property.admin_approval === "Disapproved"
//                                                       ? "bg-red-600"
//                                                       : "bg-gray-800/60 backdrop-blur-sm"}
//                           `}
//                           >

//                             {property.admin_approval}
//                           </span>

//                         </div>

//                         {/* FOR BUY / RENT & FEATURED tags */}
//                         <div className="absolute bottom-0 left-0">
//                           <span
//                             className={`text-white text-xs px-3 py-1 rounded-se-lg ${property.property_category_type === "Buy"
//                               ? "bg-green-500"
//                               : property.property_category_type === "Rent"
//                                 ? "bg-blue-500"
//                                 : "bg-gray-500"
//                               }`}
//                           >
//                             {property.property_category_type === "Buy"
//                               ? "FOR BUY"
//                               : property.property_category_type === "Rent"
//                                 ? "FOR RENT"
//                                 : "UNKNOWN"}
//                           </span>
//                         </div>
//                         <div className="absolute bottom-0 right-0">
//                           {property.mark_as_featured === "Yes" && (
//                             <span className="px-3 py-1 text-xs text-white bg-yellow-500 rounded-ss-lg">
//                               FEATURED
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Property Details */}
//                       <div className="p-4 text-black bg-white">
//                         <div className="flex items-center justify-between">
//                           <h3 className="text-lg font-semibold truncate">
//                             {property.property_name}
//                           </h3>
//                         </div>
//                         <div className="flex flex-wrap pt-1 text-sm">
//                           <div className="flex flex-wrap items-center w-full space-x-6">
//                             {property.property_category_type === "Rent" ? (
//                               property.rent ? (
//                                 <p className="flex items-center text-base">
//                                   <FaRupeeSign className="mr-1 text-base text-blue-600" />
//                                   {formatPrice(property.rent)}
//                                   {property.rent_duration && (
//                                     <span className="ml-1 text-sm text-gray-500">
//                                       / {property.rent_duration}
//                                     </span>
//                                   )}
//                                 </p>
//                               ) : (
//                                 <p className="flex items-center opacity-0">&nbsp;</p>
//                               )
//                             ) : property.property_price ? (
//                               <p className="flex items-center text-base">
//                                 <FaRupeeSign className="mr-1 text-base text-purple-600" />
//                                 {formatPrice(property.property_price)}
//                               </p>
//                             ) : (
//                               <p className="flex items-center opacity-0">&nbsp;</p>
//                             )}

//                             {property.bhk_type ? (
//                               <p className="flex items-center text-base">
//                                 <BsHouseDoorFill className="mr-1 text-base text-purple-600" />
//                                 {property.bhk_type}
//                               </p>
//                             ) : (
//                               <p className="flex items-center opacity-0">&nbsp;</p>
//                             )}

//                             {property.area_sq ? (
//                               <p className="flex items-center text-base">
//                                 <BiShapeSquare className="mr-1 text-base text-purple-600" />
//                                 {property.area_sq} sq.ft
//                               </p>
//                             ) : (
//                               <p className="flex items-center opacity-0">&nbsp;</p>
//                             )}
//                           </div>
//                           <div className="flex items-center w-full mt-2">
//                             {property.furnished_type ? (
//                               <p className="flex items-center text-base">
//                                 <FontAwesomeIcon
//                                   icon={faChair}
//                                   className="mr-1 text-purple-600"
//                                 />
//                                 {property.furnished_type}
//                               </p>
//                             ) : (
//                               <p className="flex items-center opacity-0">&nbsp;</p>
//                             )}
//                           </div>
//                         </div>

//                           <p className="flex items-center gap-2 mt-1 text-sm font-bold text-gray-500 truncate" >
//                           <img
//                             src="admin/image/address_icon.png" 
//                             alt="Location Icon"
//                             className="object-contain w-4 h-4"
//                           />
//                           {property.address_area || "No Address Provided"}
//                         </p>
//                         <div className="flex items-center mt-1 mb-0 text-sm truncate">
//                           {/* <div className="p-2 rounded-full bg-slate-100">
//                             <AiOutlineUser className="text-xl text-gray-600" />
//                           </div> */}
//                           <div className="p-2 rounded-full bg-slate-100">
//                             {property.property_owner_image ? (
//                               <img
//                                 src={`${process.env.REACT_APP_API_BASE_URL}/media/${property.property_owner_image}`}
//                                 alt="Owner"
//                                 className="object-cover w-6 h-6 rounded-full"
//                               />
//                             ) : (
//                               <AiOutlineUser className="text-xl text-gray-600" size={25} />
//                             )}
//                           </div>
//                           <div className="flex flex-col ml-2">
//                             <span className="text-sm font-semibold">
//                               {property.connect_to_name}
//                             </span>
//                             <span>{property.user_type}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecentProperties;
