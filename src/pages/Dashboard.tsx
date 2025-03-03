
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Shield, Zap } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const gameModules = [
    {
      id: "bluff",
      title: "Bluff The Tough",
      description: "Choose one number from 0-15. The player with the least chosen number wins first prize. The second and third least chosen numbers win second and third prizes. A game of strategy where you want to pick numbers others avoid!",
      color: "from-purple-500 to-pink-500",
      image: "/card-game.svg",
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: "topspot",
      title: "Top Spot",
      description: "Select one number from 0-15. Only the player with the least chosen number wins the prize. More challenging with a single winner taking 90% of the prize pool!",
      color: "from-blue-500 to-cyan-500",
      image: "/podium.svg",
      icon: <Trophy className="h-5 w-5" />
    },
    {
      id: "jackpot",
      title: "Jackpot Horse",
      description: "Choose one number from 0-200. Played only once daily with massive pools. The least chosen numbers win first, second, and third prizes. Join thousands of players for a chance at huge winnings!",
      color: "from-amber-500 to-orange-500",
      image: "/horseshoe.svg",
      icon: <Zap className="h-5 w-5" />
    }
  ];

  return (
    <AppLayout>
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            Game Modules
          </h1>
          <p className="text-betster-300">
            Select a game module to start playing. Remember, the least picked numbers win!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {gameModules.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className="group w-full rounded-xl premium-glass overflow-hidden transition-all hover:shadow-lg hover:shadow-betster-500/20"
              >
                <div className="aspect-video relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-full p-6 shadow-lg">
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
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <div className={`rounded-full p-2 mr-2 ${
                      game.id === 'bluff' ? 'bg-purple-500/20' : 
                      game.id === 'topspot' ? 'bg-blue-500/20' : 
                      'bg-amber-500/20'
                    }`}>
                      {game.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{game.title}</h3>
                  </div>
                  <p className="text-betster-300 mb-4">{game.description}</p>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/pools/${game.id}`)}
                      className="betster-button flex items-center"
                    >
                      Play Now <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-betster-700/30">
          <h2 className="font-semibold mb-2 text-white">How to Play</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-betster-300">
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
