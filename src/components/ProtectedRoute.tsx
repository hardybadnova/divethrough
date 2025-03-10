
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Only refresh on essential paths, much less frequently
  useEffect(() => {
    // Don't refresh on game paths to prevent wallet issues
    const nonRefreshPaths = ['/game', '/pools'];
    const shouldSkipRefresh = nonRefreshPaths.some(path => location.pathname.includes(path));
    
    if (isAuthenticated && !shouldSkipRefresh) {
      // One immediate refresh when entering specific screens
      if (location.pathname === '/transactions' || location.pathname === '/dashboard') {
        refreshUserData();
      }
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
