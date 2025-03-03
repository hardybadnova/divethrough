import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from "@/hooks/use-toast";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handling in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
      <Card className="w-full max-w-md p-8 space-y-6 bg-black/60 backdrop-blur-sm border border-purple-500/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-purple-300/60 mt-2">Join the exclusive community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="bg-black/50 border-purple-500/30 focus:border-purple-500 text-purple-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
              className="bg-black/50 border-purple-500/30 focus:border-purple-500 text-purple-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Confirm Password</label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              className="bg-black/50 border-purple-500/30 focus:border-purple-500 text-purple-100"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-purple-300/60">Already have an account? </span>
          <Link to="/signin" className="text-purple-400 hover:text-purple-300 hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;