import type { GameRole } from '@/components/game/views/GameView';

interface GameRoles {
  mafia: string[];
  detective: string[];
  civilian: string[];
}

export function assignRoles(
  players: string[],
  mafiaCount: number,
  useDetectives: boolean
): GameRoles {
  // Shuffle array
  const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
  
  // Assign roles
  const roles: GameRoles = {
    mafia: [],
    detective: [],
    civilian: []
  };
  
  // Assign mafia
  roles.mafia = shuffledPlayers.slice(0, mafiaCount);
  
  // Assign detectives if used
  const detectiveCount = useDetectives ? Math.max(1, Math.floor(players.length * 0.15)) : 0;
  roles.detective = shuffledPlayers.slice(mafiaCount, mafiaCount + detectiveCount);
  
  // The rest are civilians
  roles.civilian = shuffledPlayers.slice(mafiaCount + detectiveCount);
  
  return roles;
}

export function getPlayerRole(
  playerId: string,
  roles: GameRoles
): GameRole {
  if (roles.mafia.includes(playerId)) {
    return 'mafia';
  } else if (roles.detective.includes(playerId)) {
    return 'detective';
  } else {
    return 'civilian';
  }
} 