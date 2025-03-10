
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Trophy, Zap, Sparkles, Clock, Star, Users, Coins, ArrowRight, Info } from 'lucide-react';
import { GameDetails } from '@/components/dashboard/GameDetailsModal';

interface GameCardProps {
  game: GameDetails;
  onViewDetails: () => void;
  onPlayNow: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onViewDetails, onPlayNow }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={item}
      whileHover={{ 
        y: -5, 
        transition: { duration: 0.2 } 
      }}
      className="group w-full"
    >
      <div
        className="rounded-xl premium-glass overflow-hidden transition-all hover:shadow-lg hover:shadow-betster-500/20 border border-betster-700/30 relative"
      >
        {game.featured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </div>
          </div>
        )}
        
        <div className="aspect-video relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300 border border-white/20">
              <img
                src={game.image}
                alt={game.title}
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/300?text=Game";
                }}
              />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-xs flex items-center border border-white/10">
            <Clock className="h-3 w-3 mr-1.5 text-betster-400" />
            {game.timeLeft} remaining
          </div>
          <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-xs flex items-center border border-white/10">
            <span className="flex items-center">
              {Array.from({ length: game.difficulty === 'easy' ? 1 : game.difficulty === 'medium' ? 2 : 3 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
              ))}
              {Array.from({ length: 3 - (game.difficulty === 'easy' ? 1 : game.difficulty === 'medium' ? 2 : 3) }).map((_, i) => (
                <Star key={i + 3} className="h-3 w-3 text-betster-700" />
              ))}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-3">
            <div className={`rounded-full p-2 mr-3 ${
              game.id === 'bluff' ? 'bg-purple-500/20' : 
              game.id === 'topspot' ? 'bg-blue-500/20' : 
              'bg-amber-500/20'
            }`}>
              {game.id === 'bluff' ? <Shield className="h-5 w-5" /> :
               game.id === 'topspot' ? <Trophy className="h-5 w-5" /> :
               <Zap className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{game.title}</h3>
              <div className="flex gap-2 mt-1">
                {game.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-betster-800/50 text-betster-300 border border-betster-700/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-betster-300 mb-4">{game.description}</p>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-betster-700/20">
              <div className="flex items-center text-betster-300 mb-1 text-xs">
                <Trophy className="h-3 w-3 mr-1" /> Current Players
              </div>
              <p className="font-semibold text-white">{game.currentPlayers.toLocaleString()}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-betster-700/20">
              <div className="flex items-center text-betster-300 mb-1 text-xs">
                <Clock className="h-3 w-3 mr-1" /> Time Left
              </div>
              <p className="font-semibold text-white">{game.timeLeft}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-betster-700/20">
              <div className="flex items-center text-betster-300 mb-1 text-xs">
                <Coins className="h-3 w-3 mr-1" /> Prize Pool
              </div>
              <p className="font-semibold text-white">{game.payout}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <button
              onClick={onViewDetails}
              className="flex items-center betster-button-outline px-3 py-1.5"
            >
              <Info className="h-4 w-4 mr-1.5" />
              Details
            </button>
            <button
              onClick={onPlayNow}
              className="betster-button flex items-center transform transition-transform duration-200 hover:scale-105 text-white group"
            >
              Play Now 
              <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
