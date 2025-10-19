// API service for connecting to the backend
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token and user validation
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user context to requests for backend filtering
    if (userId && userRole === 'student') {
      config.headers['X-User-ID'] = userId;
      config.headers['X-User-Role'] = userRole;
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
          // Refresh failed, clear auth data and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          localStorage.removeItem("name");
          localStorage.removeItem("email");
          window.location.href = "/login";
        }
      } else {
        // No refresh token, clear auth data and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        window.location.href = "/login";
      }
    }
    
    // Handle 403 Forbidden (user trying to access data they shouldn't)
    if (error.response?.status === 403) {
      console.error("Access denied: User does not have permission to access this data");
      // Optionally redirect to login or show error message
      window.location.href = "/login";
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

  // AI Chat
  sendChatMessage: (message: string, history: Array<{ role: string; content: string }>) => {
    // Generate a conversation ID for the current session
    const conversationId = localStorage.getItem("chatConversationId") || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("chatConversationId", conversationId);
    
    return api.post("/ai/chat/", { 
      conversation_id: conversationId,
      text: message,
      history: history 
    });
  },

  // Notifications
  getNotifications: () =>
    api.get("/document-requests/student/notifications/"),

  markNotificationAsRead: (id: string) => {
    // Backend doesn't support marking notifications as read
    // Return a mock success response
    return Promise.resolve({ data: { success: true } });
  },

  deleteNotification: (id: string) => {
    // Backend doesn't support deleting notifications
    // Return a mock success response
    return Promise.resolve({ data: { success: true } });
  },

  // Document Requests
  createDocumentRequest: (data: any) =>
    api.post("/document-requests/", data),

  // Student Profile
  getStudentProfile: () =>
    api.get("/auth/me/"),

  updateStudentProfile: (data: any) =>
    api.patch("/auth/me/", data),

  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    api.post("/auth/change-password/", data),
};

export default api;
