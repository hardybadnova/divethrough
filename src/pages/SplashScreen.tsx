
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BetsterLogo from "@/components/BetsterLogo";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      console.log("Splash animation complete");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationComplete && !isLoading) {
      // Check if user is already logged in
      console.log("Navigation check - Auth state:", { isAuthenticated, isLoading });
      
      if (isAuthenticated) {
        console.log("User is authenticated, navigating to dashboard");
        navigate('/dashboard');
      } else {
        console.log("User is not authenticated, navigating to login");
        navigate('/login');
      }
    }
  }, [animationComplete, isAuthenticated, isLoading, navigate]);

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
