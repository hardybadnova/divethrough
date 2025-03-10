
import React, { createContext, useContext } from 'react';
import { useGameState } from './useGameState';
import { GameContextType, League, Tournament, SpecialEvent } from './gameContextTypes';
import { getPoolsByGameType, getWinners, getReferralInfo } from './gameUtils';
import { getMilestoneBonus, getMilestoneProgress } from './milestones';
import { useGameActions } from './useGameActions';
import { useEnhancedGameFormats } from './useEnhancedGameFormats';

// Create a game context
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    pools,
    currentPool,
    setCurrentPool,
    players,
    setPlayers,
    chatMessages,
    user
  } = useGameState();
  
  const {
    initializeData,
    joinPool,
    leavePool,
    lockInNumber,
    sendMessage,
    addReferral,
    resetGame
  } = useGameActions(pools, setCurrentPool, setPlayers, players);

  // Enhanced game formats
  const {
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
  } = useEnhancedGameFormats();

  return (
    <GameContext.Provider
      value={{
        pools,
        currentPool,
        players,
        chatMessages,
        joinPool,
        leavePool,
        getPoolsByGameType: (gameType) => getPoolsByGameType(pools, gameType),
        getWinners: (poolId) => getWinners(pools, poolId),
        resetGame,
        getMilestoneBonus,
        getReferralInfo: () => getReferralInfo(players, user?.id),
        addReferral,
        getMilestoneProgress: (userId) => getMilestoneProgress(players, userId),
        lockInNumber,
        sendMessage,
        initializeData,
        // New enhanced game format methods
        getLeagues,
        getTournaments,
        getSpecialEvents,
        joinLeague,
        joinTournament,
        joinSpecialEvent,
        getCurrentLeague,
        getCurrentTournament,
        getCurrentSpecialEvent,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
