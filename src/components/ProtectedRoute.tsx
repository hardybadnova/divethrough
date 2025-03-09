
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();

  console.log("ProtectedRoute check:", { isAuthenticated, isLoading, isInitialized, userId: user?.id });

  useEffect(() => {
    if (isInitialized) {
      console.log("ProtectedRoute initialized, auth status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    }
  }, [isInitialized, isAuthenticated]);

  if (isLoading && !isInitialized) {
    console.log("Auth is still loading, showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-betster-gradient">
        <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("User authenticated, rendering outlet");
  return <Outlet />;
};

export default ProtectedRoute;
