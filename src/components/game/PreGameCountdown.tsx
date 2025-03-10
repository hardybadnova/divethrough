
import React from "react";
import { Progress } from "@/components/ui/progress";

interface PreGameCountdownProps {
  preGameCountdown: number;
}

const PreGameCountdown: React.FC<PreGameCountdownProps> = ({ preGameCountdown }) => {
  return (
    <div className="glass-card rounded-xl p-4 mb-4 bg-betster-900/70">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-betster-300">Waiting for game to start</h3>
          <p className="text-sm text-muted-foreground">
            You can exit or change table during this time
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-betster-400">{preGameCountdown}</span>
          <span className="text-xs text-muted-foreground">seconds</span>
        </div>
      </div>
      <Progress value={(preGameCountdown / 20) * 100} className="h-2 mt-2" />
    </div>
  );
};

export default PreGameCountdown;
