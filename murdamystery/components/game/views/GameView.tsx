import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Typography } from '@/components/Typography';
import { MafiaView } from './MafiaView';
import { DetectiveView } from './DetectiveView';
import { CivilianView } from './CivilianView';
import { useGameRole } from '@/hooks/useGameRole';
import { sharedStyles } from './shared/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayersModal } from '../modals/PlayersModal';
import { useRouter } from 'expo-router';

// Add role emojis
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const heartEmoji = require('@/assets/images/emojis/assets/Red heart/3D/red_heart_3d.png');

// Add these emoji imports
const emergencyIcon = require('@/assets/images/emojis/assets/Megaphone/3D/megaphone_3d.png');
const cameraIcon = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const killIcon = require('@/assets/images/emojis/assets/Skull and crossbones/3D/skull_and_crossbones_3d.png');

export type GameRole = 'mafia' | 'detective' | 'civilian';

export default function GameView() {
  const { role, playerCount, alivePlayers, gameRoles } = useGameRole();
  const [isPlayersModalVisible, setPlayersModalVisible] = useState(false);
  const router = useRouter();

  const getRoleEmoji = () => {
    switch (role) {
      case 'mafia':
        return ninjaEmoji;
      case 'detective':
        return detectiveEmoji;
      case 'civilian':
        return faceEmoji;
      default:
        return faceEmoji;
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  console.log('Current Role:', role); // Add logging to debug

  // Get color based on role
  const getRoleColor = () => {
    switch (role) {
      case 'mafia':
        return '#FF3131';
      case 'detective':
        return '#4B9EF4';
      default:
        return '#32D74B';
    }
  };
  
  const roleColor = getRoleColor();

  const handleEmergencyMeeting = () => {
    console.log('Emergency meeting triggered');
    // Add meeting logic here
  };
  
  const handleKill = () => {
    console.log('Kill camera triggered');
    router.push({
      pathname: '/camera',
      params: { type: 'kill', role }
    });
  };
  
  const handleEvidence = () => {
    console.log('Evidence camera triggered');
    router.push({
      pathname: '/camera',
      params: { type: 'evidence', role }
    });
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      {/* Role info gradient overlay - positioned to flow behind the map */}
      <View style={styles.roleInfoContainer} pointerEvents="none">
        <LinearGradient
          colors={[
            `${roleColor}50`,  // Start with more opacity (50%)
            `${roleColor}30`,  // Fade slightly in upper area
            `${roleColor}15`,  // Continue fading in middle area
            `${roleColor}05`,  // Very subtle at lower area
            'transparent'      // Completely transparent at the bottom
          ]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }} // Only extend 60% down the container
        />
      </View>
      
      <View style={[sharedStyles.header, styles.headerWithPadding]}>
        <View style={styles.roleContainer}>
          <Image source={getRoleEmoji()} style={styles.roleIcon} />
          <Typography 
            variant="title" 
            style={[sharedStyles.roleText, { color: roleColor, fontWeight: 'bold' }]}
          >
            {capitalizeFirstLetter(role)}
          </Typography>
        </View>
        
        <TouchableOpacity 
          style={styles.aliveCounter}
          onPress={() => setPlayersModalVisible(true)}
          activeOpacity={0.7}
        >
          <Image source={heartEmoji} style={styles.heartIcon} />
          <Typography 
            variant="caption" 
            style={[sharedStyles.playerCount, { fontWeight: 'bold' }]}
          >
            {alivePlayers} / {playerCount}
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {role === 'mafia' && <MafiaView />}
        {role === 'detective' && <DetectiveView />}
        {role === 'civilian' && <CivilianView />}
      </View>
      
      <PlayersModal 
        visible={isPlayersModalVisible}
        onClose={() => setPlayersModalVisible(false)}
        players={gameRoles || { mafia: [], detective: [], civilian: [] }}
        playerRole={role}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 10,
    zIndex: 1,
  },
  headerWithPadding: {
    paddingTop: 16,
    zIndex: 10, // Keep header above the gradient
  },
  aliveCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Make slightly more transparent to see gradient
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  heartIcon: {
    width: 16,
    height: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleIcon: {
    width: 28,
    height: 28,
  },
  roleInfoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
  },
  killButton: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  evidenceButton: {
    backgroundColor: '#4B9EF4',
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
});