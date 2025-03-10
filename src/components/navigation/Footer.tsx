
import { Link } from "react-router-dom";
import { Home, Shield, Trophy, MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg border-t border-betster-700/40">
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          to="/dashboard"
          className="flex flex-1 flex-col items-center justify-center py-1"
        >
          <Home className="h-5 w-5 text-betster-300" />
          <span className="text-xs text-betster-300 mt-1">Home</span>
        </Link>
        <Link
          to="/kyc"
          className="flex flex-1 flex-col items-center justify-center py-1"
        >
          <Shield className="h-5 w-5 text-betster-300" />
          <span className="text-xs text-betster-300 mt-1">Verify</span>
        </Link>
        <Link
          to="/milestones"
          className="flex flex-1 flex-col items-center justify-center py-1"
        >
          <Trophy className="h-5 w-5 text-betster-300" />
          <span className="text-xs text-betster-300 mt-1">Milestones</span>
        </Link>
        <Link
          to="/support"
          className="flex flex-1 flex-col items-center justify-center py-1"
        >
          <MessageSquare className="h-5 w-5 text-betster-300" />
          <span className="text-xs text-betster-300 mt-1">Support</span>
        </Link>
      </div>
    </footer>
  );
};
