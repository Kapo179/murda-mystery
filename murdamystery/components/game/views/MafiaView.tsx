import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import { CustomMapView } from '../MapView';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { BlurView } from 'expo-blur';
import { VotingModal } from '../modals/VotingModal';

// Import emoji assets
const killIcon = require('@/assets/images/emojis/assets/Skull and crossbones/3D/skull_and_crossbones_3d.png');
const cameraIcon = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const emergencyIcon = require('@/assets/images/emojis/assets/Police car light/3D/police_car_light_3d.png');
const settingsEmoji = require('@/assets/images/emojis/assets/Gear/3D/gear_3d.png');
const exitEmoji = require('@/assets/images/emojis/assets/Person running/Default/3D/person_running_3d_default.png');

export function MafiaView() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(1);
  const [isVotingModalVisible, setVotingModalVisible] = useState(false);
  
  const handleKill = () => {
    router.push({
      pathname: '/camera',
      params: { type: 'kill', role: 'mafia' }
    });
  };
  
  const handleTakeEvidence = () => {
    router.push({
      pathname: '/camera',
      params: { type: 'evidence', role: 'mafia' }
    });
  };
  
  const handleEmergencyMeeting = () => {
    if (emergencyCount > 0) {
      console.log('Emergency meeting requested by mafia');
      setEmergencyCount(prevCount => Math.max(0, prevCount - 1));
      setVotingModalVisible(true);
    } else {
      Alert.alert(
        "No Emergency Buttons Left",
        "You have used all your emergency buttons for this game.",
        [{ text: "OK" }]
      );
    }
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
  
  const handleVoteSubmit = (selectedPlayerId: string) => {
    console.log(`Mafia voted for player: ${selectedPlayerId}`);
  };
  
  return (
    <View style={styles.container}>
      {/* Map view placed behind buttons */}
      <View style={styles.mapContainer}>
        <CustomMapView showTargetLocation />
        
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
      
      {/* Action buttons container with updated design */}
      <View style={styles.actionButtonsContainer}>
        {/* Kill Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleKill}
          activeOpacity={0.8}
        >
          <BlurView intensity={10} tint="light" style={styles.buttonBlur}>
            <View style={styles.buttonContent}>
              <Image source={killIcon} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Kill</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
        
        {/* Evidence Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTakeEvidence}
          activeOpacity={0.8}
        >
          <BlurView intensity={10} tint="light" style={styles.buttonBlur}>
            <View style={styles.buttonContent}>
              <Image source={cameraIcon} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Evidence</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
        
        {/* Emergency Button with Counter */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEmergencyMeeting}
          activeOpacity={0.8}
        >
          <BlurView intensity={10} tint="light" style={styles.buttonBlur}>
            <View style={styles.buttonContent}>
              <Image source={emergencyIcon} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Emergency</Text>
              
              {/* Emergency count badge */}
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{emergencyCount}</Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>
      
      {/* Voting Modal */}
      <VotingModal
        visible={isVotingModalVisible}
        onClose={() => setVotingModalVisible(false)}
        onVoteSubmit={handleVoteSubmit}
        currentPlayerId="1"
      />
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
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  // Updated button styles to match reference
  actionButton: {
    width: '30%', // Smaller for 3 buttons
    height: 80,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(71, 71, 71, 0.85)', // Fallback color
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonIcon: {
    width: 28, // Slightly smaller for 3 buttons
    height: 28,
    marginBottom: 6,
  },
  buttonText: {
    color: '#333333',
    fontSize: 14, // Slightly smaller for 3 buttons
    fontWeight: '600',
    textAlign: 'center',
  },
  // Settings styles remain the same
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
  // Add styles for the count badge
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});