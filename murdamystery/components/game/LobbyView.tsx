import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Platform } from 'react-native';
import { Typography } from '../Typography';
import { FloatingCard } from '../ui/FloatingCard';

// Import emoji assets
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const crownEmoji = require('@/assets/images/emojis/assets/Crown/3D/crown_3d.png');
const checkMarkEmoji = require('@/assets/images/emojis/assets/Check mark button/3D/check_mark_button_3d.png');
const closeEmoji = require('@/assets/images/emojis/assets/Cross mark/3D/cross_mark_3d.png');
const copyEmoji = require('@/assets/images/emojis/assets/Clipboard/3D/clipboard_3d.png');

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
  isReady?: boolean;
}

interface LobbyViewProps {
  players: Player[];
  inviteCode: string;
  onStartGame: () => void;
  onPlayerReady: (playerId: string) => void;
  currentPlayerId: string;
  onClose: () => void;
  onCopyInvite: (code: string) => void;
}

export function LobbyView({ 
  players, 
  inviteCode, 
  onStartGame, 
  onPlayerReady,
  currentPlayerId,
  onClose,
  onCopyInvite
}: LobbyViewProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const allPlayersReady = players.every(p => p.isReady);
  const isHost = currentPlayer?.isHost;

  return (
    <View style={styles.container}>
      {/* Update Invite Code Section */}
      <FloatingCard style={styles.inviteCard}>
        <View style={styles.inviteHeader}>
          <View>
            <Typography variant="caption" style={styles.inviteLabel}>
              Invite Code
            </Typography>
            <Typography variant="title" style={styles.inviteCode}>
              {inviteCode}
            </Typography>
          </View>
          <View style={styles.inviteActions}>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => onCopyInvite(inviteCode)}
            >
              <Image source={copyEmoji} style={styles.copyIcon} />
              <Typography style={styles.copyText}>
                Copy
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Typography style={styles.closeText}>
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </FloatingCard>

      {/* Players List */}
      <FloatingCard style={styles.playersCard}>
        <Typography variant="title" style={styles.playersTitle}>
          Players ({players.length}/16)
        </Typography>
        
        <View style={styles.playersList}>
          {players.map((player) => (
            <View key={player.id} style={styles.playerItem}>
              <View style={styles.playerInfo}>
                <Image 
                  source={faceEmoji} 
                  style={styles.playerIcon}
                />
                <Typography style={styles.playerName}>
                  {player.name}
                  {player.id === currentPlayerId && " (You)"}
                </Typography>
              </View>
              <View style={styles.playerActions}>
                {player.isHost && (
                  <Image 
                    source={crownEmoji} 
                    style={styles.hostIcon}
                  />
                )}
                {player.id === currentPlayerId ? (
                  <TouchableOpacity 
                    style={[
                      styles.readyButton,
                      player.isReady && styles.readyButtonActive
                    ]}
                    onPress={() => onPlayerReady(player.id)}
                  >
                    <Image 
                      source={checkMarkEmoji} 
                      style={[
                        styles.readyIcon,
                        !player.isReady && styles.readyIconInactive
                      ]} 
                    />
                  </TouchableOpacity>
                ) : (
                  player.isReady && <View style={styles.readyIndicator} />
                )}
              </View>
            </View>
          ))}
        </View>
      </FloatingCard>

      {/* Start Game Button - Only visible to host when all players ready */}
      {isHost && (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onStartGame}
        >
          <Typography variant="label" style={styles.startText}>
            Start Game
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
    paddingTop: 60,
    borderRadius: 16,
  },
  inviteCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 16,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  inviteCode: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'monospace',
  },
  playersCard: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginBottom: 16,
  },
  playersTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 16,
  },
  playersList: {
    gap: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerIcon: {
    width: 32,
    height: 32,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  hostIcon: {
    width: 24,
    height: 24,
  },
  readyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#32D74B',
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyButtonActive: {
    backgroundColor: '#32D74B',
  },
  readyIcon: {
    width: 24,
    height: 24,
  },
  readyIconInactive: {
    opacity: 0.5,
  },
  startButton: {
    backgroundColor: '#FF3131',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  inviteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  copyIcon: {
    width: 16,
    height: 16,
  },
  copyText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 49, 49, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
}); 