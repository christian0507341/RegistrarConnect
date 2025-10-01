// src/screens/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:8000/api/auth/login/",
        { email, password, role }
      );

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
        const anyErr = err as any;
        if (anyErr.response?.data?.message) {
          message = anyErr.response.data.message;
        }
      }
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Admin Login</h2>

        {error && <p className="login-error">{error}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <div className="role-options">
            <label>
              <input
                type="radio"
                value="faculty"
                checked={role === "faculty"}
                onChange={() => setRole("faculty")}
              />
              Faculty
            </label>
            <label>
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              Admin
            </label>
          </div>
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}
