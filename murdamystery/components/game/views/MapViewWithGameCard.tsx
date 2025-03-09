import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, Image, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { GameCard } from '@/components/home/GameCard';
import { FeaturePill } from '@/components/home/FeaturePill';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withDelay,
  withRepeat,
  Easing 
} from 'react-native-reanimated';
import { CustomMapView } from '@/components/game/MapView';
import { LinearGradient } from 'expo-linear-gradient';
import { EMOJI_PATHS } from '@/constants/AssetPaths';

// Get screen width for proper scaling
const { width: screenWidth } = Dimensions.get('window');

// Define exact dimensions from design
const CARD_WIDTH = 363;
const CARD_HEIGHT = 320;
const MAP_WIDTH = 363;
const MAP_HEIGHT = 300; // Increased from 251 to give more map space
const STATUS_BAR_HEIGHT = 61;
const MAP_OFFSET_TOP = -0; // Move map upwards by this amount
const TAGS_VERTICAL_OFFSET = -15; // How much the tags overlap with the card (increased)
const TAG_HEIGHT = 50; // Height of the tags
const GHOST_ANIMATION_INTERVAL = 5000; // Ghost shakes every 5 seconds
const RISE_ANIMATION_DURATION = 4000; // Duration of rise animation
const RISE_ANIMATION_DISTANCE = 10; // Distance to rise in pixels

// Import emoji assets 
const grinningEmoji = require('@/assets/images/emojis/assets/grinning-face-with-big-eyes/3d/grinning_face_with_big_eyes_3d.png');
const globeEmoji = require('@/assets/images/emojis/assets/globe-showing-americas/3d/globe_showing_americas_3d.png');
const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');
const ghostEmoji = require('@/assets/images/ghost.png');
const thinkingEmoji = require('@/assets/images/thinking.png');

interface Tag {
  id: string;
  label: string;
  color?: string;
}

const MOCK_TAGS: Tag[] = [
  { id: '1', label: 'Located near you', color: '#FF9500' },
  { id: '2', label: '5+ players', color: '#32D74B' },
  { id: '3', label: 'Starts in 2 min', color: '#FF2D55' },
];

interface ThemeOptions {
  borderRadius: number;
  typography: {
    headerSize: number;
    subheaderSize: number;
  };
  colors: {
    gradientStart: string;
    gradientEnd: string;
    infoTagBackground: string;
    enabledStatus: string;
    disabledStatus: string;
    coinBackground: string;
  };
}

interface MapViewWithGameCardProps {
  onOpenInstructions?: () => void;
  onOpenCoinInfo?: () => void;
  onPlay?: () => void;
  theme: ThemeOptions;
  colorScheme: 'light' | 'dark';
}

export function MapViewWithGameCard({ 
  onOpenInstructions,
  onOpenCoinInfo,
  onPlay,
  theme,
  colorScheme
}: MapViewWithGameCardProps) {
  // Get user's location from the hook
  const { latitude, longitude, isLoading } = useLocation();
  const mapRef = useRef<MapView>(null);
  
  // Permission states
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  
  // Animation values
  const ghostRotation = useSharedValue(0);
  const ghostRiseY = useSharedValue(0);
  const thinkingRiseY = useSharedValue(0);
  
  // Set map style based on theme
  const mapStyle = colorScheme === 'dark' ? darkMapStyle : [];
  
  // Background color based on theme
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#F3F3F3';
  
  // Setup continuous rising animation
  useEffect(() => {
    // Start with the emojis at neutral position
    ghostRiseY.value = 0;
    thinkingRiseY.value = 0;
    
    // Create a continuous rising animation that eases dramatically
    ghostRiseY.value = withRepeat(
      withTiming(-RISE_ANIMATION_DISTANCE, { 
        duration: RISE_ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic) // Dramatic slow down at the end
      }, () => {
        // After rising, drop back down a bit faster
        ghostRiseY.value = withTiming(0, { 
          duration: RISE_ANIMATION_DURATION * 0.7,
          easing: Easing.in(Easing.cubic) // Faster movement at the end
        });
      }),
      -1, // Repeat infinitely
      true // Reverse animation (though we're handling that manually)
    );
    
    // Create slightly different animation for thinking emoji (offset timing)
    thinkingRiseY.value = withDelay(
      RISE_ANIMATION_DURATION / 2, // Start halfway through the ghost animation
      withRepeat(
        withTiming(-RISE_ANIMATION_DISTANCE * 0.7, { // Less rise distance
          duration: RISE_ANIMATION_DURATION * 1.2, // Slightly slower
          easing: Easing.out(Easing.cubic)
        }, () => {
          thinkingRiseY.value = withTiming(0, { 
            duration: RISE_ANIMATION_DURATION * 0.8,
            easing: Easing.in(Easing.cubic) 
          });
        }),
        -1,
        true
      )
    );
  }, []);
  
  // Periodic ghost animation that triggers every 5 seconds
  useEffect(() => {
    // Function to trigger ghost shake animation
    const triggerGhostShake = () => {
      // Reset to 0 first to ensure consistent animation
      ghostRotation.value = 0;
      
      // Create a sequence that shakes the ghost for a short time
      ghostRotation.value = withSequence(
        // Wait for a short delay to ensure value is reset
        withDelay(100, 
          // Shake sequence: left, right, left, right, back to center
          withSequence(
            withTiming(-5, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(5, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(-5, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(5, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 250, easing: Easing.inOut(Easing.quad) })
          )
        )
      );
    };
    
    // Trigger the animation immediately on mount
    triggerGhostShake();
    
    // Set up interval to trigger the animation every 5 seconds
    const intervalId = setInterval(triggerGhostShake, GHOST_ANIMATION_INTERVAL);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Create animated styles for ghost
  const ghostAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${ghostRotation.value}deg` },
        { translateY: ghostRiseY.value } // Add vertical rise
      ]
    };
  });
  
  // Create animated styles for thinking emoji
  const thinkingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: thinkingRiseY.value } // Add vertical rise
      ]
    };
  });
  
  // Check permissions on mount
  useEffect(() => {
    checkLocationPermission();
    checkCameraPermission();
  }, []);
  
  // Check if location permission is granted
  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationEnabled(status === 'granted');
  };
  
  // Check if camera permission is granted
  const checkCameraPermission = async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setCameraEnabled(status === 'granted');
    } catch (error) {
      console.error("Error checking camera permission:", error);
    }
  };
  
  // Request location permission
  const requestLocationPermission = async () => {
    if (locationEnabled) return; // Already enabled
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for this feature. Please enable it in your device settings."
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };
  
  // Request camera permission
  const requestCameraPermission = async () => {
    if (cameraEnabled) return; // Already enabled
    
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraEnabled(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required for this feature. Please enable it in your device settings."
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert(
        "Permission Error",
        "There was an error requesting camera permissions. Please check your device settings."
      );
    }
  };
  
  // Check if play is available (both permissions granted)
  const canPlay = locationEnabled && cameraEnabled;
  
  // Handle play button press
  const handlePlay = () => {
    if (!canPlay) {
      Alert.alert(
        "Permissions Required",
        "Please enable both location and camera permissions to play the game."
      );
      return;
    }
    
    if (onPlay) {
      console.log("Calling onPlay from Play button");
      onPlay();
    }
  };
  
  const cardPlayButtonContainer = {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4, // Higher than emojis
  };

  const playButton = () => (
    <View style={styles.cardPlayButtonContainer}>
      <TouchableOpacity 
        style={[
          styles.playButton, 
          { opacity: canPlay ? 1 : 0.7 }
        ]} 
        onPress={handlePlay}
        activeOpacity={0.8}
        disabled={!canPlay}
      >
        <Text style={styles.playButtonText}>Play</Text>
        <View style={styles.coinContainer}>
          <Text style={styles.coinText}>1</Text>
          <Image 
            source={coinEmoji} 
            style={styles.coinImage} 
            resizeMode="contain" 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Game card section with feature tags underneath */}
      <View style={styles.gameCardSection}>
        {/* Game Card */}
        <View style={[styles.gameCardWrapper, { borderRadius: theme.borderRadius }]}>
          <GameCard 
            onPress={() => onOpenInstructions && onOpenInstructions()} 
            onHostPress={() => onOpenInstructions && onOpenInstructions()}
            onJoinPress={() => console.log('Join pressed')}
            showCoinIndicator={false}
          />
          
          {/* Play Button - Positioned on the card */}
          {playButton()}
          
          {/* Emoji Container for centered position */}
          <View style={styles.emojiOverlayContainer}>
            {/* Animated Ghost Emoji */}
            <Animated.View style={[styles.ghostContainer, ghostAnimatedStyle]}>
              <Image source={ghostEmoji} style={styles.ghostEmoji} resizeMode="contain" />
            </Animated.View>
            
            {/* Animated Thinking Emoji */}
            <Animated.View style={[styles.thinkingContainer, thinkingAnimatedStyle]}>
              <Image source={thinkingEmoji} style={styles.thinkingEmoji} resizeMode="contain" />
            </Animated.View>
          </View>
        </View>
        
        {/* Feature Tags - positioned to overlap slightly with the card */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Image source={grinningEmoji} style={styles.tagEmoji} />
            <Text style={styles.tagText}>5-16 Players</Text>
          </View>
          
          <View style={styles.tag}>
            <Image source={globeEmoji} style={styles.tagEmoji} />
            <Text style={styles.tagText}>Play Anywhere</Text>
          </View>
        </View>
      </View>
      
      {/* Main container for map and status tab */}
      <View style={styles.mapAndTabContainer}>
        {/* Black status tab - aligned exactly with the map width */}
        <View style={[
          styles.statusTabBackground, 
          { 
            borderRadius: theme.borderRadius,
            backgroundColor: '#2F2E33',
          }
        ]}>
          {/* Status Indicators */}
          <View style={styles.statusIndicatorsContainer}>
            {/* Location Status - Now interactive */}
            <TouchableOpacity 
              style={styles.statusItem}
              onPress={requestLocationPermission}
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.statusDot, 
                  { 
                    backgroundColor: locationEnabled 
                      ? theme.colors.enabledStatus 
                      : theme.colors.disabledStatus 
                  }
                ]} 
              />
              <Text style={[
                styles.statusText,
                { fontSize: theme.typography.subheaderSize }
              ]}>
                {locationEnabled ? 'Location Enabled' : 'Enable Location'}
              </Text>
            </TouchableOpacity>
            
            {/* Camera Status - Now interactive */}
            <TouchableOpacity 
              style={styles.statusItem}
              onPress={requestCameraPermission}
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.statusDot, 
                  { 
                    backgroundColor: cameraEnabled 
                      ? theme.colors.enabledStatus 
                      : theme.colors.disabledStatus 
                  }
                ]} 
              />
              <Text style={[
                styles.statusText,
                { fontSize: theme.typography.subheaderSize }
              ]}>
                {cameraEnabled ? 'Camera Enabled' : 'Enable Camera'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Map View - positioned to overlap and truncate the tab */}
        <View style={[
          styles.mapContainer, 
          { 
            borderRadius: theme.borderRadius,
            backgroundColor,
            // Critical: Position the map to overlap the tab
            position: 'absolute',
            top: MAP_OFFSET_TOP, // Move the map upwards
            left: 0,
            right: 0,
            bottom: STATUS_BAR_HEIGHT - theme.borderRadius, // This creates the tab effect
            // Shadow for elevation
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }
        ]}>
          {!isLoading && (
            <MapView
              ref={mapRef}
              style={styles.map}
              customMapStyle={mapStyle}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Marker
                coordinate={{ latitude, longitude }}
                title="Your Location"
              />
            </MapView>
          )}
        </View>
      </View>
      
      {/* Warning Message - Dynamic based on permissions */}
      {(!locationEnabled || !cameraEnabled) && (
        <Text style={[
          styles.warningText,
          {
            fontSize: theme.typography.subheaderSize,
            color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          }
        ]}>
          ! Enable Location and Camera before playing
        </Text>
      )}
    </View>
  );
}

// Dark Map Style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  gameCardSection: {
    position: 'relative',
    marginBottom: 20, // Space before map section
  },
  gameCardWrapper: {
    position: 'relative',
    zIndex: 2,
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardPlayButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4, // Higher than emojis
  },
  emojiOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 70, // Make room for play button
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Shift emojis up a bit from the center
    zIndex: 3, // Place above game card
  },
  ghostContainer: {
    marginRight: 10,
    marginTop: 100, // Space between the two emojis
  },
  ghostEmoji: {
    width: 160,
    height: 160,
  },
  thinkingContainer: {
    marginLeft: -60,
    marginTop: 130, // Space between the two emojis
  },
  thinkingEmoji: {
    width: 110,
    height: 110,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: TAGS_VERTICAL_OFFSET, // Negative margin to overlap with card
    gap: 10, // Space between tags
    paddingHorizontal: 15, 
    paddingTop: 3,
    zIndex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom
    backgroundColor: '#2F2E33',
    height: TAG_HEIGHT, // Fixed height for the tags
    paddingBottom: 8, // Bottom padding to position content
    paddingHorizontal: 15,
    borderRadius: 14,
    minWidth: 120,
  },
  tagEmoji: {
    width: 24,
    height: 24,
    marginRight: 8,
    marginBottom: 0, // Slight adjustment for vertical alignment
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 5, // Slight adjustment for vertical alignment
    fontWeight: '400',
  },
  mapAndTabContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    marginBottom: 10,
  },
  statusTabBackground: {
    position: 'absolute',
    bottom: 11,
    left: 0, 
    right: 0,
    height: STATUS_BAR_HEIGHT,
    paddingVertical: 0,
  },
  statusIndicatorsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    bottom: -10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mapContainer: {
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8, // Increased touch target
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '500', // Medium weight
  },
  warningText: {
    textAlign: 'center',
    fontWeight: '500', // Medium weight
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120, // Restore original width
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8, // Restore margin for coin container
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2E33',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  coinImage: {
    width: 18,
    height: 18,
  },
}); 