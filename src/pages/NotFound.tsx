
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import BetsterLogo from "@/components/BetsterLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-betster-gradient">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-auto text-center">
        <BetsterLogo className="h-10 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <Link to="/" className="betster-button inline-flex">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
