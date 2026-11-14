import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { MyContext } from './App';  // Import context from your App component

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(MyContext);

  // Redirect to login page if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
