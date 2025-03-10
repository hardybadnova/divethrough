
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Shield, Zap, Sparkles, Clock, Star, Users, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for smoother transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const gameModules = [
    {
      id: "bluff",
      title: "Bluff The Tough",
      description: "Choose one number from 0-15. The player with the least chosen number wins first prize. The second and third least chosen numbers win second and third prizes. A game of strategy where you want to pick numbers others avoid!",
      color: "from-purple-500 to-pink-500",
      image: "/card-game.svg",
      icon: <Shield className="h-5 w-5" />,
      tags: ["strategy", "multi-winner", "popular"],
      currentPlayers: 187,
      timeLeft: "4h 32m",
      payout: "₹25,000",
      difficulty: "medium"
    },
    {
      id: "topspot",
      title: "Top Spot",
      description: "Select one number from 0-15. Only the player with the least chosen number wins the prize. More challenging with a single winner taking 90% of the prize pool!",
      color: "from-blue-500 to-cyan-500",
      image: "/podium.svg",
      icon: <Trophy className="h-5 w-5" />,
      tags: ["winner-takes-all", "difficult"],
      currentPlayers: 92,
      timeLeft: "2h 45m",
      payout: "₹12,000",
      difficulty: "hard"
    },
    {
      id: "jackpot",
      title: "Jackpot Horse",
      description: "Choose one number from 0-200. Played only once daily with massive pools. The least chosen numbers win first, second, and third prizes. Join thousands of players for a chance at huge winnings!",
      color: "from-amber-500 to-orange-500",
      image: "/horseshoe.svg",
      icon: <Zap className="h-5 w-5" />,
      tags: ["daily", "high-stakes", "new"],
      currentPlayers: 2453,
      timeLeft: "21h 12m",
      payout: "₹100,000",
      difficulty: "easy",
      featured: true
    }
  ];

  const filteredGames = selectedTab === "all" 
    ? gameModules 
    : selectedTab === "featured" 
      ? gameModules.filter(game => game.featured) 
      : gameModules.filter(game => game.tags.includes(selectedTab));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AppLayout>
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight text-gradient">
              Welcome Back{user?.username ? `, ${user.username}` : ''}
            </h1>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-betster-600/20 to-betster-800/20 backdrop-blur-md rounded-lg p-2 border border-betster-700/30"
            >
              <Sparkles className="h-5 w-5 text-betster-400" />
            </motion.div>
          </div>
          <p className="text-betster-300">
            Select a game module to start playing. Remember, the least picked numbers win!
          </p>
          
          {/* Quick Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-3 gap-3 mt-4"
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
              <div className="flex items-center mb-1">
                <Coins className="h-4 w-4 mr-1.5 text-amber-400" />
                <span className="text-xs text-betster-300">Balance</span>
              </div>
              <p className="text-lg font-semibold text-white">₹{user?.wallet || 0}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
              <div className="flex items-center mb-1">
                <Trophy className="h-4 w-4 mr-1.5 text-blue-400" />
                <span className="text-xs text-betster-300">Active Games</span>
              </div>
              <p className="text-lg font-semibold text-white">3</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
              <div className="flex items-center mb-1">
                <Users className="h-4 w-4 mr-1.5 text-green-400" />
                <span className="text-xs text-betster-300">Players</span>
              </div>
              <p className="text-lg font-semibold text-white">2.7K</p>
            </div>
          </motion.div>
          
          <div className="mt-4">
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
                <TabsTrigger value="all">All Games</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl premium-glass overflow-hidden animate-pulse h-64">
                <div className="h-full w-full bg-gradient-to-br from-betster-900/50 to-betster-950/50"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6"
          >
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
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
                        {game.icon}
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
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => navigate(`/pools/${game.id}`)}
                        className="betster-button flex items-center transform transition-transform duration-200 hover:scale-105 text-white group"
                      >
                        Play Now 
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
