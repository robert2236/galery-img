import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthApi } from '../Auth';

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthApi);

  return auth ? children : <Navigate to="/" />;
};

export default PrivateRoute;