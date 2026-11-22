import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faEye,
  faIdBadge,
  faSearch,
  faCity,
} from "@fortawesome/free-solid-svg-icons";
import UserTrackingModal from "../Customers/UserTrackingModal";

const getCustomerId = (item) => {
  if (item?.customer_id && String(item.customer_id).trim()) {
    return String(item.customer_id).trim().toUpperCase();
  }
  const rawId = String(item?._id || item?.id || "");
  return `ZB-CU-${rawId.slice(-6).toUpperCase() || "000000"}`;
};

const CategoryUsersList = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState("");
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useParams();

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchItems = async () => {
    try {
      setErrors("");
      const response = await axios.post(
        `${EP.API_GET_USERS}`,
        {
          user_type: user,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response;

      if (result.data.status === 1 && Array.isArray(result.data.data)) {
        const customersWithDefaultStatus = result.data.data.map((customer) => ({
          ...customer,
          customer_id: getCustomerId(customer),
          status: customer.status || "Active",
        }));
        setItems(customersWithDefaultStatus);
      } else {
        setItems([]);
      }
    } catch (error) {
      setErrors("Failed to fetch customers.");
      setItems([]);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const cid = getCustomerId(item).toLowerCase();
      const name = String(item.full_name || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const mobile = String(item.mobile_number || "").toLowerCase();
      const city = String(item.city || "").toLowerCase();
      return (
        cid.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        city.includes(q)
      );
    });
  }, [items, searchQuery]);

  const handleItemClick = (id) => {
    navigate(`/properties/${id}`);
  };

  if (isTrackingModalOpen && selectedUserForTracking) {
    return (
      <UserTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        user={selectedUserForTracking}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {errors && <div className="alert alert-danger">{errors}</div>}

      <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 m-0 flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="text-[#7A0E2E]" />
            <span>{user === "Agent" ? "Tenant" : user} List</span>
          </h4>

          <div className="relative w-full sm:w-80">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 text-xs absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (ZB-CU-2B379E), Name, Mobile..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#7A0E2E]"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="table table-hover align-middle border-separate border-spacing-0 w-full">
            <thead style={{ backgroundColor: "#7A0E2E", color: "#fff" }}>
              <tr>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faIdBadge}
                    className="mr-1.5 text-amber-300"
                  />
                  Customer ID
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mr-1.5 text-amber-300"
                  />
                  Full Name
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mr-1.5 text-amber-300"
                  />
                  Email
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="mr-1.5 text-amber-300"
                  />
                  Mobile Number
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faCity}
                    className="mr-1.5 text-amber-300"
                  />
                  City
                </th>
                <th
                  className="py-3 px-3 text-xs font-semibold uppercase text-center text-white"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  <FontAwesomeIcon
                    icon={faEye}
                    className="mr-1.5 text-amber-300"
                  />
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? (
                filteredItems.map((item) => {
                  const cid = getCustomerId(item);
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-amber-50/40 cursor-pointer"
                      onClick={() => {
                        setSelectedUserForTracking(item);
                        setIsTrackingModalOpen(true);
                      }}
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-rose-50 text-[#7A0E2E] border border-[#7A0E2E]/20">
                          {cid}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-gray-900">
                        {item.full_name || "User"}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {item.email || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-gray-800">
                        {item.mobile_number || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-700">
                        {item.city || "Pune"}
                      </td>
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                            style={{ backgroundColor: "#7A0E2E" }}
                            onClick={() => {
                              setSelectedUserForTracking(item);
                              setIsTrackingModalOpen(true);
                            }}
                          >
                            Track User
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm text-xs py-1 px-2.5"
                            onClick={() => handleItemClick(item._id)}
                          >
                            View Properties
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-xs text-gray-500">
                    No {user} available
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

export default CategoryUsersList;
