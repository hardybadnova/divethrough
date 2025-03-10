
import { useState, useEffect } from 'react';
import { League, Tournament, SpecialEvent } from './gameContextTypes';
import { toast } from "@/hooks/use-toast";

// Mock data for now - this would be replaced by real data from your backend
const mockLeagues: League[] = [
  {
    id: "league-1",
    name: "Summer Premier League",
    description: "A seasonal league with multiple rounds and exciting prizes",
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days later
    entryFee: 100,
    prizePool: 10000,
    maxParticipants: 100,
    currentParticipants: 32,
    gameType: "bluff",
    status: "upcoming",
    rounds: [
      {
        id: "round-1",
        name: "Round 1",
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        pools: ["pool-1", "pool-2", "pool-3"]
      },
      {
        id: "round-2",
        name: "Round 2",
        startDate: new Date(Date.now() + 86400000 * 8).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        pools: ["pool-4", "pool-5"]
      },
      {
        id: "round-3",
        name: "Finals",
        startDate: new Date(Date.now() + 86400000 * 16).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 20).toISOString(),
        pools: ["pool-6"]
      }
    ]
  }
];

const mockTournaments: Tournament[] = [
  {
    id: "tournament-1",
    name: "Weekend Knockout Challenge",
    description: "Quick knockout tournament with fast-paced gameplay",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days later
    entryFee: 50,
    prizePool: 5000,
    maxParticipants: 64,
    currentParticipants: 28,
    gameType: "topspot",
    status: "upcoming",
    format: "knockout",
    rounds: [
      {
        id: "round-1-t",
        name: "Round 1",
        order: 1,
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 2.5).toISOString(),
        matches: [
          {
            id: "match-1",
            poolId: "pool-7",
            player1Id: null,
            player2Id: null,
            winnerId: null,
            status: "scheduled"
          },
          {
            id: "match-2",
            poolId: "pool-8",
            player1Id: null,
            player2Id: null,
            winnerId: null,
            status: "scheduled"
          }
        ]
      },
      {
        id: "round-2-t",
        name: "Finals",
        order: 2,
        startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 3.5).toISOString(),
        matches: [
          {
            id: "match-3",
            poolId: "pool-9",
            player1Id: null,
            player2Id: null,
            winnerId: null,
            status: "scheduled"
          }
        ]
      }
    ]
  }
];

const mockSpecialEvents: SpecialEvent[] = [
  {
    id: "event-1",
    name: "Lucky Numbers Extravaganza",
    description: "Special one-time event with unique rules and bonuses",
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days later
    endDate: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days later
    entryFee: 75,
    prizePool: 7500,
    maxParticipants: 200,
    currentParticipants: 89,
    gameType: "jackpot",
    status: "upcoming",
    specialRules: [
      {
        id: "rule-1",
        name: "Double Points",
        description: "All points earned are doubled during this event",
        effect: "2x points multiplier"
      },
      {
        id: "rule-2",
        name: "Lucky Sevens",
        description: "Numbers containing 7 provide a 20% bonus if selected",
        effect: "20% bonus for numbers with 7"
      }
    ],
    pools: ["pool-10", "pool-11", "pool-12"]
  }
];

export function useEnhancedGameFormats() {
  const [leagues, setLeagues] = useState<League[]>(mockLeagues);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>(mockSpecialEvents);
  
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentSpecialEvent, setCurrentSpecialEvent] = useState<SpecialEvent | null>(null);

  useEffect(() => {
    // This would be replaced with real data fetching logic
    // For now, we're just using mock data
    console.log("Enhanced game formats initialized");
    
    // Make enhanced formats available to window object for hooks and debugging
    if (window.game) {
      window.game.currentLeague = currentLeague;
      window.game.currentTournament = currentTournament;
      window.game.currentSpecialEvent = currentSpecialEvent;
    }
    
    return () => {
      // Clean up window extensions
      if (window.game) {
        window.game.currentLeague = undefined;
        window.game.currentTournament = undefined;
        window.game.currentSpecialEvent = undefined;
      }
    };
  }, [currentLeague, currentTournament, currentSpecialEvent]);

  // Get all leagues
  const getLeagues = () => {
    return leagues;
  };

  // Get all tournaments
  const getTournaments = () => {
    return tournaments;
  };

  // Get all special events
  const getSpecialEvents = () => {
    return specialEvents;
  };

  // Get current league
  const getCurrentLeague = () => {
    return currentLeague;
  };

  // Get current tournament
  const getCurrentTournament = () => {
    return currentTournament;
  };

  // Get current special event
  const getCurrentSpecialEvent = () => {
    return currentSpecialEvent;
  };

  // Join a league
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
    
    // Check if user has enough balance
    if (user.wallet < leagueToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${leagueToJoin.entryFee} in your wallet to join this league`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // This would be replaced with real API call
      // For now, just update state locally
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

  // Join a tournament
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
    
    // Check if user has enough balance
    if (user.wallet < tournamentToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${tournamentToJoin.entryFee} in your wallet to join this tournament`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // This would be replaced with real API call
      // For now, just update state locally
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

  // Join a special event
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
    
    // Check if user has enough balance
    if (user.wallet < eventToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${eventToJoin.entryFee} in your wallet to join this special event`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // This would be replaced with real API call
      // For now, just update state locally
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
    leagues,
    tournaments,
    specialEvents,
    currentLeague,
    currentTournament,
    currentSpecialEvent,
    joinLeague,
    joinTournament,
    joinSpecialEvent,
    getLeagues,
    getTournaments,
    getSpecialEvents,
    getCurrentLeague,
    getCurrentTournament,
    getCurrentSpecialEvent,
  };
}
