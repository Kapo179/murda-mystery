import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Share,
  Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface GameOverModalProps {
  visible: boolean;
  onClose: () => void;
  winner: 'hunter' | 'alive';  // Which team won
  playerRole: 'hunter' | 'alive';  // The player's role
  stats: {
    playersEliminated: number;
    timePlayed: string;
    distanceTraveled: string;
  };
}

export function GameOverModal({ 
  visible, 
  onClose, 
  winner, 
  playerRole,
  stats 
}: GameOverModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSharing, setIsSharing] = useState(false);
  
  // Determine if the player won
  const playerWon = playerRole === winner;
  
  // Get appropriate colors and messages
  const getWinnerColors = () => {
    return winner === 'hunter' 
      ? ['#FF3B30', '#FF9500'] // Hunter win colors (red to orange)
      : ['#34C759', '#30D158']; // Alive win colors (green shades)
  };
  
  const getWinnerTitle = () => {
    return winner === 'hunter' 
      ? 'HUNTERS WIN!' 
      : 'SURVIVORS WIN!';
  };
  
  const getPlayerResult = () => {
    if (playerWon) {
      return playerRole === 'hunter' 
        ? 'You successfully eliminated all survivors!' 
        : 'You survived until the end!';
    } else {
      return playerRole === 'hunter' 
        ? 'The survivors have outlasted you!' 
        : 'You were eliminated!';
    }
  };
  
  const getWinnerIcon = () => {
    return winner === 'hunter' 
      ? 'skull' 
      : 'medal';
  };
  
  // Share results
  const handleShare = async () => {
    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await Share.share({
        message: `I just played Last Man Standing! ${playerWon ? 'I WON! 🏆' : 'Good game!'} Stats: Eliminated ${stats.playersEliminated} players. Time played: ${stats.timePlayed}. Distance traveled: ${stats.distanceTraveled}. Play with me next time!`,
        title: 'My Last Man Standing Results',
      });
    } catch (error) {
      console.error('Error sharing game results:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  // Play again button handler
  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, you'd navigate to the game setup screen or lobby
    onClose();
  };
  
  // Exit button handler
  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.centeredView}>
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[
            styles.modalBackground,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }
          ]}
        />
        
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={[
            styles.modalView,
            { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }
          ]}
        >
          {/* Modal header with gradient background */}
          <LinearGradient
            colors={getWinnerColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <FontAwesome5 
              name={getWinnerIcon()} 
              size={40} 
              color="#FFFFFF" 
              style={styles.winnerIcon}
            />
            <Text style={styles.winnerTitle}>{getWinnerTitle()}</Text>
          </LinearGradient>
          
          {/* Player result */}
          <View style={styles.resultContainer}>
            <Text style={[
              styles.playerResultText,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              {getPlayerResult()}
            </Text>
            
            <Text style={[
              styles.playerResultEmoji,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              {playerWon ? '🎉' : '😔'}
            </Text>
          </View>
          
          {/* Game stats */}
          <View style={[
            styles.statsContainer,
            { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: isDark ? '#adadad' : '#8e8e93' }
            ]}>
              GAME STATS
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {stats.playersEliminated}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#adadad' : '#8e8e93' }
                ]}>
                  Eliminated
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {stats.timePlayed}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#adadad' : '#8e8e93' }
                ]}>
                  Time Played
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {stats.distanceTraveled}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#adadad' : '#8e8e93' }
                ]}>
                  Distance
                </Text>
              </View>
            </View>
          </View>
          
          {/* Share button */}
          <TouchableOpacity 
            style={[
              styles.shareButton,
              { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' }
            ]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <FontAwesome5 
              name="share-alt" 
              size={20} 
              color={isDark ? '#ffffff' : '#000000'} 
              style={styles.shareIcon}
            />
            <Text style={[
              styles.shareText,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              {isSharing ? 'Sharing...' : 'Share Results'}
            </Text>
          </TouchableOpacity>
          
          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.exitButton,
                { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' }
              ]}
              onPress={handleExit}
            >
              <Text style={[
                styles.buttonText,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Exit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.playAgainButton,
              ]}
              onPress={handlePlayAgain}
            >
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playAgainGradient}
              >
                <Text style={styles.playAgainText}>
                  Play Again
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    width: width * 0.85,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerIcon: {
    marginBottom: 10,
  },
  winnerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  playerResultText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  playerResultEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  statsContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  shareIcon: {
    marginRight: 8,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exitButton: {
    marginRight: 10,
  },
  playAgainButton: {
    marginLeft: 10,
  },
  playAgainGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 