import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { CustomMapView } from '@/components/game/MapView';
import { PlayersRemainingPanel } from '@/components/game/PlayersRemainingPanel';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

interface HunterViewProps {
  onTagPlayer: (targetId: string) => void;
  players: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    position?: { latitude: number; longitude: number };
  }[];
  totalPlayers: number;
  gameTimeRemaining?: string;
  tagDistance: number;
}

export function HunterView({ 
  onTagPlayer, 
  players, 
  totalPlayers,
  gameTimeRemaining,
  tagDistance = 15 
}: HunterViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const [expandedMap, setExpandedMap] = useState(false);
  
  // Animation value for tag button
  const tagAnimation = useSharedValue(1);
  
  // Count alive players and hunters
  const aliveCount = players.filter(p => p.role === 'alive' && p.isAlive).length;
  const hunterCount = players.filter(p => p.role === 'hunter').length;
  
  // Track user's location
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is needed to play as Hunter.');
          return;
        }
        
        // Start watching position with high accuracy
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5, // Update every 5 meters
            timeInterval: 1000   // Or at least every second
          },
          location => {
            setMyLocation(location);
            checkNearbyPlayers(location);
          }
        );
      } catch (err) {
        console.error('Error setting up location tracking:', err);
        Alert.alert('Error', 'Failed to track location. Please check your device settings.');
      }
    })();
    
    // Clean up subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [players]);
  
  // Check if any alive players are nearby
  const checkNearbyPlayers = (location: Location.LocationObject) => {
    if (!location) return;
    
    const myCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
    
    // Find players within tagging distance
    const nearby = players
      .filter(player => {
        // Only consider alive players
        if (player.role !== 'alive' || !player.isAlive || !player.position) {
          return false;
        }
        
        // Calculate distance
        const distanceInMeters = calculateDistance(
          myCoords,
          player.position
        );
        
        return distanceInMeters <= tagDistance;
      })
      .map(player => player.id);
    
    setNearbyPlayers(nearby);
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
  
  // Animate tag button when players are nearby
  useEffect(() => {
    if (nearbyPlayers.length > 0) {
      // Pulse animation when players are nearby
      tagAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      // Reset animation when no players nearby
      tagAnimation.value = withTiming(1);
    }
  }, [nearbyPlayers.length, tagAnimation]);
  
  // Tag button animation style
  const tagButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tagAnimation.value }],
  }));
  
  // Handle tagging a player
  const handleTagPlayer = () => {
    if (nearbyPlayers.length === 0) {
      Alert.alert('No Players Nearby', 'Move closer to a player to tag them.');
      return;
    }
    
    if (nearbyPlayers.length === 1) {
      // Directly tag if only one player is nearby
      onTagPlayer(nearbyPlayers[0]);
    } else {
      // Show selection if multiple players are nearby
      Alert.alert(
        'Multiple Players Nearby',
        'Choose a player to tag:',
        nearbyPlayers.map(playerId => {
          const player = players.find(p => p.id === playerId);
          return {
            text: player?.name || 'Unknown Player',
            onPress: () => onTagPlayer(playerId)
          };
        })
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <PlayersRemainingPanel
        totalPlayers={totalPlayers}
        alivePlayers={aliveCount}
        hunterCount={hunterCount}
        timeRemaining={gameTimeRemaining}
      />
      
      <View style={[styles.mapContainer, expandedMap && styles.expandedMap]}>
        <CustomMapView 
          showAllPlayers={true} 
          showHunterView={true}
        />
        
        <TouchableOpacity
          style={[
            styles.mapToggleButton,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }
          ]}
          onPress={() => setExpandedMap(!expandedMap)}
        >
          <Ionicons 
            name={expandedMap ? 'contract' : 'expand'} 
            size={24} 
            color={isDark ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionContainer}>
        {nearbyPlayers.length > 0 ? (
          <LinearGradient
            colors={['#FF3B30', '#FF9500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <Animated.View style={[styles.animatedContainer, tagButtonStyle]}>
              <TouchableOpacity 
                style={styles.tagButton}
                onPress={handleTagPlayer}
                activeOpacity={0.7}
              >
                <FontAwesome5 name="hand-paper" size={20} color="#fff" />
                <Text style={styles.tagButtonText}>
                  TAG PLAYER ({nearbyPlayers.length})
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        ) : (
          <TouchableOpacity 
            style={[styles.tagButton, styles.tagButtonDisabled]}
            disabled={true}
          >
            <FontAwesome5 name="search-location" size={18} color="#fff" />
            <Text style={styles.tagButtonText}>
              NO PLAYERS IN RANGE
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={[
          styles.rangeText, 
          { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
        ]}>
          Tag range: {tagDistance} meters
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
  },
  expandedMap: {
    flex: 1,
  },
  mapToggleButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  gradientBorder: {
    borderRadius: 30,
    padding: 2,
    width: '100%',
  },
  animatedContainer: {
    width: '100%',
  },
  tagButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
  },
  tagButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  tagButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  rangeText: {
    marginTop: 8,
    fontSize: 14,
  },
}); 