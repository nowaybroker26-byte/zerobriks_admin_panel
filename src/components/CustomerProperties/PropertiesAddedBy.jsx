import { EP, API_BASE_URL } from '../../Api/endpoints';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faChair } from "@fortawesome/free-solid-svg-icons";
import { FaRupeeSign, FaCopy } from "react-icons/fa";
import { BsHouseDoorFill } from "react-icons/bs";
import { BiShapeSquare } from "react-icons/bi";

const PropertiesAddedBy = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState("");
  const [activeIndexes, setActiveIndexes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    fetchProperties(1);
  }, []);

  useEffect(() => {
    // Set up Intersection Observer for lazy loading
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && currentPage < totalPages) {
          fetchProperties(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [currentPage, totalPages, isFetching]);

  const fetchProperties = async (page) => {
    setIsFetching(true);
    setErrors("");
    try {
      const response = await axios.post(
        `${EP.CUST_API_GET_LISTING_PROPERTIES}`,
        {
          user_id: user_id,
          page: page.toString(),
          page_size: "8",
        }
      );

      if (response.data.status === 1 && Array.isArray(response.data.data)) {
        setTotalPages(response.data.total_pages);
        setCurrentPage(response.data.current_page);
        setProperties((prevProperties) => [
          ...prevProperties,
          ...response.data.data
        ]);
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setErrors("No data available.");
    } finally {
      setIsFetching(false);
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
    if (!price || isNaN(price)) return "₹0";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`;
    }
    return `₹${price}`;
  };

  const handleViewClick = (property) => {
    navigate(`/property-details/${property._id}`);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2000,
    customPaging: (i) => {
      return (
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: activeIndexes[i] ? "#fff" : "#888",
            margin: "0 5px",
            cursor: "pointer",
          }}
        />
      );
    },
    appendDots: (dots) => (
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
    ),
  };

  return (
    <div className="container-fluid w-100 mx-auto mt-28">
      {errors && <div className="alert alert-danger">{errors}</div>}

      <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 md:space-x-4 text-sm">
          <li>
            <Link
              to="/admin"
              className="text-blue-600 font-medium hover:underline transition-colors"
            >
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <span className="inline-block px-3 py-1 rounded-full text-gray-800 font-bold text-base">
              Properties Added By
            </span>
          </li>
        </ol>
      </nav>

      <div className="p-2 bg-white border rounded shadow-lg">
        <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
          <FontAwesomeIcon icon={faBuilding} className="mr-2" />
          Properties Added By
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {properties.map((property) => {
            const getValidImageUrl = (img) => {
              if (typeof img !== "string" || !img.trim()) return null;
              return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
            };

            const coverImage = getValidImageUrl(property.cover_image);
            const additionalImages = (property.property_images || [])
              .map((imgObj) => getValidImageUrl(imgObj?.image))
              .filter(Boolean);
            const allImages = [...(coverImage ? [coverImage] : []), ...additionalImages];

            return (
              <div key={property._id} className="p-4 box-border">
                <div className="rounded-2xl bg-white overflow-hidden shadow h-full">
                  <div className="relative">
                    <Link to={`/property-details/${property._id}`} className="block">
                      {allImages.length > 1 ? (
                        <Slider
                          key={`${property._id}-${activeIndexes[property._id] || 0}`}
                          {...settings}
                          beforeChange={(current, next) =>
                            setActiveIndexes((prev) => ({ ...prev, [property._id]: next }))
                          }
                          initialSlide={activeIndexes[property._id] || 0}
                          className="rounded-t-2xl"
                        >
                          {allImages.map((imgUrl, idx) => (
                            <div key={`${property._id}-${idx}`}>
                              <img
                                src={imgUrl}
                                alt="Property"
                                className="w-full h-48 object-cover rounded-t-2xl"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </Slider>
                      ) : (
                        <img
                          src={allImages[0] || "https://via.placeholder.com/150"}
                          alt="Property"
                          className="w-full h-48 object-cover rounded-t-2xl"
                          loading="lazy"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                        />
                      )}
                    </Link>
                    <span className="absolute top-2 left-2 bg-gray-800/60 backdrop-blur-sm text-white text-xs font-normal py-1 px-2 rounded-full">
                      {property.days_since_created || "0"} days on Houzza
                    </span>
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <span
                        className={`
                          text-white text-xs font-normal py-1 px-2 rounded-full flex items-center gap-1
                          ${property.admin_approval === "Approved"
                            ? "bg-green-600"
                            : property.admin_approval === "Disapproved"
                            ? "bg-red-600"
                            : "bg-gray-800/60 backdrop-blur-sm"}
                        `}
                      >
                        {property.admin_approval || "Pending"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0">
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-se-lg ${
                          property.property_category_type === "Buy"
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
                        <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-ss-lg">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-white text-black">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold truncate">
                        {truncateText(property.property_name, 10)}
                      </h3>
                    </div>
                    <div className="text-sm flex flex-wrap pt-1">
                      <div className="flex flex-wrap items-center space-x-6 w-full">
                        {property.property_category_type === "Rent" ? (
                          property.rent ? (
                            <p className="flex items-center text-base">
                              <FaRupeeSign className="mr-1 text-blue-600 text-base" />
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
                            <FaRupeeSign className="mr-1 text-purple-600 text-base" />
                            {formatPrice(property.property_price)}
                          </p>
                        ) : (
                          <p className="flex items-center opacity-0">&nbsp;</p>
                        )}
                        {property.bhk_type ? (
                          <p className="flex items-center text-base">
                            <BsHouseDoorFill className="mr-1 text-purple-600 text-base" />
                            {property.bhk_type}
                          </p>
                        ) : (
                          <p className="flex items-center opacity-0">&nbsp;</p>
                        )}
                        {property.area ? (
                          <p className="flex items-center text-base">
                            <BiShapeSquare className="mr-1 text-purple-600 text-base" />
                            {property.area} sq.ft
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
                    <p className="text-base flex items-center truncate mt-2">
                      {truncateText(property.address, 10)}
                    </p>

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
            );
          })}
        </div>
        {currentPage < totalPages && (
          <div ref={loadMoreRef} className="h-10"></div>
        )}
        {isFetching && (
          <div className="text-center mt-4">
            <div className="alert alert-secondary">Loading more properties...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesAddedBy;


// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import axios from "axios";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBuilding, faChair } from "@fortawesome/free-solid-svg-icons";
// import { FaRupeeSign } from "react-icons/fa";
// import { BsHouseDoorFill } from "react-icons/bs";
// import { BiShapeSquare } from "react-icons/bi";

// const PropertiesAddedBy = () => {
//   const { user_id } = useParams();
//   const navigate = useNavigate();
//   const [properties, setProperties] = useState([]);
//   const [errors, setErrors] = useState("");
//   const [activeIndexes, setActiveIndexes] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isFetching, setIsFetching] = useState(false);
//   const observerRef = useRef(null);
//   const loadMoreRef = useRef(null);

//   useEffect(() => {
//     fetchProperties(1);
//   }, []);

//   useEffect(() => {
//     // Set up Intersection Observer for lazy loading
//     if (observerRef.current) observerRef.current.disconnect();

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !isFetching && currentPage < totalPages) {
//           fetchProperties(currentPage + 1);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (loadMoreRef.current) {
//       observerRef.current.observe(loadMoreRef.current);
//     }

//     return () => {
//       if (observerRef.current) observerRef.current.disconnect();
//     };
//   }, [currentPage, totalPages, isFetching]);

//   const fetchProperties = async (page) => {
//     setIsFetching(true);
//     setErrors("");
//     try {
//       const response = await axios.post(
//         `${EP.CUST_API_GET_LISTING_PROPERTIES}`,
//         {
//           user_id: user_id,
//           page: page.toString(),
//           page_size: "8",
//         }
//       );

//       if (response.data.status === 1 && Array.isArray(response.data.data)) {
//         setTotalPages(response.data.total_pages);
//         setCurrentPage(response.data.current_page);
//         setProperties((prevProperties) => [
//           ...prevProperties,
//           ...response.data.data
//         ]);
//       } else {
//         throw new Error("Invalid data format.");
//       }
//     } catch (error) {
//       console.error("Error fetching properties:", error);
//       setErrors("No data available.");
//     } finally {
//       setIsFetching(false);
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
//     if (!price || isNaN(price)) return "₹0";
//     if (price >= 10000000) {
//       return `₹${(price / 10000000).toFixed(1)} Cr`;
//     } else if (price >= 100000) {
//       return `₹${(price / 100000).toFixed(1)} Lakh`;
//     } else if (price >= 1000) {
//       return `₹${(price / 1000).toFixed(1)} K`;
//     }
//     return `₹${price}`;
//   };

//   const handleViewClick = (property) => {
//     navigate(`/property-details/${property._id}`);
//   };

//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: true,
//     autoplay: true,
//     autoplaySpeed: 2000,
//     customPaging: (i) => {
//       return (
//         <div
//           style={{
//             width: "10px",
//             height: "10px",
//             borderRadius: "50%",
//             background: activeIndexes[i] ? "#fff" : "#888",
//             margin: "0 5px",
//             cursor: "pointer",
//           }}
//         />
//       );
//     },
//     appendDots: (dots) => (
//       <div
//         style={{
//           position: "absolute",
//           bottom: "10px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           justifyContent: "center",
//           width: "100%",
//         }}
//       >
//         {dots}
//       </div>
//     ),
//   };

//   return (
//     <div className="container-fluid w-100 mx-auto mt-28">
//       {errors && <div className="alert alert-danger">{errors}</div>}

//       <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
//         <ol className="flex flex-wrap items-center space-x-2 md:space-x-4 text-sm">
//           <li>
//             <Link
//               to="/admin"
//               className="text-blue-600 font-medium hover:underline transition-colors"
//             >
//               Home
//             </Link>
//           </li>
//           <li className="text-gray-400">/</li>
//           <li>
//             <span className="inline-block px-3 py-1 rounded-full text-gray-800 font-bold text-base">
//               Properties Added By
//             </span>
//           </li>
//         </ol>
//       </nav>

//       <div className="p-2 bg-white border rounded shadow-lg">
//         <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
//           <FontAwesomeIcon icon={faBuilding} className="mr-2" />
//           Properties Added By
//         </h4>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
//           {properties.map((property) => {
//             const getValidImageUrl = (img) => {
//               if (typeof img !== "string" || !img.trim()) return null;
//               return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
//             };

//             const coverImage = getValidImageUrl(property.cover_image);
//             const additionalImages = (property.property_images || [])
//               .map((imgObj) => getValidImageUrl(imgObj?.image))
//               .filter(Boolean);
//             const allImages = [...(coverImage ? [coverImage] : []), ...additionalImages];

//             return (
//               <div key={property._id} className="p-4 box-border">
//                 <div className="rounded-2xl bg-white overflow-hidden shadow h-full">
//                   <div className="relative">
//                     <Link to={`/property-details/${property._id}`} className="block">
//                       {allImages.length > 1 ? (
//                         <Slider
//                           key={`${property._id}-${activeIndexes[property._id] || 0}`}
//                           {...settings}
//                           beforeChange={(current, next) =>
//                             setActiveIndexes((prev) => ({ ...prev, [property._id]: next }))
//                           }
//                           initialSlide={activeIndexes[property._id] || 0}
//                           className="rounded-t-2xl"
//                         >
//                           {allImages.map((imgUrl, idx) => (
//                             <div key={`${property._id}-${idx}`}>
//                               <img
//                                 src={imgUrl}
//                                 alt="Property"
//                                 className="w-full h-48 object-cover rounded-t-2xl"
//                                 loading="lazy"
//                               />
//                             </div>
//                           ))}
//                         </Slider>
//                       ) : (
//                         <img
//                           src={allImages[0] || "https://via.placeholder.com/150"}
//                           alt="Property"
//                           className="w-full h-48 object-cover rounded-t-2xl"
//                           loading="lazy"
//                           onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
//                         />
//                       )}
//                     </Link>
//                     <span className="absolute top-2 left-2 bg-gray-800/60 backdrop-blur-sm text-white text-xs font-normal py-1 px-2 rounded-full">
//                       {property.days_since_created || "0"} days on Houzza
//                     </span>
//                     <div className="absolute top-2 right-2 flex items-center space-x-2">
//                       <span
//                         className={`
//                           text-white text-xs font-normal py-1 px-2 rounded-full flex items-center gap-1
//                           ${property.admin_approval === "Approved"
//                             ? "bg-green-600"
//                             : property.admin_approval === "Disapproved"
//                             ? "bg-red-600"
//                             : "bg-gray-800/60 backdrop-blur-sm"}
//                         `}
//                       >
//                         {property.admin_approval || "Pending"}
//                       </span>
//                     </div>
//                     <div className="absolute bottom-0 left-0">
//                       <span
//                         className={`text-white text-xs px-3 py-1 rounded-se-lg ${
//                           property.property_category_type === "Buy"
//                             ? "bg-green-500"
//                             : property.property_category_type === "Rent"
//                             ? "bg-blue-500"
//                             : "bg-gray-500"
//                         }`}
//                       >
//                         {property.property_category_type === "Buy"
//                           ? "FOR BUY"
//                           : property.property_category_type === "Rent"
//                           ? "FOR RENT"
//                           : "UNKNOWN"}
//                       </span>
//                     </div>
//                     <div className="absolute bottom-0 right-0">
//                       {property.mark_as_featured === "Yes" && (
//                         <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-ss-lg">
//                           FEATURED
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="p-4 bg-white text-black">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-lg font-semibold truncate">
//                         {truncateText(property.property_name, 10)}
//                       </h3>
//                     </div>
//                     <div className="text-sm flex flex-wrap pt-1">
//                       <div className="flex flex-wrap items-center space-x-6 w-full">
//                         {property.property_category_type === "Rent" ? (
//                           property.rent ? (
//                             <p className="flex items-center text-base">
//                               <FaRupeeSign className="mr-1 text-blue-600 text-base" />
//                               {formatPrice(property.rent)}
//                               {property.rent_duration && (
//                                 <span className="ml-1 text-sm text-gray-500">
//                                   / {property.rent_duration}
//                                 </span>
//                               )}
//                             </p>
//                           ) : (
//                             <p className="flex items-center opacity-0">&nbsp;</p>
//                           )
//                         ) : property.property_price ? (
//                           <p className="flex items-center text-base">
//                             <FaRupeeSign className="mr-1 text-purple-600 text-base" />
//                             {formatPrice(property.property_price)}
//                           </p>
//                         ) : (
//                           <p className="flex items-center opacity-0">&nbsp;</p>
//                         )}
//                         {property.bhk_type ? (
//                           <p className="flex items-center text-base">
//                             <BsHouseDoorFill className="mr-1 text-purple-600 text-base" />
//                             {property.bhk_type}
//                           </p>
//                         ) : (
//                           <p className="flex items-center opacity-0">&nbsp;</p>
//                         )}
//                         {property.area ? (
//                           <p className="flex items-center text-base">
//                             <BiShapeSquare className="mr-1 text-purple-600 text-base" />
//                             {property.area} sq.ft
//                           </p>
//                         ) : (
//                           <p className="flex items-center opacity-0">&nbsp;</p>
//                         )}
//                       </div>
//                       <div className="flex items-center w-full mt-2">
//                         {property.furnished_type ? (
//                           <p className="flex items-center text-base">
//                             <FontAwesomeIcon
//                               icon={faChair}
//                               className="mr-1 text-purple-600"
//                             />
//                             {property.furnished_type}
//                           </p>
//                         ) : (
//                           <p className="flex items-center opacity-0">&nbsp;</p>
//                         )}
//                       </div>
//                     </div>
//                     <p className="text-base flex items-center truncate mt-2">
//                       {truncateText(property.address, 10)}
//                     </p>
              
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         {currentPage < totalPages && (
//           <div ref={loadMoreRef} className="h-10"></div>
//         )}
//         {isFetching && (
//           <div className="text-center mt-4">
//             <div className="alert alert-secondary">Loading more properties...</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PropertiesAddedBy;