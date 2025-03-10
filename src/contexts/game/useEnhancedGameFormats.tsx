
import { useState } from 'react';
import { 
  League, 
  Tournament, 
  SpecialEvent, 
  LeagueRound, 
  TournamentRound, 
  TournamentMatch, 
  SpecialRule 
} from '@/types/game';
import { toast } from '@/hooks/use-toast';

// Sample data for enhanced game formats
const sampleLeagues: League[] = [
  {
    id: 'league-001',
    name: 'Number Masters League',
    description: 'Weekly league with progressive number challenges',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    entryFee: 50,
    prizePool: 5000,
    maxParticipants: 100,
    currentParticipants: 42,
    gameType: 'bluff',
    status: 'upcoming',
    rounds: [
      {
        id: 'round-001',
        name: 'Qualification Round',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
        pools: ['pool-001', 'pool-002', 'pool-003']
      },
      {
        id: 'round-002',
        name: 'Semi-Finals',
        startDate: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
        endDate: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
        pools: ['pool-004', 'pool-005']
      },
      {
        id: 'round-003',
        name: 'Finals',
        startDate: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
        endDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        pools: ['pool-006']
      }
    ]
  },
  {
    id: 'league-002',
    name: 'Premium Strategy League',
    description: 'High stakes league for experienced players',
    startDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
    entryFee: 200,
    prizePool: 25000,
    maxParticipants: 150,
    currentParticipants: 78,
    gameType: 'topspot',
    status: 'upcoming',
    rounds: [
      {
        id: 'round-004',
        name: 'Qualification Round',
        startDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        endDate: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
        pools: ['pool-007', 'pool-008', 'pool-009', 'pool-010']
      },
      {
        id: 'round-005',
        name: 'Quarter-Finals',
        startDate: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
        endDate: new Date(Date.now() + 691200000).toISOString(), // 8 days from now
        pools: ['pool-011', 'pool-012', 'pool-013', 'pool-014']
      },
      {
        id: 'round-006',
        name: 'Semi-Finals',
        startDate: new Date(Date.now() + 777600000).toISOString(), // 9 days from now
        endDate: new Date(Date.now() + 864000000).toISOString(), // 10 days from now
        pools: ['pool-015', 'pool-016']
      },
      {
        id: 'round-007',
        name: 'Finals',
        startDate: new Date(Date.now() + 950400000).toISOString(), // 11 days from now
        endDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
        pools: ['pool-017']
      }
    ]
  }
];

const sampleTournaments: Tournament[] = [
  {
    id: 'tournament-001',
    name: 'Rapid Fire Tournament',
    description: 'Fast-paced knockout tournament with quick rounds',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    entryFee: 25,
    prizePool: 2500,
    maxParticipants: 64,
    currentParticipants: 38,
    gameType: 'jackpot',
    status: 'upcoming',
    format: 'knockout',
    rounds: [
      {
        id: 'tround-001',
        name: 'Round of 64',
        order: 1,
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 129600000).toISOString(), // 1.5 days from now
        matches: Array.from({ length: 32 }, (_, i) => ({
          id: `match-${i+1}`,
          poolId: `pool-t-${i+1}`,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          status: 'scheduled'
        }))
      },
      {
        id: 'tround-002',
        name: 'Round of 32',
        order: 2,
        startDate: new Date(Date.now() + 129600000).toISOString(), // 1.5 days from now
        endDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        matches: Array.from({ length: 16 }, (_, i) => ({
          id: `match-${i+33}`,
          poolId: `pool-t-${i+33}`,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          status: 'scheduled'
        }))
      },
      {
        id: 'tround-003',
        name: 'Round of 16',
        order: 3,
        startDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        endDate: new Date(Date.now() + 216000000).toISOString(), // 2.5 days from now
        matches: Array.from({ length: 8 }, (_, i) => ({
          id: `match-${i+49}`,
          poolId: `pool-t-${i+49}`,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          status: 'scheduled'
        }))
      },
      {
        id: 'tround-004',
        name: 'Quarter-Finals',
        order: 4,
        startDate: new Date(Date.now() + 216000000).toISOString(), // 2.5 days from now
        endDate: new Date(Date.now() + 232200000).toISOString(), // 2.7 days from now
        matches: Array.from({ length: 4 }, (_, i) => ({
          id: `match-${i+57}`,
          poolId: `pool-t-${i+57}`,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          status: 'scheduled'
        }))
      },
      {
        id: 'tround-005',
        name: 'Semi-Finals',
        order: 5,
        startDate: new Date(Date.now() + 232200000).toISOString(), // 2.7 days from now
        endDate: new Date(Date.now() + 241200000).toISOString(), // 2.8 days from now
        matches: Array.from({ length: 2 }, (_, i) => ({
          id: `match-${i+61}`,
          poolId: `pool-t-${i+61}`,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          status: 'scheduled'
        }))
      },
      {
        id: 'tround-006',
        name: 'Finals',
        order: 6,
        startDate: new Date(Date.now() + 241200000).toISOString(), // 2.8 days from now
        endDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
        matches: [
          {
            id: 'match-63',
            poolId: 'pool-t-63',
            player1Id: null,
            player2Id: null,
            winnerId: null,
            status: 'scheduled'
          }
        ]
      }
    ]
  }
];

const sampleSpecialEvents: SpecialEvent[] = [
  {
    id: 'event-001',
    name: 'Weekend Warriors',
    description: 'Special weekend event with unique rules and boosted prizes',
    startDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now (Friday)
    endDate: new Date(Date.now() + 432000000).toISOString(), // 5 days from now (Sunday)
    entryFee: 30,
    prizePool: 3000,
    maxParticipants: 200,
    currentParticipants: 87,
    gameType: 'bluff',
    status: 'upcoming',
    specialRules: [
      {
        id: 'rule-001',
        name: 'Double Or Nothing',
        description: 'If your number is the least picked, you win double; if it\'s the most picked, you lose everything',
        effect: 'double_prize_risk'
      },
      {
        id: 'rule-002',
        name: 'Hidden Numbers',
        description: 'You cannot see which numbers other players have already selected',
        effect: 'hidden_selections'
      }
    ],
    pools: ['pool-se-001', 'pool-se-002', 'pool-se-003']
  },
  {
    id: 'event-002',
    name: 'Mystery Number Challenge',
    description: 'Special event where some numbers have hidden multipliers',
    startDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 691200000).toISOString(), // 8 days from now
    entryFee: 40,
    prizePool: 4000,
    maxParticipants: 100,
    currentParticipants: 23,
    gameType: 'topspot',
    status: 'upcoming',
    specialRules: [
      {
        id: 'rule-003',
        name: 'Mystery Multipliers',
        description: 'Some numbers have hidden 2x, 3x, or 5x multipliers that are revealed after the game ends',
        effect: 'hidden_multipliers'
      },
      {
        id: 'rule-004',
        name: 'Extra Picks',
        description: 'Players can select up to 3 numbers instead of just 1',
        effect: 'multiple_selections'
      }
    ],
    pools: ['pool-se-004', 'pool-se-005']
  }
];

export function useEnhancedGameFormats() {
  const [leagues, setLeagues] = useState<League[]>(sampleLeagues);
  const [tournaments, setTournaments] = useState<Tournament[]>(sampleTournaments);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>(sampleSpecialEvents);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentSpecialEvent, setCurrentSpecialEvent] = useState<SpecialEvent | null>(null);
  
  const getLeagues = () => leagues;
  const getTournaments = () => tournaments;
  const getSpecialEvents = () => specialEvents;
  
  const getCurrentLeague = () => currentLeague;
  const getCurrentTournament = () => currentTournament;
  const getCurrentSpecialEvent = () => currentSpecialEvent;
  
  const joinLeague = async (leagueId: string) => {
    try {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) {
        throw new Error('League not found');
      }
      
      // Check if the league is full
      if (league.currentParticipants >= league.maxParticipants) {
        throw new Error('This league is already at maximum capacity');
      }
      
      // Get the user from the window object
      const user = window.auth?.user;
      if (!user) {
        throw new Error('You must be logged in to join a league');
      }
      
      // Check if user has enough balance
      if (user.wallet < league.entryFee) {
        throw new Error(`You need at least ${league.entryFee} in your wallet to join this league`);
      }
      
      // Process the join - in a real app this would involve an API call
      // Simulate joining the league by increasing participant count
      setLeagues(prevLeagues => 
        prevLeagues.map(l => 
          l.id === leagueId 
            ? { ...l, currentParticipants: l.currentParticipants + 1 } 
            : l
        )
      );
      
      // Set as current league
      setCurrentLeague(league);
      
      toast({
        title: "League Joined",
        description: `You've successfully joined the ${league.name}`
      });
    } catch (error: any) {
      console.error("Error joining league:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join the league",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const joinTournament = async (tournamentId: string) => {
    try {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      
      // Check if the tournament is full
      if (tournament.currentParticipants >= tournament.maxParticipants) {
        throw new Error('This tournament is already at maximum capacity');
      }
      
      // Get the user from the window object
      const user = window.auth?.user;
      if (!user) {
        throw new Error('You must be logged in to join a tournament');
      }
      
      // Check if user has enough balance
      if (user.wallet < tournament.entryFee) {
        throw new Error(`You need at least ${tournament.entryFee} in your wallet to join this tournament`);
      }
      
      // Process the join - in a real app this would involve an API call
      // Simulate joining the tournament by increasing participant count
      setTournaments(prevTournaments => 
        prevTournaments.map(t => 
          t.id === tournamentId 
            ? { ...t, currentParticipants: t.currentParticipants + 1 } 
            : t
        )
      );
      
      // Set as current tournament
      setCurrentTournament(tournament);
      
      toast({
        title: "Tournament Joined",
        description: `You've successfully joined the ${tournament.name}`
      });
    } catch (error: any) {
      console.error("Error joining tournament:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join the tournament",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const joinSpecialEvent = async (eventId: string) => {
    try {
      const event = specialEvents.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if the event is full
      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('This event is already at maximum capacity');
      }
      
      // Get the user from the window object
      const user = window.auth?.user;
      if (!user) {
        throw new Error('You must be logged in to join an event');
      }
      
      // Check if user has enough balance
      if (user.wallet < event.entryFee) {
        throw new Error(`You need at least ${event.entryFee} in your wallet to join this event`);
      }
      
      // Process the join - in a real app this would involve an API call
      // Simulate joining the event by increasing participant count
      setSpecialEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId 
            ? { ...e, currentParticipants: e.currentParticipants + 1 } 
            : e
        )
      );
      
      // Set as current event
      setCurrentSpecialEvent(event);
      
      toast({
        title: "Event Joined",
        description: `You've successfully joined the ${event.name}`
      });
    } catch (error: any) {
      console.error("Error joining special event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join the event",
        variant: "destructive"
      });
      throw error;
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
    getCurrentSpecialEvent
  };
}
