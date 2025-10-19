// API service for connecting to the backend
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh the token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem("accessToken", access);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const apiService = {
  // Authentication
  login: (email: string, password: string, role: string) =>
    api.post("/auth/login/", { email, password, role }),

  // Document Requests
  getDocumentRequests: (params?: { status?: string }) =>
    api.get("/document-requests/", { params }),

  getDocumentRequest: (id: string) =>
    api.get(`/document-requests/${id}/`),

  updateDocumentRequestStatus: (id: string, data: {
    status?: string;
    notes?: string;
    schedule?: string;
    payment?: boolean;
    document?: boolean;
  }) =>
    api.patch(`/document-requests/${id}/status/`, data),

  // Receipt viewing
  viewReceipt: (id: string) =>
    api.get(`/document-requests/${id}/receipt/`),

  // Dashboard stats
  getDashboardStats: async () => {
    const requests = await api.get("/document-requests/");
    const data = requests.data;

    const today = new Date().toISOString().split('T')[0];
    const todayRequests = data.filter((req: any) => 
      req.requested_at.startsWith(today)
    ).length;

    const pendingRequests = data.filter((req: any) => 
      ['pending', 'awaiting_payment', 'on_process'].includes(req.status)
    ).length;

    const completedRequests = data.filter((req: any) => 
      ['ready_to_claim', 'cancelled', 'rejected'].includes(req.status)
    ).length;

    return {
      totalRequests: data.length,
      pendingRequests,
      completedRequests,
      todayRequests
    };
  },

  // User management
  getCurrentUser: () =>
    api.get("/auth/me/"),

  // Notifications
  // getNotifications: () =>
  //   api.get("/notifications/"),

  // Export data
  exportRequests: (format: 'csv' | 'excel' = 'csv') =>
    api.get(`/document-requests/export/?format=${format}`, {
      responseType: 'blob'
    }),

  // Appointment Settings
  getAppointmentSettings: () =>
    api.get("/appointments/settings/"),

  updateAppointmentSettings: (settings: any) =>
    api.patch("/appointments/settings/", settings),

  getAppointmentStatistics: () =>
    api.get("/appointments/statistics/"),

  triggerAutomaticScheduling: () =>
    api.post("/appointments/trigger-scheduling/"),

  getNextAvailableSlot: () =>
    api.get("/appointments/next-slot/"),

  debugReadyRequests: () =>
    api.get("/appointments/debug-ready-requests/"),

  // Appointments
  getAppointments: () =>
    api.get("/appointments/"),

  updateAppointmentStatus: (id: number, data: any) =>
    api.patch(`/appointments/${id}/status/`, data),
};

export default api;
