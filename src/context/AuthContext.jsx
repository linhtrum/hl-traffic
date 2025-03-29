import { createContext, useContext, useState, useEffect, useRef } from 'react';
import websocketService from '../utils/websocketService';
import { parseJwt, isTokenExpired } from '../utils/jwtUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initializedRef = useRef(false);

    const setUserFromToken = (token) => {
        const userData = parseJwt(token);
        if (userData) {
            setUser({
                email: userData.sub,
                userId: userData.userId,
                scopes: userData.scopes || [],
                sessionId: userData.sessionId,
                tenantId: userData.tenantId,
                customerId: userData.customerId,
                enabled: userData.enabled,
                isPublic: userData.isPublic,
                issuedAt: userData.iat,
                expiresAt: userData.exp,
                issuer: userData.iss
            });
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            if (initializedRef.current) return;
            initializedRef.current = true;

            // Check for existing token on mount
            const token = localStorage.getItem('token');
            if (token) {
                if (isTokenExpired(token)) {
                    // Token is expired, clear it
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    if (mounted) {
                        setUser(null);
                    }
                } else {
                    // Token is valid, set user and connect WebSocket
                    if (mounted) {
                        setUserFromToken(token);
                    }
                    websocketService.connect(token);
                }
            }
            if (mounted) {
                setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async (token, refreshToken) => {
        try {
            setLoading(true);
            setError(null);

            if (isTokenExpired(token)) {
                throw new Error('Token is expired');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            // Set user from token
            setUserFromToken(token);

            // Connect to WebSocket after successful login
            websocketService.connect(token);

            return true;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        // Disconnect WebSocket on logout
        websocketService.disconnect();
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
} 