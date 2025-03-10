
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Super optimized: Only refresh on truly necessary paths
  useEffect(() => {
    // Only refresh data on very specific screens that absolutely need it
    const essentialPaths = ['/transactions'];
    const shouldRefresh = essentialPaths.includes(location.pathname);
    
    if (isAuthenticated && shouldRefresh) {
      // Use a larger timeout to reduce refresh frequency
      const refreshTimer = setTimeout(() => {
        refreshUserData();
      }, 1000); // Increased to further reduce refresh frequency
      
      return () => clearTimeout(refreshTimer);
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Ultra simplified loading state with near-instant appearance
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-8">
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
