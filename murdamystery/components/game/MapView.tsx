import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock player data (in a real app, this would come from props or a context)
const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'You',
    role: 'hunter',
    isAlive: true,
    position: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: '2',
    name: 'Alex',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7739, longitude: -122.4154 }, // ~500m away
  },
  {
    id: '3',
    name: 'Jamie',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7759, longitude: -122.4174 }, // ~300m away
  },
  {
    id: '4',
    name: 'Sam',
    role: 'hunter',
    isAlive: true,
    position: { latitude: 37.7779, longitude: -122.4164 }, // ~400m away
  },
  {
    id: '5',
    name: 'Taylor',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7729, longitude: -122.4184 }, // ~350m away
  },
];

interface CustomMapViewProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showAllPlayers?: boolean;
  showHunterView?: boolean;
  showSpectatorView?: boolean;
  tagDistance?: number;
  warningDistance?: number;
  players?: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    position?: { latitude: number; longitude: number };
  }[];
  myPlayerId?: string;
}

export function CustomMapView({
  initialRegion,
  showAllPlayers = false,
  showHunterView = false,
  showSpectatorView = false,
  tagDistance = 15,
  warningDistance = 50,
  players = MOCK_PLAYERS,
  myPlayerId = '1',
}: CustomMapViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState(initialRegion);
  
  // Get the current player
  const currentPlayer = players.find(p => p.id === myPlayerId);
  
  // Set up location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        
        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setUserLocation(initialLocation);
        
        // Set initial map region
        if (!initialRegion && initialLocation) {
          setRegion({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        
        // Start watching position
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          location => {
            setUserLocation(location);
          }
        );
      } catch (error) {
        console.error('Error setting up location tracking:', error);
      }
    })();
    
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);
  
  // Center map on user location when it changes (if no initialRegion provided)
  useEffect(() => {
    if (!initialRegion && userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation, initialRegion]);
  
  // Center on user location
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };
  
  // Get marker color based on player role and alive status
  const getMarkerColor = (player: typeof MOCK_PLAYERS[0]) => {
    if (!player.isAlive) return '#8E8E93'; // Gray for eliminated
    if (player.role === 'hunter') return '#FF3B30'; // Red for hunters
    return '#34C759'; // Green for alive
  };
  
  // Get marker icon based on player role and alive status
  const getMarkerIcon = (player: typeof MOCK_PLAYERS[0]) => {
    if (!player.isAlive) return 'ghost';
    if (player.role === 'hunter') return 'running';
    return 'user';
  };
  
  // Determine which players to show on the map
  const getVisiblePlayers = () => {
    if (showSpectatorView || showAllPlayers) {
      // Show all players
      return players;
    }
    
    if (showHunterView && currentPlayer?.role === 'hunter') {
      // Hunters can see all alive players
      return players.filter(p => (p.id === myPlayerId) || (p.role === 'alive' && p.isAlive));
    }
    
    // Regular players can only see themselves
    return players.filter(p => p.id === myPlayerId);
  };
  
  const visiblePlayers = getVisiblePlayers();
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={false} // We'll use our own marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        loadingEnabled={true}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        {/* Player markers */}
        {visiblePlayers.map(player => (
          player.position && (
            <Marker
              key={player.id}
              coordinate={player.position}
              title={player.id === myPlayerId ? 'You' : player.name}
              description={player.role.charAt(0).toUpperCase() + player.role.slice(1)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(player) }
              ]}>
                <FontAwesome5 
                  name={getMarkerIcon(player)} 
                  size={14} 
                  color="#FFFFFF" 
                />
              </View>
            </Marker>
          )
        ))}
        
        {/* Tag range circle (only for hunters) */}
        {showHunterView && currentPlayer?.role === 'hunter' && userLocation && (
          <Circle
            center={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            radius={tagDistance}
            fillColor="rgba(255, 59, 48, 0.2)"
            strokeColor="rgba(255, 59, 48, 0.5)"
            strokeWidth={1}
          />
        )}
        
        {/* Warning range circle (only for alive players) */}
        {!showHunterView && currentPlayer?.role === 'alive' && userLocation && (
          <Circle
            center={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            radius={warningDistance}
            fillColor="rgba(255, 204, 0, 0.1)"
            strokeColor="rgba(255, 204, 0, 0.3)"
            strokeWidth={1}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
}); 