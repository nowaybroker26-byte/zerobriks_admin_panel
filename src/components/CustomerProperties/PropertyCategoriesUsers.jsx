import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import {
  faBuilding, faUser, faStore
} from '@fortawesome/free-solid-svg-icons';
const PropertyCategoriesUsers = () => {
  const navigate = useNavigate();

  const handleClick = (category) => {
    // Navigate to a page with properties for the selected category
    navigate(`/user-type/${category}`);
  };

  return (
    <div className="w-100 container-fluid mt-28">

      <div className="p-2 bg-white border rounded shadow-lg">
        <div>
          <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
            <FontAwesomeIcon icon={faListAlt} style={{ color: 'blue', marginRight: '10px' }} />
            Select a Category
          </h4>
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            {/* Builder List Item */}
            <li
              className="flex items-center justify-between p-6 transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => handleClick('Builder')}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 p-3 mr-4 bg-yellow-100 rounded-full">
                  <FontAwesomeIcon icon={faBuilding} className="text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Builder</h2>
                  <p className="text-sm text-gray-500">Develop and manage real estate projects.</p>
                </div>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </li>

            {/* Owner List Item */}
            <li
              className="flex items-center justify-between p-6 transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => handleClick('Owner')}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 p-3 mr-4 bg-purple-100 rounded-full">
                  <FontAwesomeIcon icon={faUser} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Owner</h2>
                  <p className="text-sm text-gray-500">Explore and find your ideal property.</p>
                </div>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </li>

            {/* Buyer / Tenant List Item */}
            <li
              className="flex items-center justify-between p-6 transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => handleClick('Buyer')}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 p-3 mr-4 bg-blue-100 rounded-full">
                  <FontAwesomeIcon icon={faStore} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Buyer / Tenant</h2>
                  <p className="text-sm text-gray-500">Explore and find properties as a buyer or tenant.</p>
                </div>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </li>

          </ul>
        </div>
      </div>
    </div>

  );
};

export default PropertyCategoriesUsers;
