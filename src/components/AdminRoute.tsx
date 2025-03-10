
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, isInitialized, isAdmin } = useAuth();

  console.log("AdminRoute check:", { isAuthenticated, isLoading, isInitialized, isAdmin });

  if (isLoading && !isInitialized) {
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

  if (!isAdmin) {
    console.log("User not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Admin authenticated, rendering outlet");
  return <Outlet />;
};

export default AdminRoute;
