
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, ArrowRight } from "lucide-react";
import { Tournament } from "@/contexts/game/gameContextTypes";
import { useGame } from "@/contexts/GameContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

interface TournamentsListProps {
  tournaments: Tournament[];
}

export const TournamentsList = ({ tournaments }: TournamentsListProps) => {
  const { joinTournament } = useGame();

  if (tournaments.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Active Tournaments</h3>
        <p className="text-muted-foreground">Check back later for upcoming tournaments</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {tournament.name}
            </CardTitle>
            <CardDescription>{tournament.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{tournament.currentParticipants}/{tournament.maxParticipants} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Starts {new Date(tournament.startDate).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold">
                  Prize Pool: {formatCurrency(tournament.prizePool)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Entry: {formatCurrency(tournament.entryFee)}
                </div>
              </div>
              <div className="mt-2 inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                Format: {tournament.format}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => joinTournament(tournament.id)}
              disabled={tournament.currentParticipants >= tournament.maxParticipants}
            >
              {tournament.currentParticipants >= tournament.maxParticipants ? (
                "Tournament Full"
              ) : (
                <>
                  Join Tournament
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
