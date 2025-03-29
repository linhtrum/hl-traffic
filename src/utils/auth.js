// JWT token storage keys
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

// Store tokens in localStorage
export const storeTokens = (token, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

// Remove tokens from localStorage
export const removeTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Get token from localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Parse JWT without external libraries
export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decodedToken = parseJwt(token);
  if (!decodedToken) return true;

  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
};

// Validate token
export const validateToken = () => {
  const token = getToken();
  if (!token) return false;

  return !isTokenExpired(token);
};
