
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BetsterLogo from "@/components/BetsterLogo";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Even faster animation time - 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Optimized navigation logic
  useEffect(() => {
    if (animationComplete && isInitialized) {
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        navigate(isAuthenticated ? '/dashboard' : '/login');
      });
    }
  }, [animationComplete, isAuthenticated, isInitialized, navigate]);

  // Very short force navigation timeout - reduced to 1 second
  useEffect(() => {
    const forceNavigationTimer = setTimeout(() => {
      if (document.location.pathname === '/') {
        navigate('/login');
      }
    }, 1000);

    return () => clearTimeout(forceNavigationTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-betster-gradient">
      <div className="flex flex-col items-center space-y-4 animate-slideUp">
        <BetsterLogo className="h-16" />
        <p className="text-betster-200 text-sm">Premium Betting Experience</p>
      </div>
    </div>
  );
};

export default SplashScreen;
