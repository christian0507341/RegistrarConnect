import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminAuth } from "../utils/authUtils";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure localStorage is set
    const timer = setTimeout(() => {
      const isAuthorized = checkAdminAuth();
      
      console.log('ProtectedAdminRoute check:', {
        isAuthorized,
        token: !!localStorage.getItem("accessToken"),
        role: localStorage.getItem("role")
      });
      
      if (!isAuthorized) {
        console.warn('Unauthorized access attempt to admin route');
        navigate('/login', { replace: true });
      }
      
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!checkAdminAuth()) {
    return null;
  }

  return <>{children}</>;
}

