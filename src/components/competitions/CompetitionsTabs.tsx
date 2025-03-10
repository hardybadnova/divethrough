
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGame } from "@/contexts/GameContext";
import { LeaguesList } from "./LeaguesList";
import { TournamentsList } from "./TournamentsList";
import { SpecialEventsList } from "./SpecialEventsList";

export const CompetitionsTabs = () => {
  const { getLeagues, getTournaments, getSpecialEvents } = useGame();
  
  const leagues = getLeagues();
  const tournaments = getTournaments();
  const specialEvents = getSpecialEvents();

  return (
    <Tabs defaultValue="leagues" className="w-full">
      <TabsList className="w-full flex justify-center mb-6">
        <TabsTrigger value="leagues">Leagues</TabsTrigger>
        <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        <TabsTrigger value="special-events">Special Events</TabsTrigger>
      </TabsList>
      
      <TabsContent value="leagues">
        <LeaguesList leagues={leagues} />
      </TabsContent>
      
      <TabsContent value="tournaments">
        <TournamentsList tournaments={tournaments} />
      </TabsContent>
      
      <TabsContent value="special-events">
        <SpecialEventsList events={specialEvents} />
      </TabsContent>
    </Tabs>
  );
};
