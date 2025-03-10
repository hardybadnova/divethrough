
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, ArrowRight } from "lucide-react";
import { League } from "@/contexts/game/gameContextTypes";
import { useGame } from "@/contexts/GameContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

interface LeaguesListProps {
  leagues: League[];
}

export const LeaguesList = ({ leagues }: LeaguesListProps) => {
  const { joinLeague } = useGame();

  if (leagues.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Active Leagues</h3>
        <p className="text-muted-foreground">Check back later for upcoming leagues</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {leagues.map((league) => (
        <Card key={league.id} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {league.name}
            </CardTitle>
            <CardDescription>{league.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{league.currentParticipants}/{league.maxParticipants} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Starts {new Date(league.startDate).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold">
                  Prize Pool: {formatCurrency(league.prizePool)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Entry: {formatCurrency(league.entryFee)}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => joinLeague(league.id)}
              disabled={league.currentParticipants >= league.maxParticipants}
            >
              {league.currentParticipants >= league.maxParticipants ? (
                "League Full"
              ) : (
                <>
                  Join League
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </motion.div>
  );
};
