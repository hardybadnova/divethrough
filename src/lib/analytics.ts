import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from "./firebase";

export const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  logEvent(analytics, eventName, eventParams);
};

export const trackGameStart = (gameType: string, entryFee: number) => {
  trackEvent('game_start', { gameType, entryFee });
};

export const trackGameComplete = (gameType: string, result: 'win' | 'lose', amount: number) => {
  trackEvent('game_complete', { gameType, result, amount });
};