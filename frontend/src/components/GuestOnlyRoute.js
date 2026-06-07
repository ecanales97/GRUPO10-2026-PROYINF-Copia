import { Outlet, Navigate } from "react-router-dom";

import { useAuth } from "context/authContext";

import PATH from "config/paths";

const GuestOnlyRoute = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return <Navigate to={PATH.index.build()} replace />
    return <Outlet />
}

export default GuestOnlyRoute;