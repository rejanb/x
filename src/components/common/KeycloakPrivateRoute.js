
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const KeycloakPrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log('KeycloakPrivateRoute:', { isAuthenticated, isLoading });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default KeycloakPrivateRoute;
