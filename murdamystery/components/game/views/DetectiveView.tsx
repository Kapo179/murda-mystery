import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import { CustomMapView } from '../MapView';
import { ActionButton } from '../ActionButton';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';

// Import emoji assets
const detectiveIcon = require('@/assets/images/emojis/assets/Magnifying glass tilted right/3D/magnifying_glass_tilted_right_3d.png');
const cameraIcon = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const emergencyIcon = require('@/assets/images/emojis/assets/Police car light/3D/police_car_light_3d.png');
const settingsEmoji = require('@/assets/images/emojis/assets/Gear/3D/gear_3d.png');
const exitEmoji = require('@/assets/images/emojis/assets/Person running/Default/3D/person_running_3d_default.png');

export function DetectiveView() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Disconnected functions that log actions instead of interacting with core systems
  const handleTakeEvidence = () => {
    console.log('Detective tried to take evidence - functionality disconnected');
    // No longer uses router.push to camera page
  };
  
  const handleEmergencyMeeting = () => {
    console.log('Emergency meeting requested by detective - functionality disconnected');
    // No longer triggers actual meeting logic
  };
  
  const handleInvestigate = () => {
    console.log('Detective tried to investigate area - functionality disconnected');
    // No longer connects to game investigation system
  };
  
  const handleExitGame = () => {
    Alert.alert(
      "Exit Game",
      "Are you sure you want to exit the current game?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Exit", 
          style: "destructive", 
          onPress: () => router.replace("/") 
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Map view placed behind buttons */}
      <View style={styles.mapContainer}>
        <CustomMapView 
          // No longer shows actual mafia location
          showLastMafiaLocation={false}
        />
        
        {/* Settings button */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(!settingsVisible)}
            activeOpacity={0.8}
          >
            <Image source={settingsEmoji} style={styles.settingsIcon} />
          </TouchableOpacity>

          {settingsVisible && (
            <View style={styles.settingsMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setSettingsVisible(false);
                  handleExitGame();
                }}
              >
                <Image source={exitEmoji} style={styles.menuItemIcon} />
                <Typography style={styles.menuItemText}>Exit Game</Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {/* Action buttons container - same UI but disconnected functions */}
      <View style={styles.actionButtonsContainer}>
        <ActionButton
          icon={detectiveIcon}
          onPress={handleInvestigate}
          variant="default"
          size="medium"
        />
        <ActionButton
          icon={emergencyIcon}
          onPress={handleEmergencyMeeting}
          variant="emergency"
          size="medium"
        />
        <ActionButton
          icon={cameraIcon}
          onPress={handleTakeEvidence}
          variant="default"
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
    flex: 1,
    width: '100%',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  // Settings styles
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