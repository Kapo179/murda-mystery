/**
 * Types for game state management
 */

// Player status in the game
export type PlayerStatus = 'waiting' | 'ready' | 'playing' | 'eliminated' | 'spectating';

// Available roles in the game
export type Role = 'hunter' | 'alive';

// Game phases
export type GamePhase = 'lobby' | 'active' | 'ended';

// Action types for tagging
export type ActionType = 'tag' | 'eliminate';

// Player representation
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
  role: Role | null;
  status: PlayerStatus;
  position?: {
    latitude: number;
    longitude: number;
  };
  lastUpdated?: number; // For position freshness
}

// Role assignment
export interface RoleAssignment {
  playerId: string;
  role: Role;
}

// Action record
export interface GameAction {
  id: string;
  type: ActionType;
  sourcePlayerId: string;
  targetPlayerId: string;
  turnNumber: number;
  timestamp: number;
}

// Evidence record
export interface Evidence {
  id: string;
  playerId: string;
  targetId: string | null;
  imageUri: string;
  isVideo: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  caption?: string;
}

// Game settings
export interface GameSettings {
  playerCount: number;
  hunterCount: number;
  enableLocation: boolean;
  enableProximityTag: boolean;
  tagDistance: number; // in meters
  gameDuration: number; // in minutes
  hunterRevealTime: number; // in seconds - time before hunters are revealed to alive players
}

// Game status
export type GameStatus = 
  | 'idle' 
  | 'loading' 
  | 'creating' 
  | 'joining' 
  | 'in-lobby' 
  | 'starting' 
  | 'in-game' 
  | 'ended' 
  | 'error';

// The complete game state
export interface GameState {
  // Core game info
  gameId: string | null;
  lobbyCode: string | null;
  status: GameStatus;
  phase: GamePhase;
  
  // Players
  players: Player[];
  currentPlayerId: string | null;
  
  // Game setup
  settings: GameSettings;
  roles: Role[];
  roleAssignments: RoleAssignment[];
  
  // Game progress
  actions: GameAction[];
  evidence: Evidence[];
  winner: 'hunters' | 'last-survivor' | null;
  
  // UI state tracking
  isLoading: boolean;
  loadingOperation: string | null;
  error: string | null;
  lastUpdated: number;
  
  // Additional game state
  playerCount: number;
  alivePlayers: number;
  gamePhase: 'lobby' | 'active' | 'ended';
  startTime?: number;
  endTime?: number;
}

// Initial/default game state
export const initialGameState: GameState = {
  gameId: null,
  lobbyCode: null,
  status: 'idle',
  phase: 'lobby',
  
  players: [],
  currentPlayerId: null,
  
  settings: {
    playerCount: 0,
    hunterCount: 1,
    enableLocation: true,
    enableProximityTag: true,
    tagDistance: 15, // 15 meters
    gameDuration: 30, // 30 minutes
    hunterRevealTime: 60, // 60 seconds
  },
  
  roles: [],
  roleAssignments: [],
  
  actions: [],
  evidence: [],
  winner: null,
  
  isLoading: false,
  loadingOperation: null,
  error: null,
  lastUpdated: Date.now(),
  
  playerCount: 0,
  alivePlayers: 0,
  gamePhase: 'lobby',
};

// Typed actions for the reducer
export type GameActionType =
  // Lobby actions
  | { type: 'CREATE_LOBBY_REQUEST' }
  | { type: 'CREATE_LOBBY_SUCCESS'; payload: { lobbyCode: string; playerId: string } }
  | { type: 'CREATE_LOBBY_ERROR'; payload: { error: string } }
  | { type: 'JOIN_LOBBY_REQUEST'; payload: { lobbyCode: string } }
  | { type: 'JOIN_LOBBY_SUCCESS'; payload: { playerId: string } }
  | { type: 'JOIN_LOBBY_ERROR'; payload: { error: string } }
  | { type: 'LEAVE_LOBBY' }
  
  // Player actions
  | { type: 'UPDATE_PLAYER_STATUS'; payload: { playerId: string; status: PlayerStatus } }
  | { type: 'UPDATE_PLAYER_READY'; payload: { playerId: string; isReady: boolean } }
  | { type: 'UPDATE_PLAYER_POSITION'; payload: { playerId: string; latitude: number; longitude: number } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: { playerId: string } }
  | { type: 'TAG_PLAYER'; payload: { hunterId: string; targetId: string } }
  
  // Game setup
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'START_GAME_REQUEST' }
  | { type: 'START_GAME_SUCCESS' }
  | { type: 'START_GAME_ERROR'; payload: { error: string } }
  | { type: 'ASSIGN_ROLES'; payload: { roleAssignments: RoleAssignment[] } }
  
  // Game progress
  | { type: 'CHANGE_PHASE'; payload: { phase: GamePhase } }
  | { type: 'PERFORM_ACTION'; payload: GameAction }
  | { type: 'SUBMIT_EVIDENCE'; payload: Evidence }
  | { type: 'END_GAME'; payload: { winner: 'hunters' | 'last-survivor' } }
  
  // State management
  | { type: 'SET_LOADING'; payload: { operation: string | null } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_GAME' };

// Helper type for getting the current player
export interface CurrentPlayerInfo {
  player: Player | null;
  isHost: boolean;
  isAlive: boolean;
  isHunter: boolean;
  isTarget: boolean;
  canTag: boolean;
}

// Constants
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

// Game roles type
export type GameRole = 'hunter' | 'alive';

// Game role constants
export const GAME_ROLES = {
  HUNTER: 'hunter' as GameRole,
  ALIVE: 'alive' as GameRole,
}; 