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

  // User Profile (works for all roles)
  getUserProfile: () =>
    api.get("/auth/me/"),

  updateProfile: (data: any) =>
    api.patch("/auth/me/update/", data),

  changePassword: (data: { current_password: string; new_password: string; confirm_password?: string }) =>
    api.post("/auth/change-password/", data),
  
  // Backwards compatibility aliases
  getStudentProfile: () =>
    api.get("/auth/me/"),

  updateStudentProfile: (data: any) =>
    api.patch("/auth/me/update/", data),

  // ============================================
  // REGISTRAR ENDPOINTS
  // ============================================
  
  // Registrar: Get all document requests (with filters)
  registrar: {
    getRequests: (params?: { status?: string; document_type?: string; payment_status?: string; search?: string }) =>
      api.get("/document-requests/", { params }),
    
    // Get pending requests (ONLY payment approved, waiting for registrar approval)
    // This endpoint checks action records to ensure payment is ACTUALLY approved
    getPendingApprovals: () =>
      api.get("/document-requests/registrar/pending/"),
    
    // Approve document request (triggers auto-scheduling)
    approveRequest: (id: string) =>
      api.post(`/document-requests/${id}/approve/`),
    
    // Reject document request
    rejectRequest: (id: string, data: { reason: string }) =>
      api.post(`/document-requests/${id}/reject/`, data),
    
    // Get all claiming appointments
    getAppointments: (params?: { status?: string; date?: string }) =>
      api.get("/appointments/", { params }),
    
    // Mark appointment as claimed
    markAsClaimed: (id: number) =>
      api.patch(`/appointments/${id}/status/`, { status: 'claimed' }),
    
    // Mark appointment as no-show
    markAsNoShow: (id: number) =>
      api.patch(`/appointments/${id}/status/`, { status: 'no_show' }),
    
    // Schedule management
    getSchedule: () =>
      api.get("/appointments/schedule/"),
    
    addTimeSlot: (data: { day: string; start_time: string; end_time: string; slots_per_hour: number; is_active: boolean }) =>
      api.post("/appointments/schedule/", data),
    
    updateTimeSlot: (id: string, data: any) =>
      api.patch(`/appointments/schedule/${id}/`, data),
    
    deleteTimeSlot: (id: string) =>
      api.delete(`/appointments/schedule/${id}/`),
    
    // Dashboard stats
    getDashboardStats: () =>
      api.get("/document-requests/registrar/stats/"),
  },

  // ============================================
  // FINANCE ENDPOINTS
  // ============================================
  
  // Finance: Get all payments
  finance: {
    getPayments: (params?: { status?: string; search?: string }) =>
      api.get("/document-requests/", { params }),
    
    // Get pending payment verifications (ONLY not yet approved)
    // This endpoint checks action records to exclude already-approved payments
    getPendingVerifications: () =>
      api.get("/document-requests/finance/pending/"),
    
    // Approve payment
    approvePayment: (id: string) =>
      api.post(`/document-requests/${id}/approve-payment/`),
    
    // Reject payment
    rejectPayment: (id: string, data: { reason: string }) =>
      api.post(`/document-requests/${id}/reject-payment/`, data),
    
    // Get financial reports
    getReports: (params?: { date_range?: string; report_type?: string }) =>
      api.get("/document-requests/finance/reports/", { params }),
    
    // Dashboard stats
    getDashboardStats: () =>
      api.get("/document-requests/finance/stats/"),
    
    // Export payments
    exportPayments: (format: 'csv' | 'excel' = 'csv') =>
      api.get(`/document-requests/finance/export/?format=${format}`, {
        responseType: 'blob'
      }),
  },

  // ============================================
  // FACULTY ENDPOINTS
  // ============================================
  
  faculty: {
    // Dashboard stats
    getDashboardStats: () =>
      api.get("/appointments/faculty/stats/"),
    
    // Get faculty appointments (filtered by faculty user)
    getAppointments: (params?: { status?: string; date?: string }) =>
      api.get("/appointments/", { params }),
    
    // Update appointment status
    updateAppointmentStatus: (id: number, data: { status: string }) =>
      api.patch(`/appointments/${id}/status/`, data),
    
    // Get students advised by this faculty member
    getStudents: () =>
      api.get("/appointments/faculty/students/"),
    
    // Get faculty reports
    getReports: (params?: { date_range?: string }) =>
      api.get("/appointments/faculty/reports/", { params }),
    
    // Get faculty notifications
    getNotifications: () =>
      api.get("/appointments/faculty/notifications/"),
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================
  
  admin: {
    // Dashboard statistics
    getDashboardStats: () =>
      api.get("/auth/admin/stats/"),
    
    // User management
    getUsers: (params?: { role?: string; status?: string; search?: string }) =>
      api.get("/auth/admin/users/", { params }),
    
    getUserDetail: (id: number) =>
      api.get(`/auth/admin/users/${id}/`),
    
    createUser: (data: {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role: string;
    }) =>
      api.post("/auth/admin/users/create/", data),
    
    updateUser: (id: number, data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      role?: string;
      is_active?: boolean;
      password?: string;
    }) =>
      api.patch(`/auth/admin/users/${id}/update/`, data),
    
    deleteUser: (id: number) =>
      api.delete(`/auth/admin/users/${id}/delete/`),
    
    // Activity logs
    getActivityLogs: (params?: { limit?: number; action_type?: string }) =>
      api.get("/auth/admin/logs/", { params }),
    
    // System reports
    getSystemReports: () =>
      api.get("/auth/admin/reports/"),
    
    // Access all document requests (admin can see everything)
    getAllRequests: (params?: { status?: string; document_type?: string; search?: string }) =>
      api.get("/document-requests/", { params }),
    
    // Access all appointments (admin can see everything)
    getAllAppointments: (params?: { status?: string; date?: string }) =>
      api.get("/appointments/", { params }),
    
    // System settings
    getSettings: () =>
      api.get("/auth/admin/settings/"),
    
    updateSettings: (settings: any) =>
      api.post("/auth/admin/settings/update/", settings),
    
    resetSettings: () =>
      api.post("/auth/admin/settings/reset/"),
  },
};

export default api;
