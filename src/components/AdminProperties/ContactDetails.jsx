import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ContactDetails = ({ fullName, mobile, onClose, }) => {


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-sm p-4 bg-white shadow-lg rounded-2xl md:p-8">
        {/* Close Button */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-black hover:text-black">
            <IoCloseCircleOutline size={20} />
          </button>
        </div>

        {/* Conditional Heading */}
        <h2 className="mb-4 text-2xl font-semibold text-center text-gray-900">
          Contact Details
        </h2>


        {/* Input Fields */}
        <div className="flex flex-col gap-4 mb-16">
          <input
            type="text"
            value={fullName}
            readOnly
            className="w-full p-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
          />
          <input
            type="text"
            value={mobile}
            readOnly
            className="w-full p-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

  
      </div>
    </div>
  );
};

export default ContactDetails;
