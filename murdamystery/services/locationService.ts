import * as Location from 'expo-location';
import { useCallback, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';

export function useLocationTracking() {
  const { state, dispatch } = useGame();
  const currentPlayerId = state.currentPlayerId;
  
  const updateLocation = useCallback(async () => {
    if (!currentPlayerId) return;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      
      dispatch({
        type: 'UPDATE_PLAYER_POSITION',
        payload: {
          playerId: currentPlayerId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [currentPlayerId, dispatch]);
  
  // Update location periodically
  useEffect(() => {
    if (!currentPlayerId || state.status !== 'in-game') return;
    
    // Initial location update
    updateLocation();
    
    // Set up interval for location updates
    const intervalId = setInterval(updateLocation, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [currentPlayerId, state.status, updateLocation]);
  
  return { updateLocation };
} 