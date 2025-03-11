
import React from "react";
import { Info } from "lucide-react";

const ProbabilityInsight: React.FC = () => {
  return (
    <div className="bg-betster-900/70 rounded-lg p-4 mt-6 border border-betster-700/50">
      <h3 className="font-medium mb-2 text-betster-300 flex items-center">
        <Info className="h-4 w-4 mr-2" />
        Probability Insight
      </h3>
      <p className="text-sm">
        Remember that each game is independent, and past results don't
        influence future outcomes directly. However, player psychology tends
        to follow patterns, which you can use to your advantage!
      </p>
    </div>
  );
};

export default ProbabilityInsight;
