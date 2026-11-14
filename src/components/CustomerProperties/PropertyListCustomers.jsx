import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';

const PropertyListCustomers = () => {
    const [properties, setProperties] = useState([]);
    const [errors, setErrors] = useState({});
    const tableRef = useRef(null); // Reference for DataTable

    useEffect(() => {
        // Fetch properties from API
        axios.get('/geo/list/')
            .then(response => {
                setProperties(response.data);
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                setErrors(error.response?.data || {});
            });
    }, []);

    useEffect(() => {
        // Initialize DataTable after properties are fetched
        if (properties.length > 0) {
            $(tableRef.current).DataTable({
                responsive: true,
                destroy: true, // Destroy existing table before reinitializing
            });
        }
    }, [properties]);

    const handleStatusChange = (status, _id) => {
        setProperties(properties.map(property => 
            property._id === _id ? { ...property, status } : property
        ));
    };

    const getStatusButtonStyle = (status) => {
        switch (status) {
            case 'Approve':
                return { backgroundColor: '#28a745', color: '#fff' };
            case 'Disapprove':
                return { backgroundColor: '#dc3545', color: '#fff' };
            default:
                return { backgroundColor: '#6c757d', color: '#fff' };
        }
    };

    return (
        <div className='mt-28' style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', overflowY: 'auto', height: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Properties</h1>
                {/* <div className="input-group" style={{ width: '300px' }}>
                    <span className="input-group-text" style={{ backgroundColor: 'black', color: '#fff', padding: '10px' }}>
                        <FontAwesomeIcon icon={faSearch} />
                    </span>
                </div> */}
            </div>
            <div className="bg-gray-200" style={{ backgroundColor: "#fff" }}>
                <table ref={tableRef} className="table mt-3 table-striped" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '16px' }}>
                    <thead className="thead-dark" style={{ backgroundColor: '#0056b3', color: '#fff' }}>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Actions</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map(property => (
                            <tr key={property._id}>
                                <td>
                                    <img
                                        src={property.cover_image?.url || 'https://easyprops.com/Content/Custom/images/default-no-image.png'}
                                        alt={property.property_name}
                                        style={{ width: '100px', height: 'auto', borderRadius: '5px' }}
                                    />
                                </td>
                                <td>
                                    {property.property_name}
                                </td>
                                <td>
                                    {property.property_price}
                                </td>
                                <td>
                                    {property.address}
                                </td>
                                <td>
                                    {property.city_name}
                                </td>
                                <td>
                                    <Link to={`/details/${property._id}`} style={{ marginRight: '10px', textDecoration: 'none', color: '#007bff', fontSize: '14px' }}>
                                        Details
                                    </Link>
                                </td>
                                <td>
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-secondary dropdown-toggle"
                                            type="button"
                                            id={`dropdownMenuButton-${property._id}`}
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            style={{ ...getStatusButtonStyle(property.status || 'Disapprove'), borderRadius: '5px', fontSize: '14px' }}
                                        >
                                            {property.status || 'Disapprove'}
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${property._id}`}>
                                            <li>
                                                <a className="dropdown-item" href="#" onClick={() => handleStatusChange('Approve', property._id)} style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                                                    Approve
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item" href="#" onClick={() => handleStatusChange('Disapprove', property._id)} style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                                    Disapprove
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyListCustomers;
