import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, Image, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { GameCard } from '@/components/home/GameCard';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeaturePill } from '@/components/home/FeaturePill';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

// Import emoji assets
const grinningEmoji = require('@/assets/images/emojis/assets/grinning-face-with-big-eyes/3d/grinning_face_with_big_eyes_3d.png');
const globeEmoji = require('@/assets/images/emojis/assets/globe-showing-americas/3d/globe_showing_americas_3d.png');
const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');
const settingsEmoji = require('@/assets/images/emojis/assets/Gear/3D/gear_3d.png');
const exitEmoji = require('@/assets/images/emojis/assets/Person running/Default/3D/person_running_3d_default.png');

// Global capital cities for animation
const GLOBAL_CAPITALS = [
  { latitude: 40.7128, longitude: -74.0060, name: "New York" },       // New York
  { latitude: 51.5074, longitude: -0.1278, name: "London" },          // London
  { latitude: 35.6762, longitude: 139.6503, name: "Tokyo" },          // Tokyo
  { latitude: 48.8566, longitude: 2.3522, name: "Paris" },            // Paris
  { latitude: -33.8688, longitude: 151.2093, name: "Sydney" },        // Sydney
  { latitude: 41.9028, longitude: 12.4964, name: "Rome" },            // Rome
  { latitude: 30.0444, longitude: 31.2357, name: "Cairo" },           // Cairo
  { latitude: -22.9068, longitude: -43.1729, name: "Rio de Janeiro" },// Rio
  { latitude: 55.7558, longitude: 37.6173, name: "Moscow" },          // Moscow
  { latitude: 39.9042, longitude: 116.4074, name: "Beijing" },        // Beijing
];

interface MapViewWithGameCardProps {
  onOpenInstructions?: () => void;
  onOpenCoinInfo?: () => void;
}

export function MapViewWithGameCard({ 
  onOpenInstructions,
  onOpenCoinInfo
}: MapViewWithGameCardProps) {
  const { location } = useLocation();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const locationIndex = useRef(0);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Set initial location
  useEffect(() => {
    if (mapRef.current && mapReady) {
      // First show user location if available
      if (location) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
        
        // Get the user's location name
        fetchLocationName(location.latitude, location.longitude);
      }
      
      // After 3 seconds, start the global capitals animation sequence
      setTimeout(() => {
        setLocationName("Explore Global Cities");
        animateToNextCapital();
      }, 3000);
    }
  }, [mapReady, location]);

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, []);

  // Animate to the next capital city
  const animateToNextCapital = () => {
    if (!mapRef.current) return;
    
    const nextLocation = GLOBAL_CAPITALS[locationIndex.current];
    
    // Animate to the location
    mapRef.current.animateToRegion({
      latitude: nextLocation.latitude,
      longitude: nextLocation.longitude,
      latitudeDelta: 2,  // Wider zoom for global view
      longitudeDelta: 2,
    }, 3000);  // Slower animation (3 seconds)
    
    setLocationName(nextLocation.name);
    
    // Increment the location index (cycle through array)
    locationIndex.current = (locationIndex.current + 1) % GLOBAL_CAPITALS.length;
    
    // Schedule the next animation
    animationTimer.current = setTimeout(animateToNextCapital, 8000);  // Move every 8 seconds
  };

  // Fetch location name from coordinates
  const fetchLocationName = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const cityText = address.city || address.region || 'Unknown Location';
        setLocationName(cityText);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
      setLocationName('Unknown Location');
    }
  };

  // Handle map ready event
  const onMapReady = () => {
    setMapReady(true);
  };

  // Handle exit game confirmation
  const handleExitGame = () => {
    Alert.alert(
      "Exit Game",
      "Are you sure you want to exit the current game?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSettingsVisible(false)
        },
        {
          text: "Exit", 
          style: "destructive",
          onPress: () => {
            setSettingsVisible(false);
            router.replace("/");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: GLOBAL_CAPITALS[0].latitude,
          longitude: GLOBAL_CAPITALS[0].longitude,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
        customMapStyle={mapCustomStyle}
        onMapReady={onMapReady}
      >
        {/* Add markers for all capital cities */}
        {GLOBAL_CAPITALS.map((loc, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: loc.latitude,
              longitude: loc.longitude,
            }}
            title={loc.name}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot} />
              <View style={styles.markerRing} />
            </View>
          </Marker>
        ))}
        
        {/* User location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}
      </MapView>
      
      {/* Settings Icon */}
      <SafeAreaView style={styles.settingsContainer}>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setSettingsVisible(!settingsVisible)}
        >
          <Image source={settingsEmoji} style={styles.settingsIcon} />
        </TouchableOpacity>
        
        {/* Settings Menu - Conditionally rendered */}
        {settingsVisible && (
          <View style={styles.settingsMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleExitGame}
            >
              <Image source={exitEmoji} style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Exit Game</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      
      {/* Location Display Banner */}
      {locationName && (
        <View style={styles.locationBanner}>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>
      )}
      
      {/* Bottom Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.bottomGradient}
      />
      
      {/* Game Card */}
      <SafeAreaView style={styles.cardContent}>
        <View style={styles.cardContainer}>
          <GameCard 
            onPress={() => onOpenInstructions && onOpenInstructions()} 
            onHostPress={() => onOpenInstructions && onOpenInstructions()}
            onJoinPress={() => {
              console.log('Join pressed');
            }}
            compact={false}
          />
          
          {/* Feature Pills */}
          <View style={styles.pillsContainer}>
            <FeaturePill 
              emoji={grinningEmoji} 
              text="8-16 Players"
            />
            <FeaturePill 
              emoji={globeEmoji} 
              text="Play Anywhere" 
            />
            <FeaturePill 
              emoji={coinEmoji} 
              text="3" 
              onPress={() => onOpenCoinInfo && onOpenCoinInfo()}
              style={styles.coinPill}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const mapCustomStyle = [
  // Dark mode style
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8353B',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(232, 53, 59, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(232, 53, 59, 0.5)',
  },
  locationBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  locationText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  cardContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  coinPill: {
    paddingHorizontal: 24,
  },
  // New styles for the settings menu
  settingsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  settingsIcon: {
    width: 28,
    height: 28,
  },
  settingsMenu: {
    position: 'absolute',
    top: 54,
    right: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 12,
    padding: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 