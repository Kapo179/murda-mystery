import { useState, useEffect, useRef } from 'react';
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
    gameRoles: {
      mafia: ['player1', 'player3'],
      detective: ['player2', 'player7'],
      civilian: ['player4', 'player5', 'player6', 'player8'],
    }
  });
  
  // Use a ref to ensure we only assign roles once
  const rolesAssigned = useRef(false);

  useEffect(() => {
    // Only assign roles if they haven't been assigned yet
    if (!rolesAssigned.current) {
      console.log("Assigning roles for the first time");
      // This would normally come from your game server
      const mockPlayers = Array.from({ length: 8 }, (_, i) => `player${i + 1}`);
      const roles = assignRoles(mockPlayers, 2, false);
      
      // For testing, assume we're player1
      const myRole = getPlayerRole('player1', roles);
      
      // Convert any existing detective roles in the data to civilians
      const updatedRoles = {
        ...roles,
        detective: [], // Empty detective array
        civilian: [...roles.civilian, ...roles.detective] // Move any detective roles to civilian
      };
      
      setGameState(prev => ({
        ...prev,
        role: myRole, // No need to check for detective since getPlayerRole already converts it
        gameRoles: updatedRoles
      }));
      
      // Mark roles as assigned to prevent reassignment
      rolesAssigned.current = true;
    }
  }, []);

  return gameState;
} 