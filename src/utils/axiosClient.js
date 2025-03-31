import axios from "axios";
import { getToken, removeTokens } from "./auth";

// Create axios instance with custom config
const axiosClient = axios.create({
  baseURL: "https://mqtt.hl-traffic.com", // Base URL for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["X-Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized responses
      if (error.response.status === 401) {
        // Clear tokens and trigger logout
        removeTokens();
        // You might want to redirect to login page or refresh token here
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth-related API calls
export const authApi = {
  login: async (username, password) => {
    return axiosClient.post("/api/auth/login", { username, password });
  },
  getUserProfile: async (userId) => {
    return axiosClient.get(`/api/user/${userId}`);
  },
  updateUserProfile: async (userData) => {
    return axiosClient.post("/api/user?sendActivationMail=false", userData);
  },
  refreshToken: async (refreshToken) => {
    return axiosClient.post("/api/auth/token", { refreshToken });
  },
  changePassword: async (currentPassword, newPassword) => {
    return axiosClient.post("/api/auth/changePassword", {
      currentPassword,
      newPassword,
    });
  },
  // Add other auth-related API calls here
};

// Customer-related API calls
export const customerApi = {
  getCustomers: async (params) => {
    return axiosClient.get("/api/customers", { params });
  },
  createCustomer: async (customerData) => {
    return axiosClient.post("/api/customer", customerData);
  },
  deleteCustomer: async (customerId) => {
    return axiosClient.delete(`/api/customer/${customerId}`);
  },
  getCustomerUsers: async (customerId, params) => {
    return axiosClient.get(`/api/customer/${customerId}/users`, { params });
  },
  createUser: async (userData) => {
    return axiosClient.post("/api/user?sendActivationMail=false", userData);
  },
  updateUser: async (userData) => {
    return axiosClient.post("/api/user", userData);
  },
  deleteUser: async (userId) => {
    return axiosClient.delete(`/api/user/${userId}`);
  },
  getUserToken: async (userId) => {
    return axiosClient.get(`/api/user/${userId}/token`);
  },
  activateUser: async (activateToken, password) => {
    return axiosClient.post("/api/noauth/activate?sendActivationMail=true", {
      activateToken,
      password,
    });
  },
  getUserActivationLink: async (userId) => {
    return axiosClient.get(`/api/user/${userId}/activationLinkInfo`);
  },
  assignDeviceToCustomer: async (customerId, deviceId) => {
    return axiosClient.post(`/api/customer/${customerId}/device/${deviceId}`);
  },
  unassignDevice: async (deviceId) => {
    return axiosClient.delete(`/api/customer/device/${deviceId}`);
  },
};

// Device-related API calls
export const deviceApi = {
  getTenantDevices: async (params) => {
    return axiosClient.get("/api/tenant/deviceInfos", { params });
  },
  getCustomerDevices: async (customerId, params) => {
    return axiosClient.get(`/api/customer/${customerId}/deviceInfos`, {
      params,
    });
  },
  getDefaultProfile: async () => {
    return axiosClient.get("/api/deviceProfileInfo/default");
  },
  getDeviceCredentials: async (deviceId) => {
    return axiosClient.get(`/api/device/${deviceId}/credentials`);
  },
  createDevice: async (deviceData) => {
    return axiosClient.post("/api/device-with-credentials", deviceData);
  },
  updateDevice: async (deviceData) => {
    return axiosClient.post("/api/device", deviceData);
  },
  updateDeviceCredentials: async (credentialsData) => {
    return axiosClient.post("/api/device/credentials", credentialsData);
  },
  getDeviceInfo: async (deviceId) => {
    return axiosClient.get(`/api/device/info/${deviceId}`);
  },
  deleteDevice: async (deviceId) => {
    return axiosClient.delete(`/api/device/${deviceId}`);
  },
  getServerAttributes: async (deviceId) => {
    return axiosClient.get(
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes/SERVER_SCOPE`
    );
  },
  postServerAttributes: async (deviceId, attributes) => {
    return axiosClient.post(
      `/api/plugins/telemetry/DEVICE/${deviceId}/SERVER_SCOPE`,
      attributes
    );
  },
  getSharedAttributes: async (deviceId) => {
    return axiosClient.get(
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes/SHARED_SCOPE`
    );
  },
  postSharedAttributes: async (deviceId, attributes) => {
    return axiosClient.post(
      `/api/plugins/telemetry/DEVICE/${deviceId}/SHARED_SCOPE`,
      attributes
    );
  },
};

// Export the configured axios instance
export default axiosClient;
