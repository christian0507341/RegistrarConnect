import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkStudentAuth } from "../utils/authUtils";

interface ProtectedStudentRouteProps {
  children: React.ReactNode;
}

export default function ProtectedStudentRoute({ children }: ProtectedStudentRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkStudentAuth()) {
      navigate('/login');
    }
  }, [navigate]);

  // If not authenticated, don't render children
  if (!checkStudentAuth()) {
    return null;
  }

  return <>{children}</>;
}
