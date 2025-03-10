
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface UseGameTimerProps {
  poolId: string | undefined;
  gameState: "pre-game" | "in-progress" | "completed";
  setGameState: React.Dispatch<React.SetStateAction<"pre-game" | "in-progress" | "completed">>;
}

export function useGameTimer({ poolId, gameState, setGameState }: UseGameTimerProps) {
  const navigate = useNavigate();
  const [preGameCountdown, setPreGameCountdown] = useState(20); // 20 seconds to change table
  const [gameTimer, setGameTimer] = useState(120); // 2 minutes game duration
  
  const preGameIntervalRef = useRef<number | null>(null);
  const gameIntervalRef = useRef<number | null>(null);

  // Format time in mm:ss format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Pre-game countdown timer
  useEffect(() => {
    if (preGameIntervalRef.current === null && gameState === "pre-game") {
      preGameIntervalRef.current = window.setInterval(() => {
        setPreGameCountdown((prev) => {
          if (prev <= 1) {
            if (preGameIntervalRef.current !== null) {
              clearInterval(preGameIntervalRef.current);
              preGameIntervalRef.current = null;
            }
            setGameState("in-progress");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (preGameIntervalRef.current !== null) {
        clearInterval(preGameIntervalRef.current);
        preGameIntervalRef.current = null;
      }
    };
  }, [gameState, setGameState]);

  // In-game timer
  useEffect(() => {
    if (gameState !== "in-progress") return;

    if (gameIntervalRef.current === null) {
      gameIntervalRef.current = window.setInterval(() => {
        setGameTimer((prev) => {
          if (prev <= 1) {
            if (gameIntervalRef.current !== null) {
              clearInterval(gameIntervalRef.current);
              gameIntervalRef.current = null;
            }
            setGameState("completed");

            setTimeout(() => {
              console.log("Game timer ended, navigating to results");
              navigate(`/result/${poolId}`);
            }, 500);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (gameIntervalRef.current !== null) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    };
  }, [gameState, navigate, poolId, setGameState]);

  // Navigate to results when game is completed
  useEffect(() => {
    if (gameState === "completed" && poolId) {
      console.log("Game state is completed, navigating to results");
      navigate(`/result/${poolId}`);
    }
  }, [gameState, navigate, poolId]);

  // Cleanup intervals when component unmounts
  useEffect(() => {
    return () => {
      if (preGameIntervalRef.current !== null) {
        clearInterval(preGameIntervalRef.current);
        preGameIntervalRef.current = null;
      }

      if (gameIntervalRef.current !== null) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    };
  }, []);

  return {
    preGameCountdown,
    gameTimer,
    formatTime,
  };
}
