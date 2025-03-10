
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Coins, Clock, ArrowRight, Shield, BarChart, Zap } from "lucide-react";
import { motion } from "framer-motion";

export interface GameDetails {
  id: string;
  title: string;
  description: string;
  color: string;
  image: string;
  tags: string[];
  currentPlayers: number;
  timeLeft: string;
  payout: string;
  difficulty: string;
  rules?: string[];
  winningStrategy?: string;
  featured?: boolean;
}

interface GameDetailsModalProps {
  game: GameDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ game, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!game) return null;

  const handlePlay = () => {
    onClose();
    navigate(`/pools/${game.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="premium-glass max-w-md md:max-w-2xl border-betster-700/30">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`rounded-full p-2 bg-gradient-to-br ${game.color}`}>
              <img
                src={game.image}
                alt={game.title}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/300?text=Game";
                }}
              />
            </div>
            <DialogTitle className="text-xl">{game.title}</DialogTitle>
          </div>
          <DialogDescription className="text-betster-300 mt-2">
            {game.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-4">
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
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-betster-700/20">
            <div className="flex items-center text-betster-300 mb-1 text-xs">
              <BarChart className="h-3 w-3 mr-1" /> Difficulty
            </div>
            <p className="font-semibold text-white capitalize">{game.difficulty}</p>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-betster-700/30 mb-4">
          <h3 className="font-semibold mb-2 text-white text-lg flex items-center">
            <Shield className="h-4 w-4 mr-2 text-betster-400" /> Game Rules
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-betster-300">
            {game.rules ? game.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            )) : (
              <>
                <li>Choose one number from a specified range</li>
                <li>The least chosen numbers win prizes</li>
                <li>Game ends when the timer runs out</li>
                <li>Winners are announced immediately after game end</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-betster-700/30 mb-4">
          <h3 className="font-semibold mb-2 text-white text-lg flex items-center">
            <Zap className="h-4 w-4 mr-2 text-betster-400" /> Winning Strategy
          </h3>
          <p className="text-sm text-betster-300">
            {game.winningStrategy || "Try to pick numbers that you think others won't choose. Look for patterns in previous games and avoid commonly selected numbers. Consider psychology of other players in making your selection."}
          </p>
        </div>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1 betster-button-outline">
              Close
            </Button>
            <Button onClick={handlePlay} className="flex-1 betster-button flex items-center justify-center group">
              Play Now
              <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;
