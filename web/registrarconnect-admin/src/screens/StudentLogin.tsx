import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, BookOpen, GraduationCap } from "lucide-react";
type StudentLoginProps = {
  setIsAuthenticated: (auth: boolean) => void;
};

export default function StudentLogin({ setIsAuthenticated }: StudentLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await apiService.login(email, password, "student");

      const { access, refresh, role: userRole, name, email: userEmail } =
        response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", name);
      localStorage.setItem("email", userEmail);

      setIsAuthenticated(true);
      navigate("/student/dashboard");
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
    <div className="student-login-page">
      <div className="login-container">
        {/* Left side - Student Branding */}
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">
              <GraduationCap className="logo-icon" />
              <span>RegistrarConnect</span>
            </div>
            <h1 className="brand-title">Student Portal</h1>
            <p className="brand-subtitle">
              Access your document requests, appointments, and academic services
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📄</div>
                <span>Document Requests</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📅</div>
                <span>Appointment Booking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔔</div>
                <span>Real-time Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your student account</p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <div className="label-content">
                  <Mail size={16} />
                  <span className="label-text">Email Address</span>
                </div>
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@phinmaed.com"
                  className="form-input"
                  disabled={isLoading}
                />
                <div className="input-indicator">
                  <Mail size={14} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <div className="label-content">
                  <Lock size={16} />
                  <span className="label-text">Password</span>
                </div>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
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
                🔒 Your academic data is protected with enterprise-grade security
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
