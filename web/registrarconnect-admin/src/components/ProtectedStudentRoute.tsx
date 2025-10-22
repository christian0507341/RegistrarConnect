import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkStudentAuth } from "../utils/authUtils";

interface ProtectedStudentRouteProps {
  children: React.ReactNode;
}

export default function ProtectedStudentRoute({ children }: ProtectedStudentRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication after a short delay
    const timer = setTimeout(() => {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      const isAuthorized = checkStudentAuth();
      
      console.log('ProtectedStudentRoute authentication check:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        role: role,
        userId: userId,
        isAuthorized: isAuthorized
      });
      
      if (!isAuthorized) {
        console.warn('Student authentication failed, redirecting to login');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      } else {
        console.log('Student authentication successful');
      }
      
      setIsChecking(false);
    }, 150);

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
  if (!checkStudentAuth()) {
    return null;
  }

  return <>{children}</>;
}
