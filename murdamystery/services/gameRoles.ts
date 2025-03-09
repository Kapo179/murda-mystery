import type { GameRole } from '@/components/game/views/GameView';

interface GameRoles {
  mafia: string[];
  detective: string[];
  civilian: string[];
}

/**
 * Assigns roles to players
 * @param players Array of player IDs
 * @param mafiaCount Number of mafia to assign
 * @param useDetectives Whether to include detective roles (deprecated, kept for backward compatibility)
 * @returns Object with players grouped by roles
 */
export function assignRoles(
  players: string[], 
  mafiaCount: number,
  useDetectives: boolean = false // Parameter kept for backwards compatibility
) {
  // Make a copy of players array to shuffle
  const shuffledPlayers = [...players];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
  }
  
  // Assign roles
  const mafia = shuffledPlayers.slice(0, mafiaCount);
  
  // Detectives removed - all non-mafia players are now civilians
  const civilian = shuffledPlayers.slice(mafiaCount);
  
  // Return roles (keeping empty detective array for backward compatibility)
  return {
    mafia,
    detective: [], // Empty array - no more detectives
    civilian
  };
}

/**
 * Gets a player's role
 * @param playerId Player ID to check
 * @param roles Roles object from assignRoles
 * @returns The player's role
 */
export function getPlayerRole(
  playerId: string,
  roles: { mafia: string[], detective: string[], civilian: string[] }
): 'mafia' | 'civilian' {
  // Check if player is mafia
  if (roles.mafia.includes(playerId)) {
    return 'mafia';
  }
  
  // We no longer assign detective roles, but check for backward compatibility
  if (roles.detective.includes(playerId)) {
    return 'civilian'; // Convert any existing detective to civilian
  }
  
  // Default to civilian
  return 'civilian';
} 