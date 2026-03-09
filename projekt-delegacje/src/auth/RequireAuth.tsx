import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

interface RequireAuthProps {
    children: ReactNode;
}

/**
 * Chroni trasy wymagające zalogowania.
 * Sprawdza AuthContext (który weryfikuje exp tokena) zamiast
 * samej obecności stringa w storage.
 * Po wylogowaniu zapamiętuje bieżącą ścieżkę i przekierowuje
 * tam po ponownym zalogowaniu.
 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;