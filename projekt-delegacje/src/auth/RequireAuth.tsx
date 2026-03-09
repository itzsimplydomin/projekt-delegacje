import { Navigate } from 'react-router-dom';
import { getToken } from '../api/client';
import type { ReactNode } from 'react';

interface RequireAuthProps {
    children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
    const token = getToken();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;