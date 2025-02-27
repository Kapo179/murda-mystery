import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomMapView } from '../MapView';
import { useRouter } from 'expo-router';
import { ActionButton } from '../ActionButton';

// Import emoji assets
const cameraIcon = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const emergencyIcon = require('@/assets/images/emojis/assets/Police car light/3D/police_car_light_3d.png');

export function CivilianView() {
  const router = useRouter();
  
  const handleTakeEvidence = () => {
    router.push({
      pathname: '/camera',
      params: { type: 'evidence', role: 'civilian' }
    });
  };
  
  const handleEmergencyMeeting = () => {
    console.log('Emergency meeting requested by civilian');
    // Meeting logic
  };
  
  return (
    <View style={styles.container}>
      {/* Map view placed behind buttons */}
      <View style={styles.mapContainer}>
        <CustomMapView showNearbyPlayers />
      </View>
      
      {/* Action buttons container */}
      <View style={styles.actionButtonsContainer}>
        <View style={styles.leftPlaceholder} />
        
        <ActionButton
          icon={emergencyIcon}
          onPress={handleEmergencyMeeting}
          variant="emergency"
          size="medium"
        />
        
        <ActionButton
          icon={cameraIcon}
          onPress={handleTakeEvidence}
          variant="evidence"
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  leftPlaceholder: {
    width: 56, // Same width as a button
    height: 56, // Same height as a button
  }
}); 