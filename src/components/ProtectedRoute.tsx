
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Refresh user data when navigating to protected routes
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  // Simplified loading state with faster spinner appearance
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-betster-gradient">
        <div className="h-10 w-10 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
