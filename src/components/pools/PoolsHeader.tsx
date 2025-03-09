
import { RefreshCw } from "lucide-react";

interface PoolsHeaderProps {
  gameTitle: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PoolsHeader = ({ gameTitle, isLoading, onRefresh }: PoolsHeaderProps) => {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {gameTitle} Pools
          </h1>
          <div className="betster-chip animate-pulse">
            Live
          </div>
        </div>
        <button 
          onClick={onRefresh} 
          className="betster-button-secondary" 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-muted-foreground">
        Select a pool to join and start playing
      </p>
    </div>
  );
};
