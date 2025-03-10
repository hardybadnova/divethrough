
import React from 'react';
import { Shield } from 'lucide-react';

const HowToPlay: React.FC = () => {
  return (
    <div className="mt-8 p-5 bg-black/30 backdrop-blur-sm rounded-xl border border-betster-700/30">
      <h2 className="font-semibold mb-3 text-white text-lg flex items-center">
        <Shield className="h-4 w-4 mr-2 text-betster-400" /> How to Play
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-sm text-betster-300">
        <li>Choose a game type and select a pool based on your preferred entry fee</li>
        <li>Pick one number - the goal is to choose a number that few others will pick</li>
        <li>Wait for the timer to end and see the results</li>
        <li>The least picked numbers win prizes!</li>
        <li>Play more games to earn milestone bonuses (5-30% based on games played)</li>
        <li>Refer friends to earn 5% of their first deposit</li>
      </ul>
    </div>
  );
};

export default HowToPlay;
