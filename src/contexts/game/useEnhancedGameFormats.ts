
import { useCompetitionState } from './useCompetitionState';
import { useCompetitionActions } from './useCompetitionActions';

export function useEnhancedGameFormats() {
  const {
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
  } = useCompetitionState();

  const {
    joinLeague,
    joinTournament,
    joinSpecialEvent
  } = useCompetitionActions(
    leagues,
    setLeagues,
    tournaments,
    setTournaments,
    specialEvents,
    setSpecialEvents,
    setCurrentLeague,
    setCurrentTournament,
    setCurrentSpecialEvent
  );

  // Getter functions
  const getLeagues = () => leagues;
  const getTournaments = () => tournaments;
  const getSpecialEvents = () => specialEvents;
  const getCurrentLeague = () => currentLeague;
  const getCurrentTournament = () => currentTournament;
  const getCurrentSpecialEvent = () => currentSpecialEvent;

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
