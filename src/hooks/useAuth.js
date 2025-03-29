import { useState, useEffect } from "react";
import {
  validateToken,
  getToken,
  storeTokens,
  removeTokens,
  parseJwt,
} from "../utils/auth";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount and when token changes
  useEffect(() => {
    checkAuth();
  }, []);

  const parseAndSetUserData = (token) => {
    const decodedToken = parseJwt(token);
    if (decodedToken) {
      const {
        sub,
        userId,
        scopes,
        sessionId,
        exp,
        iss,
        iat,
        enabled,
        isPublic,
        tenantId,
        customerId,
      } = decodedToken;

      setUserData({
        email: sub,
        userId,
        scopes,
        sessionId,
        exp,
        iss,
        iat,
        enabled,
        isPublic,
        tenantId,
        customerId,
        isAdmin: scopes.includes("TENANT_ADMIN"),
      });
    }
    return decodedToken;
  };

  const checkAuth = () => {
    setLoading(true);
    const isValid = validateToken();
    setIsAuthenticated(isValid);

    if (isValid) {
      const token = getToken();
      parseAndSetUserData(token);
    } else {
      setUserData(null);
      removeTokens();
    }
    setLoading(false);
  };

  const login = async (token, refreshToken) => {
    storeTokens(token, refreshToken);
    const decodedToken = parseAndSetUserData(token);
    if (decodedToken) {
      setIsAuthenticated(true);
    } else {
      throw new Error("Invalid token format");
    }
  };

  const logout = () => {
    removeTokens();
    setIsAuthenticated(false);
    setUserData(null);
  };

  return {
    isAuthenticated,
    userData,
    loading,
    login,
    logout,
    checkAuth,
  };
};
