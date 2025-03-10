import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, refreshUserData } = useAuth();
  const location = useLocation();

  // Prevent refreshes on any game-related screens to avoid wallet balance issues
  useEffect(() => {
    // Skip user data refreshes on these paths to preserve wallet balance
    const nonRefreshPaths = ['/game', '/pools', '/result'];
    const shouldSkipRefresh = nonRefreshPaths.some(path => location.pathname.includes(path));
    
    // Only refresh on dashboard to keep wallet value consistent
    if (isAuthenticated && !shouldSkipRefresh) {
      if (location.pathname === '/dashboard') {
        console.log("Refreshing user data on dashboard");
        refreshUserData();
      }
    }
  }, [isAuthenticated, location.pathname, refreshUserData]);

  // Near-instant appearance by showing nothing during init
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
