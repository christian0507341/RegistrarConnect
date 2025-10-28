// Authentication utilities for all user roles

// Check if user is authenticated (any role)
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  
  // Basic validation: check token exists and is not empty
  return !!(token && token.length > 10 && role);
};

// Role-specific authentication checks
export const checkStudentAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  
  console.log('checkStudentAuth called:', {
    hasToken: !!token,
    tokenLength: token?.length,
    role,
    userId,
    result: !!(token && token.length > 10 && role === 'student' && userId)
  });
  
  // Temporarily relax userId requirement for debugging
  return !!(token && token.length > 10 && role === 'student');
};

export const checkAdminAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  
  return !!(token && token.length > 10 && role === 'admin');
};

export const checkRegistrarAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  
  return !!(token && token.length > 10 && role === 'registrar');
};

export const checkFinanceAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  
  return !!(token && token.length > 10 && role === 'finance');
};

export const checkFacultyAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  
  return !!(token && token.length > 10 && role === 'faculty');
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem("userId");
};

export const getCurrentUserRole = (): string | null => {
  return localStorage.getItem("role");
};

export const getCurrentUserName = (): string | null => {
  return localStorage.getItem("name");
};

export const getCurrentUserEmail = (): string | null => {
  return localStorage.getItem("email");
};

export const clearAuthData = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
};

export const setAuthData = (authData: {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  role: string;
  name: string;
  email: string;
}): void => {
  localStorage.setItem("accessToken", authData.accessToken);
  if (authData.refreshToken) {
    localStorage.setItem("refreshToken", authData.refreshToken);
  }
  localStorage.setItem("userId", authData.userId);
  localStorage.setItem("role", authData.role);
  localStorage.setItem("name", authData.name);
  localStorage.setItem("email", authData.email);
};
