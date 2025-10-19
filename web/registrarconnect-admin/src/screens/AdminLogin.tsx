// src/screens/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { Eye, EyeOff, Shield, Users, Mail, Lock, AlertCircle } from "lucide-react";
import "../styles/screens/LoginScreen.css";

type AdminLoginProps = {
  setIsAuthenticated: (auth: boolean) => void;
};

interface LoginResponse {
  message: string;
  access: string;
  refresh: string;
  role: string;
  name: string;
  email: string;
}

export default function AdminLogin({ setIsAuthenticated }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"faculty" | "admin">("faculty");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const response = await apiService.login(email, password, role);

      const { access, refresh, role: userRole, name, email: userEmail } =
        response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", name);
      localStorage.setItem("email", userEmail);

      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err: unknown) {
      let message = "Login failed. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">
              <Shield className="logo-icon" />
              <span>RegistrarConnect</span>
            </div>
            <h1 className="brand-title">Admin Portal</h1>
            <p className="brand-subtitle">
              Manage document requests, appointments, and student services with ease
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Analytics Dashboard</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📋</div>
                <span>Request Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📅</div>
                <span>Appointment Scheduling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your admin account</p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=".up@phinmaed.com"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input password-input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Users size={16} />
                Access Level
              </label>
              <div className="role-options">
                <label className={`role-option ${role === "faculty" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="faculty"
                    checked={role === "faculty"}
                    onChange={() => setRole("faculty")}
                    disabled={isLoading}
                  />
                  <div className="role-content">
                    <div className="role-icon">👨‍🏫</div>
                    <div className="role-text">
                      <div className="role-name">Faculty</div>
                      <div className="role-desc">Limited access</div>
                    </div>
                  </div>
                </label>
                <label className={`role-option ${role === "admin" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    disabled={isLoading}
                  />
                  <div className="role-content">
                    <div className="role-icon">👨‍💼</div>
                    <div className="role-text">
                      <div className="role-name">Admin</div>
                      <div className="role-desc">Full access</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="login-footer">
              <p className="security-note">
                🔒 Your session is secured with enterprise-grade encryption
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
