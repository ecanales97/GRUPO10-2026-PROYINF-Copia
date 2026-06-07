import { Outlet, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "context/authContext";

import PATH from "config/paths";

const ClientOnlyRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    
    if (!isAuthenticated) return <Navigate to={PATH.login.build()} replace state={{ from: location, }} />
    return <Outlet />;
}

export default ClientOnlyRoute;