
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameSearch from './GameSearch';
import { motion } from 'framer-motion';
import { Filter, Trophy, Flame, Sparkles, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TabsSectionProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
}

const TabsSection: React.FC<TabsSectionProps> = ({ 
  selectedTab, 
  setSelectedTab, 
  setSearchQuery 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Difficulty Levels' },
    { value: 'easy', label: 'Easy Games' },
    { value: 'medium', label: 'Medium Games' },
    { value: 'hard', label: 'Hard Games' }
  ];

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    // Here you would typically apply the difficulty filter
    // For now, we'll just log it
    console.log(`Selected difficulty: ${difficulty}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-4"
    >
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <TabsList className="justify-start overflow-x-auto flex-nowrap scrollbar-hide">
              <TabsTrigger value="all" className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                All Games
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-1.5">
                <Flame className="h-4 w-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Upcoming
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1 bg-black/40 border-betster-700/30 text-betster-300 hover:text-betster-100">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-betster-700/30">
                <DropdownMenuLabel>Difficulty Level</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => handleDifficultyChange(option.value)}
                    className={selectedDifficulty === option.value ? "bg-betster-700/30" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <GameSearch onSearch={setSearchQuery} />
          </div>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default TabsSection;
