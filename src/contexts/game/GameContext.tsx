
import React, { createContext, useContext } from 'react';
import { useGameState } from './useGameState';
import { GameContextType } from './gameContextTypes';
import { getPoolsByGameType, getWinners, getReferralInfo } from './gameUtils';
import { getMilestoneBonus, getMilestoneProgress } from './milestones';
import { useGameActions } from './useGameActions';
import { useEnhancedGameFormats } from './useEnhancedGameFormats';

// Create a game context
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Basic game state
  const {
    pools,
    currentPool,
    setCurrentPool,
    players,
    setPlayers,
    chatMessages,
    user
  } = useGameState();
  
  // Game actions
  const {
    initializeData,
    joinPool,
    leavePool,
    lockInNumber,
    sendMessage,
    addReferral,
    resetGame
  } = useGameActions(pools, setCurrentPool, setPlayers, players);

  // Enhanced game formats (leagues, tournaments, special events)
  const enhancedGameFormats = useEnhancedGameFormats();

  return (
    <GameContext.Provider
      value={{
        // Basic game state and actions
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
        
        // Enhanced game formats
        ...enhancedGameFormats
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
