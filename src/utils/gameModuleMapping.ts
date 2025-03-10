
import { GameModule } from "@/data/gameModules";
import { GameDetails } from "@/components/dashboard/GameDetailsModal";

export const mapModuleToGameDetails = (module: GameModule): GameDetails => {
  // Default values for game details
  const defaultImage = `/placeholder.svg`;
  const defaultTags = ["game", module.id];
  const defaultColor = module.id === "bluff" 
    ? "from-purple-500 to-purple-800" 
    : module.id === "topspot" 
      ? "from-blue-500 to-blue-800" 
      : "from-amber-500 to-amber-800";
  
  return {
    id: module.id,
    title: module.name,
    description: module.description,
    color: defaultColor,
    image: defaultImage,
    tags: module.isNew ? [...defaultTags, "new"] : module.isHot ? [...defaultTags, "hot"] : defaultTags,
    currentPlayers: Math.floor(Math.random() * 5000) + 1000, // Mock data
    timeLeft: "48 hours",
    payout: `₹${Math.floor(Math.random() * 100000) + 10000}`,
    difficulty: module.id === "bluff" ? "hard" : module.id === "topspot" ? "medium" : "easy",
    featured: module.isHot || module.isNew,
    rules: [],
    winningStrategy: ""
  };
};

export const applySearchFilter = (games: GameDetails[], searchQuery: string) => {
  if (!searchQuery) return games;
  
  return games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};

export const applyTabFilter = (games: GameDetails[], selectedTab: string) => {
  if (selectedTab === "all") return games;
  if (selectedTab === "featured") return games.filter(game => game.featured);
  return games.filter(game => game.tags.includes(selectedTab));
};
