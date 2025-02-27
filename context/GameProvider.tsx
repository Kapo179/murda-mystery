import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { gameReducer, calculateRoles, assignRolesToPlayers } from '../reducers/gameReducer';
import { 
  GameState, 
  GameActionType, 
  initialGameState,
  Player,
  CurrentPlayerInfo,
  Evidence,
  GameAction as GameActionType
} from '../types/game';
import { v4 as uuidv4 } from 'uuid';

// Mock API calls - to be replaced with real backend calls
const mockApiCalls = {
  createLobby: async (playerName: string): Promise<{ lobbyCode: string, playerId: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a random 6 character lobby code
    const lobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = uuidv4();
    
    return { lobbyCode, playerId };
  },
  
  joinLobby: async (lobbyCode: string, playerName: string): Promise<{ playerId: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate lobby code (in a real app, this would check if the lobby exists)
    if (lobbyCode.length !== 6) {
      throw new Error('Invalid lobby code');
    }
    
    const playerId = uuidv4();
    return { playerId };
  },
  
  startGame: async (lobbyCode: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, this would initialize the game on the server
  }
};

// Define the context type
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameActionType>;
  // Helper functions
  createLobby: (playerName: string) => Promise<void>;
  joinLobby: (lobbyCode: string, playerName: string) => Promise<void>;
  leaveLobby: () => void;
  updateSettings: (settings: Partial<typeof initialGameState.settings>) => void;
  startGame: () => Promise<void>;
  toggleReady: () => void;
  performAction: (actionType: 'kill' | 'investigate' | 'vote', targetPlayerId: string) => void;
  submitEvidence: (evidence: Omit<Evidence, 'id' | 'playerId' | 'timestamp'>) => void;
  getCurrentPlayer: () => CurrentPlayerInfo;
};

// Create the context
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Create the provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Create a lobby and join as host
  const createLobby = useCallback(async (playerName: string) => {
    try {
      dispatch({ type: 'CREATE_LOBBY_REQUEST' });
      
      // Call API to create lobby
      const { lobbyCode, playerId } = await mockApiCalls.createLobby(playerName);
      
      // Update state with success
      dispatch({ 
        type: 'CREATE_LOBBY_SUCCESS', 
        payload: { lobbyCode, playerId } 
      });
      
      // Add the host player
      const hostPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: true,
        isReady: true, // Host is automatically ready
        isAlive: true,
        role: null,
        status: 'waiting'
      };
      
      dispatch({
        type: 'ADD_PLAYER',
        payload: hostPlayer
      });
    } catch (error) {
      // Handle error
      dispatch({ 
        type: 'CREATE_LOBBY_ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to create lobby' } 
      });
    }
  }, []);

  // Join an existing lobby
  const joinLobby = useCallback(async (lobbyCode: string, playerName: string) => {
    try {
      dispatch({ 
        type: 'JOIN_LOBBY_REQUEST', 
        payload: { lobbyCode } 
      });
      
      // Call API to join lobby
      const { playerId } = await mockApiCalls.joinLobby(lobbyCode, playerName);
      
      // Update state with success
      dispatch({ 
        type: 'JOIN_LOBBY_SUCCESS', 
        payload: { playerId } 
      });
      
      // Add the player
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: false,
        isReady: false,
        isAlive: true,
        role: null,
        status: 'waiting'
      };
      
      dispatch({
        type: 'ADD_PLAYER',
        payload: newPlayer
      });
    } catch (error) {
      // Handle error
      dispatch({ 
        type: 'JOIN_LOBBY_ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to join lobby' } 
      });
    }
  }, []);

  // Leave the current lobby
  const leaveLobby = useCallback(() => {
    dispatch({ type: 'LEAVE_LOBBY' });
  }, []);

  // Update game settings
  const updateSettings = useCallback((settings: Partial<typeof initialGameState.settings>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: settings
    });
  }, []);

  // Toggle ready status for current player
  const toggleReady = useCallback(() => {
    const currentPlayer = state.players.find(player => player.id === state.currentPlayerId);
    if (currentPlayer) {
      dispatch({
        type: 'UPDATE_PLAYER_READY',
        payload: {
          playerId: currentPlayer.id,
          isReady: !currentPlayer.isReady
        }
      });
    }
  }, [state.players, state.currentPlayerId]);

  // Start the game
  const startGame = useCallback(async () => {
    try {
      dispatch({ type: 'START_GAME_REQUEST' });
      
      // Call API to start game
      if (state.lobbyCode) {
        await mockApiCalls.startGame(state.lobbyCode);
      }
      
      // Calculate and assign roles
      const playerIds = state.players.map(player => player.id);
      const roles = calculateRoles(playerIds.length);
      const roleAssignments = assignRolesToPlayers(playerIds, roles);
      
      // Update assignments
      dispatch({
        type: 'ASSIGN_ROLES',
        payload: { roleAssignments }
      });
      
      // Update game state
      dispatch({ type: 'START_GAME_SUCCESS' });
    } catch (error) {
      dispatch({ 
        type: 'START_GAME_ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to start game' } 
      });
    }
  }, [state.lobbyCode, state.players]);

  // Perform a game action (kill, investigate, vote)
  const performAction = useCallback((actionType: 'kill' | 'investigate' | 'vote', targetPlayerId: string) => {
    if (!state.currentPlayerId) return;
    
    const newAction: GameActionType = {
      id: uuidv4(),
      type: actionType,
      sourcePlayerId: state.currentPlayerId,
      targetPlayerId,
      turnNumber: state.turn,
      timestamp: Date.now()
    };
    
    dispatch({
      type: 'PERFORM_ACTION',
      payload: newAction
    });
  }, [state.currentPlayerId, state.turn]);

  // Submit evidence (photos/videos)
  const submitEvidence = useCallback((evidence: Omit<Evidence, 'id' | 'playerId' | 'timestamp'>) => {
    if (!state.currentPlayerId) return;
    
    const completeEvidence: Evidence = {
      ...evidence,
      id: uuidv4(),
      playerId: state.currentPlayerId,
      timestamp: Date.now()
    };
    
    dispatch({
      type: 'SUBMIT_EVIDENCE',
      payload: completeEvidence
    });
  }, [state.currentPlayerId]);

  // Get current player info with derived properties
  const getCurrentPlayer = useCallback((): CurrentPlayerInfo => {
    const player = state.players.find(p => p.id === state.currentPlayerId) || null;
    
    return {
      player,
      isHost: player?.isHost || false,
      isAlive: player?.isAlive || false,
      isMafia: player?.role === 'mafia',
      isDetective: player?.role === 'detective',
      isCivilian: player?.role === 'civilian',
      canPerformAction: Boolean(
        player?.isAlive && 
        state.status === 'in-game' &&
        ((state.phase === 'night' && player.role !== 'civilian') || 
         state.phase === 'voting')
      )
    };
  }, [state.players, state.currentPlayerId, state.status, state.phase]);

  // Context value
  const contextValue: GameContextType = {
    state,
    dispatch,
    createLobby,
    joinLobby,
    leaveLobby,
    updateSettings,
    startGame,
    toggleReady,
    performAction,
    submitEvidence,
    getCurrentPlayer
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}; 