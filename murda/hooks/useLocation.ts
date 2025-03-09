import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationState {
  latitude: number;
  longitude: number;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocation(prev => ({
            ...prev,
            error: 'Permission to access location was denied',
            isLoading: false,
          }));
          return;
        }

        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          error: null,
          isLoading: false,
        });

        // Subscribe to location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            setLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              error: null,
              isLoading: false,
            });
          }
        );
      } catch (err) {
        setLocation(prev => ({
          ...prev,
          error: 'Error getting location',
          isLoading: false,
        }));
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return location;
} 