
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import GamesList from "@/components/dashboard/GamesList";
import TabsSection from "@/components/dashboard/TabsSection";
import HowToPlay from "@/components/dashboard/HowToPlay";
import GameDetailsModal, { GameDetails } from "@/components/dashboard/GameDetailsModal";
import { applySearchFilter, applyTabFilter } from "@/utils/gameModuleMapping";

interface GamesSectionProps {
  gameDetailsArray: GameDetails[];
  isLoading: boolean;
}

const GamesSection: React.FC<GamesSectionProps> = ({ gameDetailsArray, isLoading }) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredGames = applySearchFilter(applyTabFilter(gameDetailsArray, selectedTab), searchQuery);

  const openGameDetails = (game: GameDetails) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTab('all');
  };

  return (
    <>
      <TabsSection 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab}
        setSearchQuery={setSearchQuery}
      />

      <Separator className="my-6" />

      <GamesList 
        filteredGames={filteredGames}
        isLoading={isLoading}
        openGameDetails={openGameDetails}
        resetFilters={resetFilters}
      />
      
      <HowToPlay />

      <GameDetailsModal 
        game={selectedGame} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default GamesSection;
