
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BetsterLogo from "@/components/BetsterLogo";
import { motion } from "framer-motion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("asdfghjkl");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
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
            Sign in to access your account and start betting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-betster-200">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
      </motion.div>
    </div>
  );
};

export default Login;
