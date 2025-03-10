
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Trophy, Zap, Sparkles, Clock, Star, Users, Coins, ArrowRight, Info } from 'lucide-react';
import { GameDetails } from '@/components/dashboard/GameDetailsModal';
import GameCard from './GameCard';

interface GamesListProps {
  filteredGames: GameDetails[];
  isLoading: boolean;
  openGameDetails: (game: GameDetails) => void;
  resetFilters: () => void;
}

const GamesList: React.FC<GamesListProps> = ({ 
  filteredGames, 
  isLoading, 
  openGameDetails,
  resetFilters 
}) => {
  const navigate = useNavigate();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl premium-glass overflow-hidden animate-pulse h-64">
            <div className="h-full w-full bg-gradient-to-br from-betster-900/50 to-betster-950/50"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredGames.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-12"
      >
        <p className="text-betster-300 mb-4">No games match your search criteria</p>
        <button 
          onClick={resetFilters}
          className="betster-button-outline"
        >
          Reset Filters
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6"
    >
      <AnimatePresence>
        {filteredGames.map((game) => (
          <GameCard 
            key={game.id}
            game={game}
            onViewDetails={() => openGameDetails(game)}
            onPlayNow={() => navigate(`/pools/${game.id}`)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default GamesList;
