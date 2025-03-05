
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BetsterLogo from "@/components/BetsterLogo";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("asdfghjkl");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const { login, loginWithGoogle, signUp, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(signUpUsername, signUpEmail, signUpPassword);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
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
                <label htmlFor="email" className="text-sm font-medium text-betster-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-black/50 border-betster-700/50 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-betster-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-betster-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 rounded-md border bg-black/50 border-betster-700/50 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-betster-500"
                />
                <p className="text-xs text-betster-400">
                  For demo: password is 'asdfghjkl'
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="betster-button w-full py-3"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="signUpUsername" className="text-sm font-medium text-betster-200">
                  Username
                </label>
                <input
                  id="signUpUsername"
                  type="text"
                  placeholder="Choose a username"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-black/50 border-betster-700/50 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-betster-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="signUpEmail" className="text-sm font-medium text-betster-200">
                  Email
                </label>
                <input
                  id="signUpEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-black/50 border-betster-700/50 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-betster-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="signUpPassword" className="text-sm font-medium text-betster-200">
                  Password
                </label>
                <input
                  id="signUpPassword"
                  type="password"
                  placeholder="Choose a password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-black/50 border-betster-700/50 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-betster-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="betster-button w-full py-3"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Create Account"
                )}
              </button>
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex items-center justify-center w-full py-2.5 px-4 rounded-md border border-betster-700/50 bg-black/30 hover:bg-black/40 backdrop-blur text-white transition duration-200"
        >
          {isLoading ? (
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
        </button>
        
        <div className="text-xs text-betster-300 mt-4 text-center">
          <p>Note: For Google sign-in to work in production, you need to add your domain to the Firebase authorized domains list in the Firebase console.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
