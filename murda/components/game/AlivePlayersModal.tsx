import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Image, FlatList, TextStyle, ViewStyle, ScrollView } from 'react-native';
import { Typography } from '@/components/Typography';
import { BlurView } from 'expo-blur';

// Import emojis
const heartEmoji = require('@/assets/images/emojis/assets/Red heart/3D/red_heart_3d.png');
const closeEmoji = require('@/assets/images/emojis/assets/Cross mark/3D/cross_mark_3d.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const ghostEmoji = require('@/assets/images/emojis/assets/Ghost/3D/ghost_3d.png');
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');

interface Player {
  id: string;
  name: string;
  role?: 'mafia' | 'detective' | 'civilian';
  isAlive: boolean;
  isYou?: boolean;
}

interface AlivePlayersModalProps {
  visible: boolean;
  onClose: () => void;
  players: Player[];
  totalPlayers: number;
  currentRole: 'mafia' | 'detective' | 'civilian';
}

export function AlivePlayersModal({ visible, onClose, players, totalPlayers, currentRole }: AlivePlayersModalProps) {
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  const playerNameStyle = (player: Player): TextStyle => ({
    color: player.isYou ? '#4B9EF4' : '#FFFFFF',
    fontSize: 16,
    fontWeight: player.isYou ? 'bold' : 'normal',
  });

  const deadPlayerNameStyle = (player: Player): TextStyle => ({
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  });

  const getPlayerEmoji = (player: Player) => {
    if (!player.isAlive) return ghostEmoji;
    if (player.isYou) {
      switch (currentRole) {
        case 'mafia':
          return ninjaEmoji;
        case 'detective':
          return detectiveEmoji;
        default:
          return faceEmoji;
      }
    }
    return faceEmoji;
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={[styles.playerRow, !item.isAlive && styles.deadPlayerRow]}>
      <Image 
        source={item.isAlive ? faceEmoji : ghostEmoji} 
        style={styles.playerIcon} 
      />
      <Typography style={playerNameStyle(item)}>
        {item.name} {item.isYou && '(You)'}
      </Typography>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Typography style={styles.title}>Players</Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image source={closeEmoji} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.countContainer}>
            <Image source={heartEmoji} style={styles.heartIcon} />
            <Typography style={styles.count}>
              {alivePlayers.length} Alive / {deadPlayers.length} Dead
            </Typography>
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Typography style={styles.sectionTitle}>Alive</Typography>
            {alivePlayers.map(player => (
              <View key={player.id} style={styles.playerRow}>
                <Image source={faceEmoji} style={styles.playerIcon} />
                <Typography style={playerNameStyle(player)}>
                  {player.name} {player.isYou && '(You)'}
                </Typography>
              </View>
            ))}

            {deadPlayers.length > 0 && (
              <>
                <Typography style={styles.sectionTitle}>Dead</Typography>
                {deadPlayers.map(player => (
                  <View key={player.id} style={[styles.playerRow, styles.deadPlayerRow]}>
                    <Image source={ghostEmoji} style={styles.playerIcon} />
                    <Typography style={deadPlayerNameStyle(player)}>
                      {player.name}
                    </Typography>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 0,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF3B30', // Red tint for close icon
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  heartIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  count: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  sectionHeader: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  list: {
    paddingVertical: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  playerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  deadPlayerRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    opacity: 0.7,
  },
}); 