import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SocialAuthButtonsProps {
  onGoogleLogin: () => Promise<void>;
  isLoading: boolean;
}

const SocialAuthButtons = ({ onGoogleLogin, isLoading }: SocialAuthButtonsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      console.log("Google login button clicked, starting sign-in process");
      
      toast({
        title: "Starting Google sign-in",
        description: "You'll be redirected to Google. If this doesn't work, please check the Google provider configuration.",
      });
      
      await onGoogleLogin();
      
    } catch (error: any) {
      console.error("Google sign-in failed at component level:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Failed to start Google sign-in. Please try email login instead.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-betster-700/50"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black/20 px-2 text-muted-foreground backdrop-blur-sm">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting || isLoading}
        variant="outline"
        className="flex items-center justify-center w-full py-2.5 px-4 bg-black/30 hover:bg-black/40 backdrop-blur border-betster-700/50"
      >
        {(isSubmitting || isLoading) ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="text-blue-600"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="text-green-600"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                className="text-yellow-500"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                className="text-red-600"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </Button>
    </>
  );
};

export default SocialAuthButtons;
