
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Super optimized: Only refresh on truly necessary paths and much less frequently
  useEffect(() => {
    // Only refresh data on very specific screens that absolutely need it
    const essentialPaths = ['/transactions'];
    const shouldRefresh = isAuthenticated && essentialPaths.includes(location.pathname);
    
    if (shouldRefresh) {
      // One immediate refresh when entering the page, no timeout
      refreshUserData();
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Simplified loading state with near-instant appearance
  if (!isInitialized) {
    return null; // Return nothing for fastest possible loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
