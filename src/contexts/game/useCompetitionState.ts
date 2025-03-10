
import { useState, useEffect } from 'react';
import { League, Tournament, SpecialEvent } from './gameContextTypes';
import { mockLeagues, mockTournaments, mockSpecialEvents } from './mockCompetitionData';

export function useCompetitionState() {
  const [leagues, setLeagues] = useState<League[]>(mockLeagues);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>(mockSpecialEvents);
  
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentSpecialEvent, setCurrentSpecialEvent] = useState<SpecialEvent | null>(null);

  useEffect(() => {
    console.log("Enhanced game formats initialized");
    
    if (window.game) {
      window.game.currentLeague = currentLeague;
      window.game.currentTournament = currentTournament;
      window.game.currentSpecialEvent = currentSpecialEvent;
    }
    
    return () => {
      if (window.game) {
        window.game.currentLeague = undefined;
        window.game.currentTournament = undefined;
        window.game.currentSpecialEvent = undefined;
      }
    };
  }, [currentLeague, currentTournament, currentSpecialEvent]);

  return {
    leagues,
    setLeagues,
    tournaments,
    setTournaments,
    specialEvents,
    setSpecialEvents,
    currentLeague,
    setCurrentLeague,
    currentTournament,
    setCurrentTournament,
    currentSpecialEvent,
    setCurrentSpecialEvent
  };
}
