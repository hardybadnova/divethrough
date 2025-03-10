
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BetsterLogo from "../BetsterLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { NavigationSidebar } from "./NavigationSidebar";

interface HeaderProps {
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  walletPopoverOpen: boolean;
  setWalletPopoverOpen: (open: boolean) => void;
}

export const Header = ({ 
  sheetOpen, 
  setSheetOpen,
  walletPopoverOpen,
  setWalletPopoverOpen
}: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-lg bg-black/30 border-betster-600/40">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <NavigationSidebar sheetOpen={sheetOpen} setSheetOpen={setSheetOpen} />
        </div>

        <div className="flex-1 flex justify-center">
          <Link to="/dashboard">
            <BetsterLogo className="h-8" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={walletPopoverOpen} onOpenChange={setWalletPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 rounded-full bg-betster-600/20 px-3 py-1.5 text-sm font-medium text-betster-100 transition-colors hover:bg-betster-600/30"
              >
                <Wallet className="h-4 w-4" />
                <span>₹{user?.wallet || 0}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-black/90 backdrop-blur-lg border border-betster-700/40 text-white">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-betster-100">Wallet Balance</h3>
                <div className="flex items-center justify-between">
                  <span className="text-betster-300">Available</span>
                  <span className="text-lg font-bold">₹{user?.wallet || 0}</span>
                </div>
                
                <div className="pt-2 border-t border-betster-700/40">
                  <h4 className="text-sm font-medium text-betster-300 mb-2">Quick Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/test-wallet" 
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-betster-600/30 px-3 py-2 text-sm font-medium text-betster-100 transition-colors hover:bg-betster-600/50 w-full"
                      onClick={() => setWalletPopoverOpen(false)}
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Manage Wallet</span>
                    </Link>
                    
                    <Link 
                      to="/transaction-history" 
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-transparent border border-betster-700/40 px-3 py-2 text-sm font-medium text-betster-100 transition-colors hover:bg-betster-800/30 w-full"
                      onClick={() => setWalletPopoverOpen(false)}
                    >
                      <span>Transaction History</span>
                    </Link>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-betster-700/40">
                  <div className="flex items-center gap-2">
                    <Badge variant="betsterOutline" size="sm">New</Badge>
                    <p className="text-xs text-betster-300">Instant withdrawals now available!</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
