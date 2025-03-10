
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BetsterLogo from "@/components/BetsterLogo";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reduce animation time even further to 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      console.log("Splash animation complete");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Simplify navigation logic to reduce conditional checks
  useEffect(() => {
    if (animationComplete && isInitialized) {
      console.log("Navigating from splash screen");
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [animationComplete, isAuthenticated, isInitialized, navigate]);

  // Add a very short force navigation timeout as failsafe - reduced to 1.5 seconds
  useEffect(() => {
    const forceNavigationTimer = setTimeout(() => {
      if (document.location.pathname === '/') {
        console.log("Force navigation triggered after timeout");
        navigate('/login');
      }
    }, 1500);

    return () => clearTimeout(forceNavigationTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-betster-gradient">
      <div className="flex flex-col items-center space-y-6 animate-slideUp">
        <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-betster-600 flex items-center justify-center animate-pulse">
            <BetsterLogo className="h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          <BetsterLogo className="h-12" />
        </h1>
        <p className="text-betster-200 text-sm">Premium Betting Experience</p>
        <div className="loader mt-8"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
