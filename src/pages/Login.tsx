
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BetsterLogo from "@/components/BetsterLogo";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { login, loginWithGoogle, signUp, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignUpSuccess = async (username: string, email: string, password: string) => {
    try {
      await signUp(username, email, password);
      setActiveTab("login");
      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error) {
      // Error is handled in the component
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
          <h1 className="text-2xl font-bold tracking-tight text-gradient">Welcome to Numbet</h1>
          <p className="text-betster-300 text-sm text-center">
            Sign in or create an account to start betting
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onLogin={login} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm onSignUp={handleSignUpSuccess} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        <SocialAuthButtons onGoogleLogin={loginWithGoogle} isLoading={isLoading} />
      </motion.div>
    </div>
  );
};

export default Login;
