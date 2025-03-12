
import { useState } from "react";
import { Pool } from "@/types/game";

export type GameTabType = "game" | "chat" | "hints";

interface UseGameTabsProps {
  pool: Pool | null;
}

export function useGameTabs({ pool }: UseGameTabsProps) {
  const [activeTab, setActiveTab] = useState<GameTabType>("game");

  return {
    activeTab,
    setActiveTab,
  };
}
