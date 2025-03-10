
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameSearch from './GameSearch';

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
  return (
    <div className="mt-4 flex justify-between items-center">
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="justify-start overflow-x-auto flex-nowrap scrollbar-hide">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
          <GameSearch onSearch={setSearchQuery} />
        </div>
      </Tabs>
    </div>
  );
};

export default TabsSection;
