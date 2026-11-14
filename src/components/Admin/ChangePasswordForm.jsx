import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faKey, faCog } from "@fortawesome/free-solid-svg-icons";

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/change-password/`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSuccess(response.data.detail || "Password changed successfully!");
      setError("");
      setShowSuccessModal(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "An error occurred. Please try again.";
      setError(errorMessage);
      setSuccess("");
    }
  };

  const handleConfirmReLogin = () => {
    // Redirect to login page
    navigate("/");
  };

  return (
    <>
      <div className="w-100 container-fluid mt-28">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="p-2 bg-white border rounded shadow-lg">
          <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
            <FontAwesomeIcon icon={faCog} className=" mr-2" />
            Change Password
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="mb-3 col-md-6 position-relative">
                <label
                  htmlFor="oldPassword"
                  className="form-label font-weight-bold"
                >
                  <FontAwesomeIcon icon={faLock} className=" mr-2" />
                  Old Password
                  <sup className="text-danger">*</sup>
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-control ps-5"
                  placeholder="Old Password"
                  required
                />
              </div>
              <div className="mb-3 col-md-6 position-relative">
                <label
                  htmlFor="newPassword"
                  className="form-label font-weight-bold"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2" />
                  New Password <sup className="text-danger">*</sup>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control ps-5"
                  placeholder="New Password"
                  required
                />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="btn btn-primary">
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">
              Password Changed Successfully
            </h2>
            <p className="mb-4 text-gray-700">
              Please log in again with your new password.
            </p>
            <button
              onClick={handleConfirmReLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordForm;
