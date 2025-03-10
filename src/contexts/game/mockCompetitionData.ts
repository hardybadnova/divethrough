
import { League, Tournament, SpecialEvent } from './gameContextTypes';

export const mockLeagues: League[] = [
  {
    id: "league-1",
    name: "Summer Premier League",
    description: "A seasonal league with multiple rounds and exciting prizes",
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
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

export const mockTournaments: Tournament[] = [
  {
    id: "tournament-1",
    name: "Weekend Knockout Challenge",
    description: "Quick knockout tournament with fast-paced gameplay",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
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

export const mockSpecialEvents: SpecialEvent[] = [
  {
    id: "event-1",
    name: "Lucky Numbers Extravaganza",
    description: "Special one-time event with unique rules and bonuses",
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
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
