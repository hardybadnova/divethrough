
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BetsterLogo from "@/components/BetsterLogo";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle, signUp, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation is handled in the useEffect above when isAuthenticated changes
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(signUpUsername, signUpEmail, signUpPassword);
      // Navigate to login tab after successful signup
      document.querySelector('[data-state="inactive"][data-value="login"]')?.click();
      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      toast({
        title: "Sign Up Failed",
        description: error.message || "Something went wrong during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect is handled by Supabase OAuth
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Something went wrong with Google authentication.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0033] to-[#4a0080] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto rounded-2xl premium-glass p-8 space-y-8"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-betster-500 to-betster-700 backdrop-blur-lg flex items-center justify-center mb-4">
            <BetsterLogo className="h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">Welcome to Betster</h1>
          <p className="text-betster-300 text-sm text-center">
            Sign in or create an account to start betting
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-betster-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-betster-700/50 backdrop-blur text-white"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-betster-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-black/50 border-betster-700/50 backdrop-blur text-white"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3"
              >
                {(isSubmitting || isLoading) ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signUpUsername" className="text-sm font-medium text-betster-200">
                  Username
                </Label>
                <Input
                  id="signUpUsername"
                  type="text"
                  placeholder="Choose a username"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  className="bg-black/50 border-betster-700/50 backdrop-blur text-white"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpEmail" className="text-sm font-medium text-betster-200">
                  Email
                </Label>
                <Input
                  id="signUpEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="bg-black/50 border-betster-700/50 backdrop-blur text-white"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpPassword" className="text-sm font-medium text-betster-200">
                  Password
                </Label>
                <Input
                  id="signUpPassword"
                  type="password"
                  placeholder="Choose a password (min 6 characters)"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="bg-black/50 border-betster-700/50 backdrop-blur text-white"
                  minLength={6}
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3"
              >
                {(isSubmitting || isLoading) ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

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
      </motion.div>
    </div>
  );
};

export default Login;
