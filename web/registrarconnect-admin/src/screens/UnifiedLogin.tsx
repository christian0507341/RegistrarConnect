import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, BookOpen, GraduationCap, Users, Shield, UserCheck } from "lucide-react";
import "../styles/screens/UnifiedLoginScreen.css";

type UnifiedLoginProps = {
  setIsAuthenticated: (auth: boolean) => void;
  setIsStudentAuthenticated: (auth: boolean) => void;
  setIsRegistrarAuthenticated: (auth: boolean) => void;
  setIsFinanceAuthenticated: (auth: boolean) => void;
};

export default function UnifiedLogin({ setIsAuthenticated, setIsStudentAuthenticated, setIsRegistrarAuthenticated, setIsFinanceAuthenticated }: UnifiedLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [adminRole, setAdminRole] = useState<"admin" | "registrar" | "finance">("admin");
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

    // Validate PHINMA email format
    if (!email.endsWith('.up@phinmaed.com')) {
      setError("Email must be a PHINMA address ending with .up@phinmaed.com");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const roleToSend = loginType === "student" ? "student" : adminRole;
      console.log('Login attempt:', { 
        email, 
        password, 
        loginType, 
        adminRole, 
        roleToSend 
      });
      const response = await apiService.login(email, password, roleToSend);

      const { access, refresh, role: userRole, name, email: userEmail } =
        response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", name);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("adminRole", adminRole);

      // Set authentication state based on BACKEND RETURNED ROLE (not loginType)
      // The backend determines the actual user role
      if (userRole === "admin") {
        setIsAuthenticated(true);
        console.log('Admin role detected, navigating to admin dashboard');
        setTimeout(() => navigate("/admin/dashboard"), 0);
      } else if (userRole === "registrar") {
        setIsRegistrarAuthenticated(true);
        console.log('Registrar role detected, navigating to registrar dashboard');
        setTimeout(() => navigate("/registrar/dashboard"), 0);
      } else if (userRole === "finance") {
        setIsFinanceAuthenticated(true);
        console.log('Finance role detected, navigating to finance dashboard');
        setTimeout(() => navigate("/finance/dashboard"), 0);
      } else if (userRole === "student") {
        setIsStudentAuthenticated(true);
        console.log('Student role detected, navigating to student dashboard');
        setTimeout(() => navigate("/student/dashboard"), 0);
      } else {
        // Fallback for unknown roles
        console.error('Unknown role:', userRole);
        setError('Unknown user role. Please contact support.');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      let message = "Login failed. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string; detail?: string; role?: string[]; email?: string[]; password?: string[] } } };
        
        console.error('Full error response:', axiosErr.response?.data);
        
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message;
        } else if (axiosErr.response?.data?.detail) {
          message = axiosErr.response.data.detail;
        } else if (axiosErr.response?.data?.role) {
          message = `Role error: ${axiosErr.response.data.role.join(', ')}`;
        } else if (axiosErr.response?.data?.email) {
          message = `Email error: ${axiosErr.response.data.email.join(', ')}`;
        } else if (axiosErr.response?.data?.password) {
          message = `Password error: ${axiosErr.response.data.password.join(', ')}`;
        } else if (axiosErr.response?.status === 400) {
          message = "Invalid credentials or request format. Please check your email and password.";
        } else if (axiosErr.response?.status === 500) {
          message = "Server error. Please try again later.";
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
                  {loginType === "student" ? "Student Portal" : `${adminRole.charAt(0).toUpperCase() + adminRole.slice(1)} Portal`}
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
                  <h2>Welcome to {loginType === "student" ? "Student" : adminRole.charAt(0).toUpperCase() + adminRole.slice(1)} Portal</h2>
                  <p>
                    {loginType === "student" 
                      ? "Access your academic documents, track requests, and manage your academic journey with ease."
                      : adminRole === "admin" 
                        ? "Manage student requests, approve documents, and oversee the academic process efficiently."
                        : adminRole === "registrar"
                          ? "Process document requests, approve submissions, and manage student claiming appointments."
                          : "Verify student payments, manage financial transactions, and approve payment submissions."
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
                        {adminRole === "admin" && (
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
                        {adminRole === "registrar" && (
                          <>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <UserCheck size={20} />
                              <span>Process document requests</span>
                            </div>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <BookOpen size={20} />
                              <span>Approve submissions</span>
                            </div>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <Users size={20} />
                              <span>Schedule appointments</span>
                            </div>
                          </>
                        )}
                        {adminRole === "finance" && (
                          <>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <Shield size={20} />
                              <span>Verify payments</span>
                            </div>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <BookOpen size={20} />
                              <span>Approve transactions</span>
                            </div>
                            <div className={`feature-item ${isTransitioning ? 'transitioning' : ''}`}>
                              <Users size={20} />
                              <span>Financial reporting</span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={`right-side ${isTransitioning ? 'transitioning' : ''}`}>
              <form onSubmit={handleSubmit} className="login-form">
                {loginType === "admin" && (
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <div className="input-wrapper">
                      <Shield size={20} className="input-icon" />
                      <select
                        id="role"
                        value={adminRole}
                        onChange={(e) => setAdminRole(e.target.value as "admin" | "registrar" | "finance")}
                        className="role-select"
                      >
                        <option value="admin">Administrator</option>
                        <option value="registrar">Registrar</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name.up@phinmaed.com"
                      required
                    />
                  </div>
                  <small className="form-help">
                    Must be a PHINMA email ending with .up@phinmaed.com
                  </small>
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
