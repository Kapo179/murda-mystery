import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { CustomMapView } from '@/components/game/MapView';
import { PlayersRemainingPanel } from '@/components/game/PlayersRemainingPanel';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withRepeat,
  withDelay,
  Easing
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface AliveViewProps {
  players: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    position?: { latitude: number; longitude: number };
  }[];
  totalPlayers: number;
  gameTimeRemaining?: string;
  warningDistance: number;
}

type DangerLevel = 'safe' | 'nearby' | 'danger' | 'extreme';

export function AliveView({ 
  players, 
  totalPlayers,
  gameTimeRemaining,
  warningDistance = 50 
}: AliveViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  const [dangerLevel, setDangerLevel] = useState<DangerLevel>('safe');
  const [nearestHunterDistance, setNearestHunterDistance] = useState<number | null>(null);
  const [expandedMap, setExpandedMap] = useState(false);
  
  // Animation values
  const warningOpacity = useSharedValue(0);
  const warningScale = useSharedValue(1);
  const heartbeatScale = useSharedValue(1);
  
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
          Alert.alert('Permission Denied', 'Location permission is needed to play the game.');
          return;
        }
        
        // Start watching position with high accuracy
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 5, // Update every 5 meters
            timeInterval: 2000   // Or at least every 2 seconds
          },
          location => {
            setMyLocation(location);
            checkHunterProximity(location);
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
  
  // Check proximity to hunters
  const checkHunterProximity = (location: Location.LocationObject) => {
    if (!location) return;
    
    const myCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
    
    // Find nearest hunter and calculate distance
    let minDistance = Infinity;
    
    players.forEach(player => {
      // Only consider hunters
      if (player.role !== 'hunter' || !player.position) {
        return;
      }
      
      // Calculate distance
      const distanceInMeters = calculateDistance(
        myCoords,
        player.position
      );
      
      minDistance = Math.min(minDistance, distanceInMeters);
    });
    
    setNearestHunterDistance(minDistance === Infinity ? null : minDistance);
    
    // Determine danger level based on distance
    let newDangerLevel: DangerLevel = 'safe';
    
    if (minDistance !== Infinity) {
      if (minDistance <= warningDistance * 0.2) { // Within 20% of warning distance
        newDangerLevel = 'extreme';
      } else if (minDistance <= warningDistance * 0.5) { // Within 50% of warning distance
        newDangerLevel = 'danger';
      } else if (minDistance <= warningDistance) { // Within warning distance
        newDangerLevel = 'nearby';
      }
    }
    
    if (newDangerLevel !== dangerLevel) {
      setDangerLevel(newDangerLevel);
      
      // Trigger haptic feedback based on danger level
      if (newDangerLevel === 'extreme') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (newDangerLevel === 'danger') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (newDangerLevel === 'nearby') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
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
  
  // Update animations based on danger level
  useEffect(() => {
    if (dangerLevel === 'safe') {
      warningOpacity.value = withTiming(0, { duration: 300 });
      warningScale.value = withTiming(1);
      heartbeatScale.value = withTiming(1);
    } else {
      // Show warning with appropriate intensity
      warningOpacity.value = withTiming(1, { duration: 300 });
      
      // Different animation patterns based on danger level
      if (dangerLevel === 'extreme') {
        // Rapid pulsing for extreme danger
        warningScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 300, easing: Easing.out(Easing.exp) }),
            withTiming(1, { duration: 300, easing: Easing.in(Easing.exp) })
          ),
          -1,
          false
        );
        
        // Rapid heartbeat effect
        heartbeatScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 200, easing: Easing.out(Easing.exp) }),
            withTiming(1, { duration: 200, easing: Easing.in(Easing.exp) }),
            withDelay(100, withTiming(1.2, { duration: 200, easing: Easing.out(Easing.exp) })),
            withTiming(1, { duration: 200, easing: Easing.in(Easing.exp) })
          ),
          -1,
          false
        );
      } else if (dangerLevel === 'danger') {
        // Medium pulsing for danger
        warningScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 500, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 500, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        
        // Medium heartbeat
        heartbeatScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 300, easing: Easing.in(Easing.quad) }),
            withDelay(400, withTiming(1.1, { duration: 300, easing: Easing.out(Easing.quad) })),
            withTiming(1, { duration: 300, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
      } else if (dangerLevel === 'nearby') {
        // Slow pulsing for nearby
        warningScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        
        // Slow heartbeat
        heartbeatScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 400, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 400, easing: Easing.in(Easing.quad) }),
            withDelay(600, withTiming(1.05, { duration: 400, easing: Easing.out(Easing.quad) })),
            withTiming(1, { duration: 400, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
      }
    }
  }, [dangerLevel, warningOpacity, warningScale, heartbeatScale]);
  
  // Warning animation styles
  const warningContainerStyle = useAnimatedStyle(() => ({
    opacity: warningOpacity.value,
    transform: [{ scale: warningScale.value }],
  }));
  
  const heartbeatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeatScale.value }],
  }));
  
  // Get warning color based on danger level
  const getWarningColor = () => {
    switch (dangerLevel) {
      case 'extreme': return '#FF3B30';
      case 'danger': return '#FF9500';
      case 'nearby': return '#FFCC00';
      default: return 'transparent';
    }
  };
  
  // Get warning message based on danger level
  const getWarningMessage = () => {
    switch (dangerLevel) {
      case 'extreme': return 'HUNTER EXTREMELY CLOSE!';
      case 'danger': return 'HUNTER APPROACHING!';
      case 'nearby': return 'Hunter nearby';
      default: return 'All clear';
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
          showAllPlayers={false} 
          showHunterView={false}
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
      
      <View style={styles.statusContainer}>
        <Animated.View 
          style={[
            styles.warningContainer, 
            warningContainerStyle,
            dangerLevel !== 'safe' && { backgroundColor: `${getWarningColor()}20` }
          ]}
        >
          <Animated.View style={[styles.iconContainer, heartbeatStyle]}>
            <MaterialCommunityIcons 
              name={dangerLevel === 'extreme' ? 'run-fast' : 'walk'} 
              size={24} 
              color={getWarningColor()} 
            />
          </Animated.View>
          
          <View style={styles.warningTextContainer}>
            <Text style={[
              styles.warningText, 
              { color: getWarningColor() },
              dangerLevel === 'extreme' && styles.extremeWarningText
            ]}>
              {getWarningMessage()}
            </Text>
            
            {nearestHunterDistance && (
              <Text style={[
                styles.distanceText,
                { color: getWarningColor() }
              ]}>
                {Math.round(nearestHunterDistance)}m away
              </Text>
            )}
          </View>
        </Animated.View>
        
        {dangerLevel === 'safe' && (
          <View style={styles.safeContainer}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={24} 
              color="#30D158" 
            />
            <Text style={styles.safeText}>
              No hunters nearby
            </Text>
          </View>
        )}
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
  statusContainer: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  safeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    paddingVertical: 15,
    borderRadius: 16,
  },
  safeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#30D158',
    marginLeft: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  iconContainer: {
    marginRight: 15,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
  },
  extremeWarningText: {
    fontSize: 18,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 14,
    marginTop: 4,
  },
}); 