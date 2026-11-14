import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaList, FaPlus, FaBuilding, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

const Description = () => {
  const [category, setCategory] = useState("Apartment");
  const [fetchedDescriptions, setFetchedDescriptions] = useState([]);
  const [description, setDescription] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const categories = [
    "Apartment",
    "Plot",
    "Flat",
    "Independent House",
    "Villa",
    "Office",
    "Retail Shop",
    "Warehouse",
    "Vacation Home",
    "Hostel",
    "Independent Floor",
  ];

  useEffect(() => {
    if (category) {
      fetchDescriptions();
    }
  }, [category]);

  const fetchDescriptions = async () => {
    if (!category) {
      setError("Please select a category to fetch the descriptions.");
      setFetchedDescriptions([]);
      return;
    }

    setFetchLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/get_descriptions`,
        { category_type: category }
      );

      if (response.status === 200) {
        const fetchedData = response.data.data;

        if (fetchedData.length > 0) {
          setFetchedDescriptions(fetchedData);
        } else {
          setFetchedDescriptions([]);
          setError("No descriptions found for this category.");
        }
      } else {
        setError("Failed to fetch descriptions. Please try again.");
        setFetchedDescriptions([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("An error occurred while fetching the descriptions.");
      setFetchedDescriptions([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddDescription = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!category || !description) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/add_description`,
        { category_type: category, description: description }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess("Description added successfully!");
        setDescription("");
        fetchDescriptions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to add description. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("An error occurred while adding the description.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteDescription = async () => {
    if (!deleteConfirmationId) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/cust_api/delete_description`,
        {
          data: { description_id: deleteConfirmationId },
        }
      );

      if (response.status === 200) {
        setSuccess("Description deleted successfully!");
        fetchDescriptions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to delete description. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("An error occurred while deleting the description.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteConfirmationId(null);
    }
  };

  const confirmDelete = (descriptionId) => {
    setDeleteConfirmationId(descriptionId);
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  return (
    <div className="container-fluid mt-28 w-100">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
  
      <div className="p-2 bg-white border rounded shadow-lg">
        <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm">
        <FontAwesomeIcon icon={faList} className="me-2" /> Descriptions Settings
        </h4>
         
        <div className="card shadow-lg mb-4">
          <div className="card-body">
            <button
              className="btn btn-primary d-flex align-items-center gap-2 float-end"
              data-bs-toggle="offcanvas"
              data-bs-target="#addDescriptionOffcanvas"
            >
              <FaPlus /> Add Description
            </button>
  
            {/* Offcanvas Sidebar */}
            <div className=" mt-28 offcanvas offcanvas-end custom-offcanvas rounded" 
            id="addDescriptionOffcanvas"
            style={{ width: "40%" }}>
              <div className="offcanvas-header custom-offcanvas-header">
                <FaPlus className="me-2"/>
                <h5 className="offcanvas-title ">
                  Add Description</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div className="offcanvas-body">
                <form onSubmit={handleAddDescription}>
                  <div className="mb-8">
                    <label htmlFor="category" className="form-label">
                      Select Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="" disabled>
                        Choose a category
                      </option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-control"
                      rows="4"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Submit Description
                  </button>
                </form>
              </div>
            </div>
  
            {/* Fetch Category Dropdown */}
            <div className="mb-5">
              <label htmlFor="fetch-category" className="form-label d-flex">
                <FaBuilding className="me-2" /> Select Category
              </label>
              <select
                id="fetch-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select form-control col-md-4"
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Displaying Descriptions */}
            {fetchLoading ? (
              <div className="alert alert-info mt-3">Loading...</div>
            ) : (
              <ul className="list-group mt-3">
                {fetchedDescriptions.map((desc) => (
                  <li
                    key={desc._id}
                    className="list-group-item d-flex justify-content-between shadow-md mb-5 align-items-center p-3"
                  >
                    <span>{desc.description}</span>
                    {deleteConfirmationId === desc._id ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-danger btn-sm d-flex me-2"
                          onClick={handleDeleteDescription}
                        >
                          <FaCheck className="me-2"/> Confirm
                        </button>
                        <button
                          className="btn btn-secondary btn-sm d-flex"
                          onClick={cancelDelete}
                        >
                          <FaTimes className="me-2"/> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => confirmDelete(desc._id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Description;
