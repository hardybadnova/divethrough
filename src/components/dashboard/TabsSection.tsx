
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameSearch from './GameSearch';
import { motion } from 'framer-motion';
import { Filter, Trophy, Flame, Sparkles, Clock, Star, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStake, setSelectedStake] = useState('all');

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    
    // Update active filters
    if (difficulty === 'all') {
      setActiveFilters(prev => prev.filter(filter => !filter.includes('Difficulty')));
    } else {
      const newFilters = activeFilters.filter(filter => !filter.includes('Difficulty'));
      newFilters.push(`Difficulty: ${difficulty}`);
      setActiveFilters(newFilters);
    }
  };

  const handleStakeChange = (stake: string) => {
    setSelectedStake(stake);
    
    // Update active filters
    if (stake === 'all') {
      setActiveFilters(prev => prev.filter(filter => !filter.includes('Stake')));
    } else {
      const newFilters = activeFilters.filter(filter => !filter.includes('Stake'));
      newFilters.push(`Stake: ${stake}`);
      setActiveFilters(newFilters);
    }
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSelectedDifficulty('all');
    setSelectedStake('all');
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
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1 bg-black/40 border-betster-700/30 text-betster-300 hover:text-betster-100">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-betster-700/30">
                  <DropdownMenuLabel>Game Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-betster-400 px-2 py-1.5">Difficulty Level</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                      <DropdownMenuRadioItem value="all">All Difficulties</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="easy">Easy Games</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="medium">Medium Games</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="hard">Hard Games</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-betster-400 px-2 py-1.5">Stake Amount</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={selectedStake} onValueChange={handleStakeChange}>
                      <DropdownMenuRadioItem value="all">All Stakes</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="low">Low Stakes (₹10-100)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="medium">Medium Stakes (₹100-500)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="high">High Stakes (₹500+)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={clearFilters} className="text-center justify-center text-betster-400 hover:text-betster-100">
                    Clear All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1 bg-black/40 border-betster-700/30 text-betster-300 hover:text-betster-100">
                    <DollarSign className="h-4 w-4" />
                    <span>Prize Pool</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-betster-700/30">
                  <DropdownMenuLabel>Prize Pool Size</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Small (Under ₹1,000)</DropdownMenuItem>
                  <DropdownMenuItem>Medium (₹1,000 - ₹5,000)</DropdownMenuItem>
                  <DropdownMenuItem>Large (₹5,000 - ₹10,000)</DropdownMenuItem>
                  <DropdownMenuItem>Jackpot (₹10,000+)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1 bg-black/40 border-betster-700/30 text-betster-300 hover:text-betster-100">
                    <Zap className="h-4 w-4" />
                    <span>Game Type</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-betster-700/30">
                  <DropdownMenuLabel>Game Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Bluff The Tough</DropdownMenuItem>
                  <DropdownMenuItem>Lucky Number</DropdownMenuItem>
                  <DropdownMenuItem>Top Spot</DropdownMenuItem>
                  <DropdownMenuItem>Special Events</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <GameSearch onSearch={setSearchQuery} />
          </div>
          
          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((filter, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-betster-700/20 hover:bg-betster-700/30 gap-1 text-xs"
                  onClick={() => {
                    // Remove this filter
                    setActiveFilters(prev => prev.filter((_, i) => i !== index));
                    // Also reset the corresponding filter setting
                    if (filter.includes('Difficulty')) setSelectedDifficulty('all');
                    if (filter.includes('Stake')) setSelectedStake('all');
                  }}
                >
                  {filter}
                  <span className="ml-1 cursor-pointer">&times;</span>
                </Badge>
              ))}
              <Button 
                variant="link" 
                size="sm" 
                className="h-5 text-xs text-betster-400 p-0"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </motion.div>
  );
};

export default TabsSection;
