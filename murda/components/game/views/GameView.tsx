import React from 'react';
import { StyleSheet, View, SafeAreaView, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { MafiaView } from './MafiaView';
import { DetectiveView } from './DetectiveView';
import { CivilianView } from './CivilianView';
import { useGameRole } from '@/hooks/useGameRole';
import { sharedStyles } from './shared/styles';

// Add role emojis
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const heartEmoji = require('@/assets/images/emojis/assets/Red heart/3D/red_heart_3d.png');

export type GameRole = 'mafia' | 'detective' | 'civilian';

export default function GameView() {
  const { role, playerCount, alivePlayers } = useGameRole();

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

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <View style={styles.roleContainer}>
          <Image source={getRoleEmoji()} style={styles.roleIcon} />
          <Typography variant="title" style={sharedStyles.roleText}>
            {capitalizeFirstLetter(role)}
          </Typography>
        </View>
        <View style={styles.aliveCounter}>
          <Image source={heartEmoji} style={styles.heartIcon} />
          <Typography variant="caption" style={sharedStyles.playerCount}>
            {alivePlayers} / {playerCount}
          </Typography>
        </View>
      </View>

      <View style={styles.content}>
        {role === 'mafia' && <MafiaView />}
        {role === 'detective' && <DetectiveView />}
        {role === 'civilian' && <CivilianView />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 20,
  },
  aliveCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
});