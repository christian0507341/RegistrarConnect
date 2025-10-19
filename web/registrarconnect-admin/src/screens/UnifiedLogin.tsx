import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, BookOpen, GraduationCap, Users, Shield } from "lucide-react";
import "../styles/screens/UnifiedLoginScreen.css";

type UnifiedLoginProps = {
  setIsAuthenticated: (auth: boolean) => void;
  setIsStudentAuthenticated: (auth: boolean) => void;
};

export default function UnifiedLogin({ setIsAuthenticated, setIsStudentAuthenticated }: UnifiedLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleLoginTypeChange = (newType: "student" | "admin") => {
    if (newType !== loginType) {
      setIsTransitioning(true);
      setError(null); // Clear any existing errors
      
      setTimeout(() => {
        setLoginType(newType);
        setIsTransitioning(false);
      }, 300); // Half of the transition duration
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password, loginType);

      const { access, refresh, role: userRole, name, email: userEmail } =
        response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", name);
      localStorage.setItem("email", userEmail);

      if (loginType === "admin") {
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setIsStudentAuthenticated(true);
        navigate("/student/dashboard");
      }
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
    <div className="unified-login-container">
      <div className="login-background">
        <div className="background-pattern"></div>
        <div className="floating-elements">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </div>

      <div className="login-content">
        <div className={`login-card ${loginType} ${isTransitioning ? 'transitioning' : ''}`}>
          {/* Header */}
          <div className="login-header">
            <div className="brand-section">
              <div className={`brand-icon ${isTransitioning ? 'transitioning' : ''}`}>
                {loginType === "student" ? <GraduationCap size={32} /> : <Shield size={32} />}
              </div>
              <div className="brand-text">
                <h1>RegistrarConnect</h1>
                <p className={isTransitioning ? 'transitioning' : ''}>
                  {loginType === "student" ? "Student Portal" : "Admin Portal"}
                </p>
              </div>
            </div>
          </div>

          {/* Login Type Toggle */}
          <div className="login-type-toggle">
            <button
              className={`toggle-btn ${loginType === "student" ? "active" : ""}`}
              onClick={() => handleLoginTypeChange("student")}
              disabled={isTransitioning}
            >
              <GraduationCap size={20} />
              <span>Student</span>
            </button>
            <button
              className={`toggle-btn ${loginType === "admin" ? "active" : ""}`}
              onClick={() => handleLoginTypeChange("admin")}
              disabled={isTransitioning}
            >
              <Shield size={20} />
              <span>Admin</span>
            </button>
          </div>

          {/* Main Content Container */}
          <div className="main-content-container">
            {/* Left Side - Info/Features */}
            <div className={`left-side ${isTransitioning ? 'transitioning' : ''}`}>
              <div className="info-section">
                <div className={`welcome-message ${isTransitioning ? 'transitioning' : ''}`}>
                  <h2>Welcome to {loginType === "student" ? "Student" : "Admin"} Portal</h2>
                  <p>
                    {loginType === "student" 
                      ? "Access your academic documents, track requests, and manage your academic journey with ease."
                      : "Manage student requests, approve documents, and oversee the academic process efficiently."
                    }
                  </p>
                </div>

                {/* Features Section */}
                <div className={`features-section ${isTransitioning ? 'transitioning' : ''}`}>
                  <h3>What you can do:</h3>
                  <div className="features-grid">
                    {loginType === "student" ? (
                      <>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <BookOpen size={20} />
                          <span>Submit document requests</span>
                        </div>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <User size={20} />
                          <span>Track request status</span>
                        </div>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <GraduationCap size={20} />
                          <span>Schedule appointments</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <Users size={20} />
                          <span>Manage student requests</span>
                        </div>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <Shield size={20} />
                          <span>Approve documents</span>
                        </div>
                        <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                          <BookOpen size={20} />
                          <span>View analytics</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={`right-side ${isTransitioning ? 'transitioning' : ''}`}>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <User size={20} />
                      <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
