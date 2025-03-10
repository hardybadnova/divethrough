
import { GameDetails } from "@/components/dashboard/GameDetailsModal";

export const gameModules: GameDetails[] = [
  {
    id: "bluff",
    title: "Bluff The Tough",
    description: "Choose one number from 0-15. The player with the least chosen number wins first prize. The second and third least chosen numbers win second and third prizes. A game of strategy where you want to pick numbers others avoid!",
    color: "from-purple-500 to-pink-500",
    image: "/card-game.svg",
    tags: ["strategy", "multi-winner", "popular"],
    currentPlayers: 187,
    timeLeft: "4h 32m",
    payout: "₹25,000",
    difficulty: "medium",
    rules: [
      "Choose a number between 0-15",
      "The three least picked numbers win prizes",
      "First prize: 60% of pool, Second: 30%, Third: 10%",
      "Game ends in 4 hours 32 minutes"
    ]
  },
  {
    id: "topspot",
    title: "Top Spot",
    description: "Select one number from 0-15. Only the player with the least chosen number wins the prize. More challenging with a single winner taking 90% of the prize pool!",
    color: "from-blue-500 to-cyan-500",
    image: "/podium.svg",
    tags: ["winner-takes-all", "difficult"],
    currentPlayers: 92,
    timeLeft: "2h 45m",
    payout: "₹12,000",
    difficulty: "hard",
    rules: [
      "Choose a number between 0-15",
      "Only the least picked number wins",
      "Winner takes 90% of the pool",
      "Game ends in 2 hours 45 minutes"
    ]
  },
  {
    id: "jackpot",
    title: "Jackpot Horse",
    description: "Choose one number from 0-200. Played only once daily with massive pools. The least chosen numbers win first, second, and third prizes. Join thousands of players for a chance at huge winnings!",
    color: "from-amber-500 to-orange-500",
    image: "/horseshoe.svg",
    tags: ["daily", "high-stakes", "new"],
    currentPlayers: 2453,
    timeLeft: "21h 12m",
    payout: "₹100,000",
    difficulty: "easy",
    featured: true,
    rules: [
      "Choose a number between 0-200",
      "The three least picked numbers win prizes",
      "First prize: 70% of pool, Second: 20%, Third: 10%",
      "Game is played once daily"
    ]
  }
];
