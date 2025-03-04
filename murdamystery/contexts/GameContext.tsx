import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameRole } from '@/components/game/views/GameView';
import { useGameRole } from '@/hooks/useGameRole';

interface GameContextType {
  role: GameRole;
  playerCount: number;
  alivePlayers: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGameRole();
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 