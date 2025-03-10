
import { User, Shield, Trophy, Award, Percent, MessageSquare, Home, Wallet, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useKYC } from "@/contexts/KYCContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NavigationSidebarProps {
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const NavigationSidebar = ({ sheetOpen, setSheetOpen }: NavigationSidebarProps) => {
  const { user, logout } = useAuth();
  const { getVerificationStatus } = useKYC();
  const { theme, toggleTheme } = useTheme();
  
  const verificationStatus = getVerificationStatus();

  const menuItems = [
    { label: "Profile", icon: User, path: "/profile" },
    { 
      label: "KYC Verification", 
      icon: Shield, 
      path: "/kyc",
      badge: verificationStatus === 'verified' ? 'Verified' : 
             verificationStatus === 'pending' ? 'Pending' : 'Required',
      badgeColor: verificationStatus === 'verified' ? 'bg-green-500/80' : 
                 verificationStatus === 'pending' ? 'bg-amber-500/80' : 'bg-red-500/80'
    },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Milestones & Bonuses", icon: Award, path: "/milestones" },
    { label: "Referral Program", icon: Percent, path: "/referral" },
    { label: "Chat Support", icon: MessageSquare, path: "/support" },
    { label: "Game History", icon: Home, path: "/game-history" },
    { label: "Test Wallet", icon: Wallet, path: "/test-wallet" },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <button className="rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center">
          <Menu className="h-5 w-5 text-betster-300" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-black/95 backdrop-blur-xl border-r border-betster-700/40 p-0">
        <div className="flex flex-col h-full">
          <div className="py-6 px-4 border-b border-betster-700/40">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-betster-500 to-betster-700 h-12 w-12 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{user?.username}</p>
                <p className="text-sm text-betster-300">
                  ₹{user?.wallet || 0}
                </p>
              </div>
            </div>
          </div>
          <nav className="px-2 py-4 flex flex-col gap-1">
            <div className="px-3 py-3 flex items-center justify-between">
              <span className="text-betster-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-betster-400" />
                ) : (
                  <Moon className="h-5 w-5 text-betster-400" />
                )}
              </button>
            </div>
            
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 transition-colors"
                onClick={() => setSheetOpen(false)}
              >
                <item.icon className="h-5 w-5 text-betster-400" />
                <span className="text-betster-100">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 text-left text-destructive transition-colors mt-auto"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
