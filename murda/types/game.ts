/**
 * Types for game state management
 */

// Player status in the game
export type PlayerStatus = 'waiting' | 'ready' | 'playing' | 'eliminated' | 'spectating';

// Available roles in the game
export type Role = 'mafia' | 'detective' | 'civilian';

// Game phases
export type GamePhase = 'lobby' | 'night' | 'day' | 'voting' | 'results' | 'ended';

// Action types for voting
export type ActionType = 'kill' | 'investigate' | 'vote';

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
  mafiaCount: number;
  detectiveCount: number;
  enableLocation: boolean;
  enableProximityKill: boolean;
  proximityDistance: number; // in meters
  dayDuration: number; // in minutes
  nightDuration: number; // in minutes
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
  turn: number;
  
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
  winner: 'mafia' | 'civilians' | null;
  
  // UI state tracking
  isLoading: boolean;
  loadingOperation: string | null;
  error: string | null;
  lastUpdated: number;
}

// Initial/default game state
export const initialGameState: GameState = {
  gameId: null,
  lobbyCode: null,
  status: 'idle',
  phase: 'lobby',
  turn: 0,
  
  players: [],
  currentPlayerId: null,
  
  settings: {
    playerCount: 0,
    mafiaCount: 1,
    detectiveCount: 1,
    enableLocation: false,
    enableProximityKill: false,
    proximityDistance: 100,
    dayDuration: 10,
    nightDuration: 5
  },
  
  roles: [],
  roleAssignments: [],
  
  actions: [],
  evidence: [],
  winner: null,
  
  isLoading: false,
  loadingOperation: null,
  error: null,
  lastUpdated: Date.now()
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
  
  // Game setup
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'START_GAME_REQUEST' }
  | { type: 'START_GAME_SUCCESS' }
  | { type: 'START_GAME_ERROR'; payload: { error: string } }
  | { type: 'ASSIGN_ROLES'; payload: { roleAssignments: RoleAssignment[] } }
  
  // Game progress
  | { type: 'ADVANCE_TURN' }
  | { type: 'CHANGE_PHASE'; payload: { phase: GamePhase } }
  | { type: 'PERFORM_ACTION'; payload: GameAction }
  | { type: 'SUBMIT_EVIDENCE'; payload: Evidence }
  | { type: 'END_GAME'; payload: { winner: 'mafia' | 'civilians' } }
  
  // State management
  | { type: 'SET_LOADING'; payload: { operation: string | null } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_GAME' };

// Helper type for getting the current player
export interface CurrentPlayerInfo {
  player: Player | null;
  isHost: boolean;
  isAlive: boolean;
  isMafia: boolean;
  isDetective: boolean;
  isCivilian: boolean;
  canPerformAction: boolean;
}

// Constants
export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12; 