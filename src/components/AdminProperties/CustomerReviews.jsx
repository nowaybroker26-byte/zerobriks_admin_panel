import { EP, API_BASE_URL } from '../../Api/endpoints';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTasks } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClick = (activity_id, type) => {
    if (type === "PurchasePlan") {
      navigate(`/plans-purchase-history`);
    } else if (type === "Property") {
      navigate(`/property-details/${activity_id}`);
    } else if (type === "Feedback") {
      navigate(`/feedbacks`);
    } else if (type === "Enquiry") {
      navigate(`/inquiry`);
    } else if (type === "User") {
      navigate(`/customers`);
    }
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `${EP.API_GET_ACTIVITIES}`
        );
        if (response.data.status === 1) {
          setReviews(response.data.data); // Set feedbacks data
        } else {
          setError("Failed to fetch feedbacks");
        }
      } catch (error) {
        console.error("There was an error fetching the feedbacks!", error);
        setError("There was an error fetching the feedbacks");
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="container-fluid w-100 mt-28">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Breadcrumb aligned right */}
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
              Recent Activities Page
            </span>
          </li>
        </ol>
      </nav>

      <div className="p-2 bg-white border rounded shadow-lg">
        <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
          <FontAwesomeIcon
            icon={faTasks}
            style={{ color: "blue", marginRight: "10px" }}
          />
          Recent Activities
        </h4>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((reviewData, index) => (
            <div
              key={index}
              className="p-6 transition-shadow duration-300 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl"
            >
              <div className="text-end">
                <button
                  className="btn text-primary"
                  onClick={() =>
                    handleClick(reviewData.activity_id, reviewData.type)
                  }
                >
                  View Details
                </button>
              </div>
              <div className="flex items-center mb-4">
                {reviewData.user_profile ? (
                  <img
                    src={`${API_BASE_URL}/media/${reviewData.user_profile}`}
                    alt={reviewData.username || "User"}
                    className="object-cover w-12 h-12 mr-4 rounded-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-10 h-10 mr-4 text-gray-500"
                  />
                )}
                <div>
                  <h2 className="text-xl font-medium text-gray-700">
                    {reviewData.username}
                  </h2>
                </div>
              </div>
              <p className="text-lg text-gray-600">
                {reviewData.sentance + ": " + reviewData.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
