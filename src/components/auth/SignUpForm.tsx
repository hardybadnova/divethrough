
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface SignUpFormProps {
  onSignUp: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm = ({ onSignUp, isLoading }: SignUpFormProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp(username, email, password);
    } catch (error: any) {
      console.error("Sign up error:", error);
      // Toast is handled in the auth operations, no need to duplicate
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="signUpUsername" className="text-sm font-medium text-betster-200">
          Username
        </Label>
        <Input
          id="signUpUsername"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default SignUpForm;
