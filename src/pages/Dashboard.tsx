
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();

  const gameModules = [
    {
      id: "bluff",
      title: "Bluff The Tough",
      description: "Test your bluffing skills",
      color: "from-purple-500 to-pink-500",
      image: "/card-game.svg"
    },
    {
      id: "topspot",
      title: "Top Spot",
      description: "Race to the top",
      color: "from-blue-500 to-cyan-500",
      image: "/podium.svg"
    },
    {
      id: "jackpot",
      title: "Jackpot Horse",
      description: "Massive prize pools",
      color: "from-amber-500 to-orange-500",
      image: "/horseshoe.svg"
    }
  ];

  return (
    <AppLayout>
      <div className="flex-1 container max-w-lg mx-auto px-4 py-6">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Game Modules
          </h1>
          <p className="text-muted-foreground">
            Select a game module to start playing
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
              <button
                onClick={() => navigate(`/pools/${game.id}`)}
                className="group w-full rounded-xl glass-card overflow-hidden transition-all hover:shadow-lg hover:shadow-betster-500/20 hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-30 group-hover:opacity-40 transition-opacity`}></div>
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
                  <h3 className="text-xl font-semibold">{game.title}</h3>
                  <p className="text-muted-foreground mt-1">{game.description}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
