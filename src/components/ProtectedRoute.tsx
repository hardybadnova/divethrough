
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Optimized: Only refresh data on critical paths and less frequently
  useEffect(() => {
    // Even more restricted list of routes that need refresh
    const criticalPaths = ['/transactions'];
    const shouldRefresh = criticalPaths.includes(location.pathname);
    
    if (isAuthenticated && shouldRefresh) {
      // Use a slightly larger timeout to reduce frequency of refreshes
      const refreshTimer = setTimeout(() => {
        refreshUserData();
      }, 500); // Increased to reduce refresh frequency
      
      return () => clearTimeout(refreshTimer);
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Super simplified loading state with faster appearance
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
