import { useContext } from 'react';
import { GameContext } from '../context/GameProvider';
import { MIN_PLAYERS } from '../types/game';

/**
 * Main hook for accessing game state and functionality
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

/**
 * Hook for accessing and managing lobby-related state
 */
export function useLobby() {
  const { state, createLobby, joinLobby, leaveLobby, updateSettings, toggleReady, startGame } = useGame();
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  
  // Calculate derived state
  const lobbyState = {
    lobbyCode: state.lobbyCode,
    players: state.players,
    isHost: currentPlayer?.isHost || false,
    isReady: currentPlayer?.isReady || false,
    allPlayersReady: state.players.every(p => p.isReady),
    playerCount: state.players.length,
    canStart: state.players.length >= MIN_PLAYERS && state.players.every(p => p.isReady),
    isLoading: state.isLoading,
    loadingOperation: state.loadingOperation,
    error: state.error
  };
  
  return {
    ...lobbyState,
    createLobby,
    joinLobby,
    leaveLobby,
    updateSettings,
    toggleReady,
    startGame
  };
}

/**
 * Hook for accessing the current player's role and abilities
 */
export function usePlayerRole() {
  const { state, performAction } = useGame();
  const { getCurrentPlayer } = useGame();
  const currentPlayerInfo = getCurrentPlayer();
  
  // Get all players that can be targeted based on current player's role
  const getTargetablePlayers = () => {
    // Mafia can kill anyone who is alive except other mafia
    if (currentPlayerInfo.isMafia && state.phase === 'night') {
      return state.players.filter(p => 
        p.isAlive && 
        p.role !== 'mafia' && 
        p.id !== state.currentPlayerId
      );
    }
    
    // Detectives can investigate anyone alive except themselves
    if (currentPlayerInfo.isDetective && state.phase === 'night') {
      return state.players.filter(p => 
        p.isAlive && 
        p.id !== state.currentPlayerId
      );
    }
    
    // During voting phase, everyone can vote on anyone alive except themselves
    if (state.phase === 'voting') {
      return state.players.filter(p => 
        p.isAlive && 
        p.id !== state.currentPlayerId
      );
    }
    
    return [];
  };
  
  // Check if the player can perform a specific action
  const canPerformAction = (actionType: 'kill' | 'investigate' | 'vote') => {
    if (!currentPlayerInfo.isAlive) return false;
    
    switch (actionType) {
      case 'kill':
        return currentPlayerInfo.isMafia && state.phase === 'night';
      case 'investigate':
        return currentPlayerInfo.isDetective && state.phase === 'night';
      case 'vote':
        return state.phase === 'voting';
      default:
        return false;
    }
  };
  
  // Check if an action has already been performed this turn
  const hasPerformedAction = (actionType: 'kill' | 'investigate' | 'vote') => {
    if (!state.currentPlayerId) return false;
    
    return state.actions.some(action => 
      action.sourcePlayerId === state.currentPlayerId &&
      action.type === actionType &&
      action.turnNumber === state.turn
    );
  };
  
  return {
    ...currentPlayerInfo,
    targetablePlayers: getTargetablePlayers(),
    canPerformAction,
    hasPerformedAction,
    performAction
  };
}

/**
 * Hook for accessing and submitting evidence
 */
export function useEvidence() {
  const { state, submitEvidence } = useGame();
  
  // Get evidence submitted by the current player
  const myEvidence = state.currentPlayerId 
    ? state.evidence.filter(e => e.playerId === state.currentPlayerId)
    : [];
  
  // Get all evidence visible to the current player
  const visibleEvidence = state.evidence.filter(e => {
    // Own evidence is always visible
    if (e.playerId === state.currentPlayerId) return true;
    
    // During day phase, all evidence is visible
    if (state.phase === 'day' || state.phase === 'voting' || state.phase === 'results') return true;
    
    // Otherwise, only mafia can see other mafia's evidence
    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
    const evidenceOwner = state.players.find(p => p.id === e.playerId);
    
    return currentPlayer?.role === 'mafia' && evidenceOwner?.role === 'mafia';
  });
  
  return {
    myEvidence,
    visibleEvidence,
    submitEvidence
  };
}

/**
 * Hook for accessing game phase and turn information
 */
export function useGamePhase() {
  const { state } = useGame();
  
  // Get time left in current phase (assuming server-managed phase timing)
  const getTimeLeft = () => {
    // In a real app, this would calculate based on server time and phase start time
    // For now, return a mock value
    return state.phase === 'night' ? 300 : 600; // 5 or 10 minutes in seconds
  };
  
  return {
    phase: state.phase,
    turn: state.turn,
    timeLeft: getTimeLeft(),
    isGameActive: state.status === 'in-game',
    winner: state.winner
  };
} 