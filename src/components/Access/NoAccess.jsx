import React from "react";
import { ShieldOff } from "lucide-react";

const NoAccess = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center">
      <ShieldOff size={48} className="mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-700">No Access</h2>
      <p className="mt-2 text-gray-500">
        Your role doesn't have permission to view this page. Contact your Super Admin if you think this is a mistake.
      </p>
    </div>
  );
};

export default NoAccess;