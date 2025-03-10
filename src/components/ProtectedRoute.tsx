
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Only refresh user data when necessary and not on every route change
  useEffect(() => {
    // Skip data refreshing on certain routes or limit refresh frequency
    const shouldRefresh = !location.pathname.includes('/transactions');
    
    if (isAuthenticated && shouldRefresh) {
      refreshUserData();
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Simplified loading state with faster spinner appearance
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="h-8 w-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
