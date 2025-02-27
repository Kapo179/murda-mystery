import { 
  GameState, 
  GameActionType, 
  initialGameState, 
  Role,
  RoleAssignment
} from '../types/game';
import { v4 as uuidv4 } from 'uuid';

/**
 * Reducer for handling game state transitions
 */
export function gameReducer(state: GameState, action: GameActionType): GameState {
  // For most state updates, include a timestamp
  const withTimestamp = {
    ...state,
    lastUpdated: Date.now()
  };

  switch (action.type) {
    // Lobby management actions
    case 'CREATE_LOBBY_REQUEST':
      return {
        ...withTimestamp,
        status: 'creating',
        isLoading: true,
        loadingOperation: 'creating_lobby',
        error: null
      };

    case 'CREATE_LOBBY_SUCCESS':
      return {
        ...withTimestamp,
        status: 'in-lobby',
        lobbyCode: action.payload.lobbyCode,
        currentPlayerId: action.payload.playerId,
        isLoading: false,
        loadingOperation: null
      };

    case 'CREATE_LOBBY_ERROR':
      return {
        ...withTimestamp,
        status: 'error',
        isLoading: false,
        loadingOperation: null,
        error: action.payload.error
      };

    case 'JOIN_LOBBY_REQUEST':
      return {
        ...withTimestamp,
        status: 'joining',
        isLoading: true,
        loadingOperation: 'joining_lobby',
        error: null
      };

    case 'JOIN_LOBBY_SUCCESS':
      return {
        ...withTimestamp,
        status: 'in-lobby',
        currentPlayerId: action.payload.playerId,
        isLoading: false,
        loadingOperation: null
      };

    case 'JOIN_LOBBY_ERROR':
      return {
        ...withTimestamp,
        status: 'error',
        isLoading: false,
        loadingOperation: null,
        error: action.payload.error
      };

    case 'LEAVE_LOBBY':
      return initialGameState;

    // Player management actions
    case 'ADD_PLAYER':
      // Avoid adding duplicate players
      if (state.players.some(player => player.id === action.payload.id)) {
        return state;
      }
      return {
        ...withTimestamp,
        players: [...state.players, action.payload],
        settings: {
          ...state.settings,
          playerCount: state.players.length + 1
        }
      };

    case 'REMOVE_PLAYER':
      return {
        ...withTimestamp,
        players: state.players.filter(player => player.id !== action.payload.playerId),
        settings: {
          ...state.settings,
          playerCount: state.players.length - 1
        }
      };

    case 'UPDATE_PLAYER_STATUS':
      return {
        ...withTimestamp,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, status: action.payload.status } 
            : player
        )
      };

    case 'UPDATE_PLAYER_READY':
      return {
        ...withTimestamp,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, isReady: action.payload.isReady } 
            : player
        )
      };

    case 'UPDATE_PLAYER_POSITION':
      return {
        ...withTimestamp,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { 
                ...player, 
                position: {
                  latitude: action.payload.latitude,
                  longitude: action.payload.longitude
                }
              } 
            : player
        )
      };

    // Game setup actions
    case 'UPDATE_SETTINGS':
      return {
        ...withTimestamp,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case 'START_GAME_REQUEST':
      return {
        ...withTimestamp,
        status: 'starting',
        isLoading: true,
        loadingOperation: 'starting_game',
        error: null
      };

    case 'START_GAME_SUCCESS':
      return {
        ...withTimestamp,
        status: 'in-game',
        phase: 'night',
        turn: 1,
        isLoading: false,
        loadingOperation: null
      };

    case 'START_GAME_ERROR':
      return {
        ...withTimestamp,
        status: 'error',
        isLoading: false,
        loadingOperation: null,
        error: action.payload.error
      };

    case 'ASSIGN_ROLES':
      return {
        ...withTimestamp,
        roleAssignments: action.payload.roleAssignments,
        players: state.players.map(player => {
          const assignment = action.payload.roleAssignments.find(
            a => a.playerId === player.id
          );
          return {
            ...player,
            role: assignment ? assignment.role : player.role,
            status: 'playing',
            isAlive: true
          };
        })
      };

    // Game progress actions
    case 'ADVANCE_TURN':
      return {
        ...withTimestamp,
        turn: state.turn + 1,
        phase: 'night' // New turns always start with night phase
      };

    case 'CHANGE_PHASE':
      return {
        ...withTimestamp,
        phase: action.payload.phase
      };

    case 'PERFORM_ACTION':
      // Add the new action to the actions array
      const newAction = action.payload;
      
      // Process the action effects on players
      let updatedPlayers = [...state.players];
      
      if (newAction.type === 'kill') {
        // Mark target player as eliminated
        updatedPlayers = updatedPlayers.map(player => 
          player.id === newAction.targetPlayerId 
            ? { ...player, isAlive: false, status: 'eliminated' } 
            : player
        );
      }
      
      return {
        ...withTimestamp,
        actions: [...state.actions, newAction],
        players: updatedPlayers
      };

    case 'SUBMIT_EVIDENCE':
      return {
        ...withTimestamp,
        evidence: [...state.evidence, action.payload]
      };

    case 'END_GAME':
      return {
        ...withTimestamp,
        status: 'ended',
        winner: action.payload.winner,
        phase: 'ended'
      };

    // State management actions
    case 'SET_LOADING':
      return {
        ...withTimestamp,
        isLoading: action.payload.operation !== null,
        loadingOperation: action.payload.operation
      };

    case 'CLEAR_ERROR':
      return {
        ...withTimestamp,
        error: null
      };

    case 'RESET_GAME':
      return initialGameState;

    default:
      return state;
  }
}

/**
 * Helper function to calculate roles based on player count
 */
export function calculateRoles(playerCount: number): Role[] {
  // Determine number of each role based on player count
  let mafiaCount = Math.max(1, Math.floor(playerCount / 4));
  let detectiveCount = Math.max(1, Math.floor(playerCount / 6));
  const civilianCount = playerCount - mafiaCount - detectiveCount;
  
  // Create array of roles
  const roles: Role[] = [
    ...Array(mafiaCount).fill('mafia'),
    ...Array(detectiveCount).fill('detective'),
    ...Array(civilianCount).fill('civilian')
  ];
  
  return roles;
}

/**
 * Helper function to assign roles randomly to players
 */
export function assignRolesToPlayers(
  playerIds: string[],
  roles: Role[]
): RoleAssignment[] {
  // Shuffle the roles
  const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
  
  // Assign roles to players
  return playerIds.map((playerId, index) => ({
    playerId,
    role: shuffledRoles[index] || 'civilian' // Default to civilian if we run out of roles
  }));
} 