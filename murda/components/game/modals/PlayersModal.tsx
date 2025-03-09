import React from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '@/components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameRole } from '../views/GameView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { SlideInUp, SlideOutDown } from 'react-native-reanimated';

// Import emojis
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
// Keep detective emoji for backward compatibility
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const civilianEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const heartEmoji = require('@/assets/images/emojis/assets/Red heart/3D/red_heart_3d.png');
const ghostEmoji = require('@/assets/images/emojis/assets/Ghost/3D/ghost_3d.png');
const closeIcon = require('@/assets/images/emojis/assets/Cross mark/3D/cross_mark_3d.png');
const exitEmoji = require('@/assets/images/emojis/assets/Person running/Default/3D/person_running_3d_default.png');

interface Player {
  id: string;
  name: string;
  isAlive: boolean;
  role?: 'mafia' | 'detective' | 'townsperson';  // Keep detective for backward compatibility
}

interface PlayersModalProps {
  visible: boolean;
  onClose: () => void;
  players: Player[];
  playerRole: string;
  onExitGame?: () => void;
}

export function PlayersModal({ 
  visible, 
  onClose, 
  players,
  playerRole,
  onExitGame,
}: PlayersModalProps) {
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);
  
  // Get all players and mark them by role and alive status
  const allPlayers = [
    ...alivePlayers.map(p => ({ id: p.id, role: p.role as GameRole, alive: true })),
    ...deadPlayers.map(p => ({ id: p.id, role: p.role as GameRole, alive: false })),
  ];
  
  // Sort players: alive players first, then by role, then by name
  allPlayers.sort((a, b) => {
    // First, sort by alive status
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    
    // If alive status is the same, sort by role (player's role first)
    if (a.role === playerRole && b.role !== playerRole) return -1;
    if (a.role !== playerRole && b.role === playerRole) return 1;
    
    // If role is the same, sort alphabetically
    return a.id.localeCompare(b.id);
  });
  
  // Get emoji for each role
  const getRoleEmoji = (role: GameRole) => {
    switch (role) {
      case 'mafia':
        return ninjaEmoji;
      default: // Both detective and civilian roles use the same emoji now
        return civilianEmoji;
    }
  };
  
  // Get color for each role
  const getRoleColor = (role: GameRole) => {
    switch (role) {
      case 'mafia':
        return '#FF3131';
      case 'detective':  // Keep for backward compatibility
        return '#4B9EF4';
      default:
        return '#32D74B';
    }
  };
  
  // Determine if player role should be revealed
  const shouldRevealRole = (playerObj: { id: string, role: GameRole, alive: boolean }) => {
    // Always show your own role
    if (playerObj.id === 'player1') return true;
    
    // Mafia can see other mafia
    if (playerRole === 'mafia' && playerObj.role === 'mafia') return true;
    
    // Detectives can see other detectives
    if (playerRole === 'detective' && playerObj.role === 'detective') return true;
    
    // For dead players, reveal all roles EXCEPT mafia (unless viewer is mafia)
    if (!playerObj.alive) {
      // Never reveal mafia role to non-mafia players, even if dead
      if (playerObj.role === 'mafia' && playerRole !== 'mafia') {
        return false;
      }
      return true;
    }
    
    // Otherwise, role is hidden
    return false;
  };
  
  // Update role display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'mafia': 
        return 'Mafia';
      case 'detective':  // For backward compatibility, show as townsperson
        return 'Townsperson';
      default:
        return 'Townsperson';
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={15} style={StyleSheet.absoluteFill} tint="dark">
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={styles.container}
            entering={SlideInUp.springify().damping(15)}
            exiting={SlideOutDown.springify().damping(15)}
          >
            <View style={styles.header}>
              <Typography variant="title" style={styles.title}>
                Players
              </Typography>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.exitButton}
              onPress={onExitGame}
            >
              <Image source={exitEmoji} style={styles.exitIcon} />
              <Typography style={styles.exitText}>Exit Game</Typography>
            </TouchableOpacity>
            
            <View style={styles.roleSection}>
              <Typography variant="caption" style={styles.roleLabel}>
                Your Role
              </Typography>
              <Typography variant="title" style={styles.roleText}>
                {getRoleDisplayText(playerRole)}
              </Typography>
            </View>
            
            <FlatList
              data={allPlayers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[
                  styles.playerRow, 
                  !item.alive && styles.deadPlayerRow
                ]}>
                  <View style={styles.playerNameContainer}>
                    {shouldRevealRole(item) ? (
                      <>
                        <Image 
                          source={getRoleEmoji(item.role)} 
                          style={[
                            styles.roleIcon, 
                            !item.alive && styles.deadIcon
                          ]} 
                        />
                        <Typography 
                          style={[
                            styles.playerName, 
                            // Only highlight mafia names in red when viewed by mafia
                            (playerRole === 'mafia' && item.role === 'mafia') ? 
                              { color: '#FF3131' } : // Red for mafia viewed by mafia
                              { color: '#FFFFFF' },  // White for all other cases
                            !item.alive && styles.deadPlayerName
                          ]}
                        >
                          {item.id}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Image 
                          source={civilianEmoji} 
                          style={[
                            styles.roleIcon,
                            !item.alive && styles.deadIcon
                          ]} 
                        />
                        <Typography 
                          style={[
                            styles.playerName,
                            // No colored highlighting for unknown roles
                            { color: '#FFFFFF' },
                            !item.alive && styles.deadPlayerName
                          ]}
                        >
                          {item.id}
                        </Typography>
                      </>
                    )}
                  </View>
                  
                  {/* Status indicator */}
                  <Image 
                    source={item.alive ? heartEmoji : ghostEmoji} 
                    style={styles.statusIcon} 
                  />
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          </Animated.View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  deadPlayerRow: {
    opacity: 0.6,
  },
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleIcon: {
    width: 24,
    height: 24,
  },
  deadIcon: {
    opacity: 0.7,
  },
  playerName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  deadPlayerName: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  statusIcon: {
    width: 20,
    height: 20,
  },
  roleSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  roleLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  roleText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 53, 59, 0.8)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  exitIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  exitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 