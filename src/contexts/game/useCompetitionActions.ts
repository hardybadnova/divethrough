
import { toast } from "@/hooks/use-toast";
import { League, Tournament, SpecialEvent } from './gameContextTypes';

export function useCompetitionActions(
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  tournaments: Tournament[],
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>,
  specialEvents: SpecialEvent[],
  setSpecialEvents: React.Dispatch<React.SetStateAction<SpecialEvent[]>>,
  setCurrentLeague: React.Dispatch<React.SetStateAction<League | null>>,
  setCurrentTournament: React.Dispatch<React.SetStateAction<Tournament | null>>,
  setCurrentSpecialEvent: React.Dispatch<React.SetStateAction<SpecialEvent | null>>
) {
  const joinLeague = async (leagueId: string) => {
    const user = window.auth?.user;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a league",
        variant: "destructive"
      });
      return;
    }
    
    const leagueToJoin = leagues.find(l => l.id === leagueId);
    if (!leagueToJoin) {
      toast({
        title: "League Not Found",
        description: "The selected league was not found",
        variant: "destructive"
      });
      return;
    }
    
    if (leagueToJoin.currentParticipants >= leagueToJoin.maxParticipants) {
      toast({
        title: "League Full",
        description: "This league is already at maximum capacity",
        variant: "destructive"
      });
      return;
    }
    
    if (user.wallet < leagueToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${leagueToJoin.entryFee} in your wallet to join this league`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLeagues(prevLeagues => 
        prevLeagues.map(league => 
          league.id === leagueId 
            ? { ...league, currentParticipants: league.currentParticipants + 1 } 
            : league
        )
      );
      
      setCurrentLeague(leagueToJoin);
      
      toast({
        title: "League Joined",
        description: `You've successfully joined ${leagueToJoin.name}`
      });
    } catch (error) {
      console.error("Error joining league:", error);
      toast({
        title: "Error",
        description: "Failed to join the league. Please try again.",
        variant: "destructive"
      });
    }
  };

  const joinTournament = async (tournamentId: string) => {
    const user = window.auth?.user;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a tournament",
        variant: "destructive"
      });
      return;
    }
    
    const tournamentToJoin = tournaments.find(t => t.id === tournamentId);
    if (!tournamentToJoin) {
      toast({
        title: "Tournament Not Found",
        description: "The selected tournament was not found",
        variant: "destructive"
      });
      return;
    }
    
    if (tournamentToJoin.currentParticipants >= tournamentToJoin.maxParticipants) {
      toast({
        title: "Tournament Full",
        description: "This tournament is already at maximum capacity",
        variant: "destructive"
      });
      return;
    }
    
    if (user.wallet < tournamentToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${tournamentToJoin.entryFee} in your wallet to join this tournament`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setTournaments(prevTournaments => 
        prevTournaments.map(tournament => 
          tournament.id === tournamentId 
            ? { ...tournament, currentParticipants: tournament.currentParticipants + 1 } 
            : tournament
        )
      );
      
      setCurrentTournament(tournamentToJoin);
      
      toast({
        title: "Tournament Joined",
        description: `You've successfully joined ${tournamentToJoin.name}`
      });
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast({
        title: "Error",
        description: "Failed to join the tournament. Please try again.",
        variant: "destructive"
      });
    }
  };

  const joinSpecialEvent = async (eventId: string) => {
    const user = window.auth?.user;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a special event",
        variant: "destructive"
      });
      return;
    }
    
    const eventToJoin = specialEvents.find(e => e.id === eventId);
    if (!eventToJoin) {
      toast({
        title: "Event Not Found",
        description: "The selected special event was not found",
        variant: "destructive"
      });
      return;
    }
    
    if (eventToJoin.currentParticipants >= eventToJoin.maxParticipants) {
      toast({
        title: "Event Full",
        description: "This special event is already at maximum capacity",
        variant: "destructive"
      });
      return;
    }
    
    if (user.wallet < eventToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${eventToJoin.entryFee} in your wallet to join this special event`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSpecialEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, currentParticipants: event.currentParticipants + 1 } 
            : event
        )
      );
      
      setCurrentSpecialEvent(eventToJoin);
      
      toast({
        title: "Special Event Joined",
        description: `You've successfully joined ${eventToJoin.name}`
      });
    } catch (error) {
      console.error("Error joining special event:", error);
      toast({
        title: "Error",
        description: "Failed to join the special event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    joinLeague,
    joinTournament,
    joinSpecialEvent
  };
}
