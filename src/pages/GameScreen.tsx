
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import GameHeader from "@/components/game/GameHeader";
import PreGameCountdown from "@/components/game/PreGameCountdown";
import GamePlayTab from "@/components/game/GamePlayTab";
import ChatTab from "@/components/game/ChatTab";
import HintsTab from "@/components/game/HintsTab";
import ShareDialog from "@/components/game/ShareDialog";
import ExitDialog from "@/components/game/ExitDialog";
import MobileNavigation from "@/components/game/MobileNavigation";
import OfflineGameIndicator from "@/components/game/OfflineGameIndicator";

// Custom hooks
import { useGameTimer } from "@/hooks/game/useGameTimer";
import { useGamePool } from "@/hooks/game/useGamePool";
import { useGameNumberSelection } from "@/hooks/game/useGameNumberSelection";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useGameTabs, GameTabType } from "@/hooks/game/useGameTabs";

// Icons
import { HelpCircle, MessageCircle, Info } from "lucide-react";

const GameScreen = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { chatMessages, sendMessage } = useGame();
  const { user } = useAuth();
  const { isOnline } = useOfflineSync();
  
  // State
  const [gameState, setGameState] = useState<"pre-game" | "in-progress" | "completed">("pre-game");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Custom hooks
  const { preGameCountdown, gameTimer, formatTime } = useGameTimer({
    poolId,
    gameState,
    setGameState,
  });

  const { pool, gameUrl, confirmExit, handleChangeTable } = useGamePool({
    poolId,
    setIsJoining,
    setIsLeaving,
  });

  const { selectedNumber, isLocked, handleNumberSelect, handleLockNumber } = useGameNumberSelection({
    pool,
    gameState,
  });
  
  const { activeTab, setActiveTab } = useGameTabs({
    pool,
  });

  // Exit dialog handlers
  const handleExitGame = () => {
    setShowExitDialog(true);
  };

  if (!pool) return null;
  
  return (
    <AppLayout>
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-4 md:py-6">
        {/* Game header component */}
        <GameHeader
          pool={pool}
          gameUrl={gameUrl}
          handleExitGame={handleExitGame}
          handleChangeTable={handleChangeTable}
          setShowShareDialog={setShowShareDialog}
        />
        
        {/* Player count indicator */}
        <div className="mb-4 glass-card inline-flex items-center rounded-full px-4 py-1">
          <span className="text-sm font-medium">Players Online: </span>
          <span className="ml-2 text-sm font-bold text-betster-500">
            {pool.currentPlayers}
          </span>
          <span className="ml-1 relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        
        {/* Offline indicator */}
        <OfflineGameIndicator 
          isOnline={isOnline} 
          gameState={gameState} 
        />
        
        {/* Pre-game countdown */}
        {gameState === "pre-game" && (
          <PreGameCountdown 
            preGameCountdown={preGameCountdown} 
            isOnline={isOnline} 
          />
        )}
        
        {/* Game tabs */}
        <Tabs
          defaultValue="game"
          className="w-full"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as GameTabType)}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger
              value="game"
              className="flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Game</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="hints"
              className="flex items-center gap-1"
            >
              <Info className="h-4 w-4" />
              <span>Hints</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Game tab content */}
          <TabsContent value="game">
            <GamePlayTab
              gameState={gameState}
              gameTimer={gameTimer}
              formatTime={formatTime}
              pool={pool}
              selectedNumber={selectedNumber}
              isLocked={isLocked}
              handleNumberSelect={handleNumberSelect}
              handleLockNumber={handleLockNumber}
              user={user}
            />
          </TabsContent>

          {/* Chat tab content */}
          <TabsContent value="chat">
            <ChatTab
              chatMessages={chatMessages}
              user={user}
              sendMessage={sendMessage}
            />
          </TabsContent>

          {/* Hints tab content */}
          <TabsContent value="hints">
            <HintsTab pool={pool} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      <ExitDialog
        open={showExitDialog}
        setOpen={setShowExitDialog}
        gameState={gameState}
        confirmExit={confirmExit}
      />
      
      <ShareDialog
        open={showShareDialog}
        setOpen={setShowShareDialog}
        gameUrl={gameUrl}
        pool={pool}
      />
      
      <MobileNavigation />
    </AppLayout>
  );
};

export default GameScreen;
