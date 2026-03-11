import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken, setToken } from '../api/client';

// Typy i interfejsy
export interface AuthUser {
    email: string;
    role: 'Admin' | 'User';
}

interface AuthContextValue {
    user: AuthUser | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
}

// Helpery do dekodowania tokena i zarządzania sesją

/**
 * Dekoduje payload JWT bez weryfikacji podpisu (weryfikacja po stronie backendu).
 * Zwraca null gdy token jest nieważny lub wygasł.
 */
function decodeToken(token: string): AuthUser | null {
    try {
        const payloadB64 = token.split('.')[1];
        if (!payloadB64) return null;

        const payload = JSON.parse(atob(payloadB64));

        // Sprawdź wygaśnięcie (exp w sekundach UNIX)
        if (payload.exp && Date.now() / 1000 > payload.exp) return null;

        const email: string =
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
            payload.name ??
            payload.email ??
            '';

        const roleRaw: string =
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
            payload.role ??
            'User';

        const role: 'Admin' | 'User' = roleRaw === 'Admin' ? 'Admin' : 'User';

        if (!email) return null;

        return { email, role };
    } catch {
        return null;
    }
}

/**
 * Odczytuje token ze storage i zwraca dane użytkownika lub null.
 */
function getUserFromStorage(): AuthUser | null {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
}

// Context 

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(() => getUserFromStorage());

    // Sprawdzaj wygaśnięcie tokena co minutę
    useEffect(() => {
        const interval = setInterval(() => {
            const current = getUserFromStorage();
            if (!current && user) {
                // Token wygasł podczas aktywnej sesji
                removeToken();
                setUser(null);
                navigate('/', { replace: true });
            }
        }, 60_000);

        return () => clearInterval(interval);
    }, [user, navigate]);

    const login = useCallback((token: string, remember: boolean) => {
        setToken(token, remember);
        const decoded = decodeToken(token);
        setUser(decoded);
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        navigate('/', { replace: true });
    }, [navigate]);

    const value: AuthContextValue = {
        user,
        isAdmin: user?.role === 'Admin',
        isAuthenticated: user !== null,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook do korzystania z kontekstu autoryzacji

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}