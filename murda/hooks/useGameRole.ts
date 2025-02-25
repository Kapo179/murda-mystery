import { useState, useEffect } from 'react';
import { GameRole } from '@/components/game/views/GameView';
import { assignRoles, getPlayerRole } from '@/services/gameRoles';

interface GameState {
  role: GameRole;
  playerCount: number;
  alivePlayers: number;
  gameRoles?: {
    mafia: string[];
    detective: string[];
    civilian: string[];
  };
}

export function useGameRole() {
  const [gameState, setGameState] = useState<GameState>({
    role: 'civilian',
    playerCount: 8,
    alivePlayers: 8,
  });

  useEffect(() => {
    // This would normally come from your game server
    const mockPlayers = Array.from({ length: 8 }, (_, i) => `player${i + 1}`);
    const roles = assignRoles(mockPlayers, 2, true);
    
    // For testing, assume we're player1
    const myRole = getPlayerRole('player1', roles);
    
    setGameState(prev => ({
      ...prev,
      role: myRole,
      gameRoles: roles
    }));
  }, []);

  return gameState;
} 