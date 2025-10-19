// Authentication utilities for student data security

export const checkStudentAuth = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  
  return !!(token && role === 'student' && userId);
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
