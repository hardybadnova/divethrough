
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Only refresh user data when necessary and not on every route change
  useEffect(() => {
    // Skip data refreshing on most routes for faster navigation
    // Only refresh on critical wallet-related paths
    const shouldRefresh = location.pathname === '/dashboard' || 
                        location.pathname === '/profile' || 
                        location.pathname === '/transactions';
    
    if (isAuthenticated && shouldRefresh) {
      // Use a small timeout to avoid blocking UI rendering
      const refreshTimer = setTimeout(() => {
        refreshUserData();
      }, 100);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Simplified loading state with faster spinner appearance
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
