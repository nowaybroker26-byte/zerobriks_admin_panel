import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faUser, faBriefcase, faMapMarkerAlt, faCheckCircle, faExclamationCircle, faCogs, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { FaTrophy } from "react-icons/fa";
const DeveloperList = () => {
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }
      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        info: true,
        lengthChange: true,
      });
    }
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/top_developers`);
      if (!response.ok) throw new Error("Failed to fetch data.");

      const result = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        const approvedDevelopers = result.data.filter(dev => dev.approval_status === "Approved");
        setApprovedCount(approvedDevelopers.length);
        setCustomers(result.data);
      } else {
        setErrors("No data available.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrors("Failed to fetch data.");
    }
  };

  const handleApproval = async (newStatus, _id) => {
    if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      try {
        setSuccess("");
        setErrors("");
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/update_developer_status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: _id, approval_status: newStatus }),
        });

        if (!response.ok) throw new Error("Failed to update status.");
        fetchCustomers();
        setSuccess(`The user's status has been successfully updated to ${newStatus}.`);
      } catch (error) {
        console.error("Error updating status:", error);
        setErrors("Failed to update status.");
      }
    }
  };

  const handlePriorityChange = async (event, _id) => {
    const newPriority = event.target.value;
    try {
      setSuccess("");
      setErrors("");
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/update_developer_status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: _id, priority_count: newPriority }),
      });

      if (!response.ok) throw new Error("Failed to update priority.");
      fetchCustomers();
      setSuccess("Priority successfully updated.");
    } catch (error) {
      console.error("Error updating priority:", error);
      setErrors("Failed to update priority.");
    }
  };

  return (
    <div className="container-fluid mt-28 w-100">
      {errors && <div className="alert alert-danger">{errors}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="p-2 bg-white border rounded shadow-lg">
        <div>
          <h4 className="p-2 mr-2 text-center bg-white border rounded shadow-sm h4">
            <FontAwesomeIcon icon={faTrophy} className="mr-2" /> Top Developer
          </h4>
        </div>

        <div>
          <table
            id="dataTable"
            className="table mt-3 table-striped table-bordered"
            style={{ borderCollapse: "collapse", border: "2px solid #B0C4DE" }}
          >
            <thead style={{ backgroundColor: "#0056b3", color: "#fff" }}>
              <tr>
                <th>#</th>
                <th><FontAwesomeIcon icon={faImage} className="mr-2" />Brand Image</th>
                <th><FontAwesomeIcon icon={faUser} className="mr-2" />Name</th>
                <th><FontAwesomeIcon icon={faBriefcase} className="mr-2" />Designation</th>
                <th><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />Address</th>
                <th><FontAwesomeIcon icon={faCheckCircle} className="mr-2" />Status</th>
                <th><FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />Priority</th>
                <th><FontAwesomeIcon icon={faCogs} className="mr-2" />Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer, index) => (
                  <tr key={customer._id}>
                    <td>{index + 1}</td>
                    <td className="justify-content-center align-items-center">
                      <img
                        src={`${process.env.REACT_APP_API_BASE_URL}${customer.brand_img}`}
                        alt={customer.developer_name}
                        className="object-cover w-16 h-16 mr-4 rounded-full"
                      />
                    </td>
                    <td>{customer.developer_name}</td>
                    <td>{customer.designation || "N/A"}</td>
                    <td>{customer.address || "N/A"}</td>
                    <td
                      className={`h6 text-center ${customer.approval_status === "Pending"
                          ? "text-info"
                          : customer.approval_status === "Approved"
                            ? "text-success"
                            : "text-danger"
                        }`}
                    >
                      {customer.approval_status === "Pending" ? (
                        <>
                          ⏳ Pending
                        </>
                      ) : customer.approval_status === "Approved" ? (
                        <>
                          ✔ Approved
                        </>
                      ) : (
                        <>
                          ✘ Disapproved
                        </>
                      )}
                    </td>


                    <td>
                      {customer.approval_status === "Approved" ? (
                        <select
                          className="form-select"
                          value={customer.priority_count || ""}
                          onChange={(event) => handlePriorityChange(event, customer._id)}
                        >
                          <option value="">Set Priority</option>
                          {[...Array(approvedCount).keys()].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="h6 text-center">
                      {customer.approval_status === "Pending" ? (
                        <div>
                          <button
                            className="btn btn-success mr-2"
                            onClick={() => handleApproval("Approved", customer._id)}
                          >
                            ✔
                          </button>
                          <button
                            className="btn btn-danger mr-2"
                            onClick={() => handleApproval("Disapproved", customer._id)}
                          >
                            ✘
                          </button>
                        </div>
                      ) : customer.approval_status === "Approved" ? (
                        <button
                          className="btn btn-danger mr-2"
                          onClick={() => handleApproval("Disapproved", customer._id)}
                        >
                          ✘
                        </button>
                      ) : (
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => handleApproval("Approved", customer._id)}
                        >
                          ✔
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeveloperList;
