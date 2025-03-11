import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

// Constants
const LOCATION_TRACKING_TASK = 'background-location-tracking';
const TAG_DISTANCE = 15; // meters
const WARNING_DISTANCE = 50; // meters

// Task definition for background location tracking
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    // @ts-ignore
    const { locations } = data;
    // Process location updates in the background
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      
      // Here you would typically send the location to your backend
      // Since we can't access React state directly in a background task,
      // we'll trigger a local notification if needed
      
      // This is just a placeholder. In a real app, you'd compare with other players' locations
      // that you'd fetch from your backend
      const nearbyPlayers = []; // This would come from your backend
      
      if (nearbyPlayers.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Player Nearby!',
            body: 'A player is within range!',
            data: { type: 'proximity_alert' },
          },
          trigger: null, // Send immediately
        });
      }
    }
  }
});

interface ProximityManagerProps {
  enabled: boolean;
  playerRole: 'hunter' | 'alive';
  onProximityUpdate?: (nearbyPlayerIds: string[], nearestDistance: number | null) => void;
  onLocationUpdate?: (location: Location.LocationObject) => void;
  players: {
    id: string;
    role: string;
    isAlive: boolean;
    position?: { latitude: number; longitude: number };
  }[];
}

export function ProximityManager({
  enabled,
  playerRole,
  onProximityUpdate,
  onLocationUpdate,
  players
}: ProximityManagerProps) {
  const [foregroundPermission, setForegroundPermission] = useState(false);
  const [backgroundPermission, setBackgroundPermission] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const appState = useRef(AppState.currentState);
  
  // Request location permissions
  useEffect(() => {
    if (!enabled) return;
    
    (async () => {
      try {
        // Request foreground permission
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        setForegroundPermission(foregroundStatus === 'granted');
        
        // Request background permission (only needed for background tracking)
        if (foregroundStatus === 'granted') {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          setBackgroundPermission(backgroundStatus === 'granted');
        }
      } catch (error) {
        console.error('Error requesting location permissions:', error);
      }
    })();
    
    // Add app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      stopLocationTracking();
    };
  }, [enabled]);
  
  // Start or stop location tracking based on permissions
  useEffect(() => {
    if (enabled && foregroundPermission) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => {
      stopLocationTracking();
    };
  }, [enabled, foregroundPermission, players]);
  
  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      enabled &&
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active'
    ) {
      // App has come to the foreground
      startLocationTracking();
    } else if (
      enabled &&
      appState.current === 'active' && 
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to the background
      if (backgroundPermission) {
        startBackgroundLocationTracking();
      }
    }
    
    appState.current = nextAppState;
  };
  
  // Start tracking location in foreground
  const startLocationTracking = async () => {
    if (locationSubscription.current) {
      await locationSubscription.current.remove();
    }
    
    try {
      // Define accuracy based on role (hunters need higher accuracy)
      const accuracy = playerRole === 'hunter' 
        ? Location.Accuracy.High 
        : Location.Accuracy.Balanced;
      
      // Start watching position
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval: 5, // Update every 5 meters
          timeInterval: playerRole === 'hunter' ? 1000 : 2000, // Update more frequently for hunters
        },
        location => {
          // Notify parent component of location update
          if (onLocationUpdate) {
            onLocationUpdate(location);
          }
          
          // Check player proximity
          checkPlayerProximity(location);
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };
  
  // Start tracking location in background
  const startBackgroundLocationTracking = async () => {
    try {
      // Stop foreground tracking
      if (locationSubscription.current) {
        await locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      
      // Start background tracking
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Update every 10 seconds to conserve battery
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: 'Location tracking active',
          notificationBody: 'Game is tracking your location in the background',
          notificationColor: '#FF3B30',
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Fitness,
      });
    } catch (error) {
      console.error('Error starting background location tracking:', error);
    }
  };
  
  // Stop all location tracking
  const stopLocationTracking = async () => {
    try {
      // Stop foreground tracking
      if (locationSubscription.current) {
        await locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      
      // Stop background tracking
      if (TaskManager.isTaskDefined(LOCATION_TRACKING_TASK)) {
        const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        if (isRunning) {
          await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        }
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  };
  
  // Check proximity to other players
  const checkPlayerProximity = (location: Location.LocationObject) => {
    if (!location || !onProximityUpdate) return;
    
    const myCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
    
    const nearbyPlayers: string[] = [];
    let nearestDistance: number | null = null;
    
    // Filter players based on role
    const relevantPlayers = playerRole === 'hunter'
      ? players.filter(p => p.role === 'alive' && p.isAlive)  // Hunters look for alive players
      : players.filter(p => p.role === 'hunter');  // Alive players look for hunters
    
    // Check distances
    relevantPlayers.forEach(player => {
      if (!player.position) return;
      
      const distance = calculateDistance(myCoords, player.position);
      
      // Update nearest distance
      if (nearestDistance === null || distance < nearestDistance) {
        nearestDistance = distance;
      }
      
      // For hunters, only consider players within tag distance
      // For alive players, consider hunters within warning distance
      const thresholdDistance = playerRole === 'hunter' ? TAG_DISTANCE : WARNING_DISTANCE;
      
      if (distance <= thresholdDistance) {
        nearbyPlayers.push(player.id);
      }
    });
    
    // Notify parent component
    onProximityUpdate(nearbyPlayers, nearestDistance);
  };
  
  // Calculate distance between two coordinates in meters
  const calculateDistance = (
    coords1: { latitude: number; longitude: number },
    coords2: { latitude: number; longitude: number }
  ) => {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371e3; // Earth radius in meters
    const φ1 = (coords1.latitude * Math.PI) / 180;
    const φ2 = (coords2.latitude * Math.PI) / 180;
    const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
    const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  };
  
  // This component doesn't render anything
  return null;
} 