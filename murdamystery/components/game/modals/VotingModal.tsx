import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  Image, 
  Text, 
  FlatList, 
  Dimensions,
  SafeAreaView,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '@/components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Player } from '@/types/game';

// Import emoji assets
const closeIcon = require('@/assets/images/emojis/assets/Cross mark/3D/cross_mark_3d.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const timerEmoji = require('@/assets/images/emojis/assets/Stopwatch/3D/stopwatch_3d.png');
const voteEmoji = require('@/assets/images/emojis/assets/Ballot box with ballot/3D/ballot_box_with_ballot_3d.png');
const checkMarkEmoji = require('@/assets/images/emojis/assets/Check mark button/3D/check_mark_button_3d.png');
const warningEmoji = require('@/assets/images/emojis/assets/Warning/3D/warning_3d.png');
const tensionEmoji = require('@/assets/images/emojis/assets/Hundred points/3D/hundred_points_3d.png');
const eliminatedEmoji = require('@/assets/images/emojis/assets/Skull/3D/skull_3d.png');
const dramaticMusicEmoji = require('@/assets/images/emojis/assets/Musical notes/3D/musical_notes_3d.png');

const { width, height } = Dimensions.get('window');

// Mock data for testing
const mockPlayers: Player[] = [
  { id: '1', name: 'Alex', isAlive: true, role: 'civilian', votes: 0 },
  { id: '2', name: 'Taylor', isAlive: true, role: 'mafia', votes: 0 },
  { id: '3', name: 'Jordan', isAlive: true, role: 'civilian', votes: 0 },
  { id: '4', name: 'Morgan', isAlive: true, role: 'civilian', votes: 0 },
  { id: '5', name: 'Casey', isAlive: true, role: 'civilian', votes: 0 },
  { id: '6', name: 'Riley', isAlive: false, role: 'civilian', votes: 0 },
];

interface VotingModalProps {
  visible: boolean;
  onClose: () => void;
  players?: Player[];
  currentPlayerId?: string;
  onVoteSubmit?: (selectedPlayerId: string) => void;
  votingDuration?: number; // in seconds
}

export function VotingModal({
  visible,
  onClose,
  players = mockPlayers,
  currentPlayerId = '1', // Default to first player for testing
  onVoteSubmit,
  votingDuration = 60 // Default 60 seconds
}: VotingModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(votingDuration);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // New states for dramatic reveal
  const [revealStage, setRevealStage] = useState(0); // 0: not started, 1: counting, 2: suspense, 3: final reveal
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [voteCounts, setVoteCounts] = useState<{[key: string]: number}>({});
  const pulseAnim = new Animated.Value(1);
  
  // Only include alive players in voting
  const alivePlayers = players.filter(player => player.isAlive);
  
  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedPlayerId(null);
      setVoteSubmitted(false);
      setShowResults(false);
      setTimeRemaining(votingDuration);
      setRevealStage(0);
      setEliminatedPlayer(null);
      setVoteCounts({});
    }
  }, [visible, votingDuration]);
  
  // Timer countdown
  useEffect(() => {
    if (!visible || timeRemaining <= 0 || showResults) return;
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Auto-submit when time runs out
          if (selectedPlayerId && !voteSubmitted) {
            handleVoteSubmit();
          }
          // Show results when time runs out
          setShowResults(true);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, visible, selectedPlayerId, voteSubmitted, showResults]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle vote selection
  const handleSelectPlayer = (playerId: string) => {
    if (voteSubmitted || showResults) return;
    setSelectedPlayerId(playerId);
  };
  
  // Start pulsing animation
  useEffect(() => {
    if (revealStage === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [revealStage]);
  
  // Handle vote submission
  const handleVoteSubmit = () => {
    if (!selectedPlayerId || voteSubmitted) return;
    
    setVoteSubmitted(true);
    
    // Call the parent component's vote handler
    if (onVoteSubmit) {
      onVoteSubmit(selectedPlayerId);
    }
    
    // Begin the dramatic reveal sequence
    startDramaticReveal();
  };
  
  // New function for dramatic reveal sequence
  const startDramaticReveal = () => {
    // Simulate vote counting (this would be real in production)
    const simulatedVotes: {[key: string]: number} = {};
    alivePlayers.forEach(player => {
      // Random votes, with more likely for the selected player
      simulatedVotes[player.id] = player.id === selectedPlayerId ? 
        Math.floor(Math.random() * 3) + 2 : 
        Math.floor(Math.random() * 3);
    });
    
    // Find player with most votes
    let maxVotes = 0;
    let eliminatedId = "";
    Object.entries(simulatedVotes).forEach(([id, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        eliminatedId = id;
      }
    });
    
    const eliminated = alivePlayers.find(p => p.id === eliminatedId) || null;
    
    // Stage 1: Counting votes (show after 1.5s)
    setTimeout(() => {
      setShowResults(true);
      setRevealStage(1);
      setVoteCounts(simulatedVotes);
    }, 1500);
    
    // Stage 2: Suspense (show after another 3s)
    setTimeout(() => {
      setRevealStage(2);
    }, 4500);
    
    // Stage 3: Final reveal (show after another 3s)
    setTimeout(() => {
      setRevealStage(3);
      setEliminatedPlayer(eliminated);
    }, 7500);
  };
  
  // Render the appropriate result view based on reveal stage
  const renderResultsView = () => {
    switch (revealStage) {
      case 1: // Counting votes
        return (
          <View style={styles.resultsStagingArea}>
            <Image source={dramaticMusicEmoji} style={styles.resultsIcon} />
            <Typography style={styles.countingText}>
              Tallying votes...
            </Typography>
          </View>
        );
        
      case 2: // Suspense
        return (
          <View style={styles.resultsStagingArea}>
            <Animated.View style={{
              transform: [{ scale: pulseAnim }]
            }}>
              <Image source={tensionEmoji} style={styles.tensionIcon} />
            </Animated.View>
            <Typography style={styles.suspenseText}>
              The votes are in...
            </Typography>
          </View>
        );
        
      case 3: // Final reveal
        return (
          <View style={styles.resultsSummary}>
            <Image source={eliminatedEmoji} style={styles.resultsIcon} />
            <Typography style={styles.eliminatedText}>
              {eliminatedPlayer?.name} has been eliminated!
            </Typography>
            <Typography style={styles.roleRevealText}>
              They were a {eliminatedPlayer?.role === 'mafia' ? 
                <Text style={{color: '#FF3B30'}}>MAFIA</Text> : 
                <Text style={{color: '#4CD964'}}>CIVILIAN</Text>}
            </Typography>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}>
          <BlurView intensity={35} style={styles.blurBackground} tint="dark" />
          
          <View style={styles.modalView}>
            {/* Header */}
            <View style={styles.header}>
              <Image source={voteEmoji} style={styles.headerIcon} />
              <Typography variant="title" style={styles.title}>
                Emergency Meeting
              </Typography>
              
              {!showResults && (
                <View style={styles.timerContainer}>
                  <Image source={timerEmoji} style={styles.timerIcon} />
                  <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Image source={closeIcon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            
            {/* Instructions */}
            {!showResults ? (
              <View style={styles.instructions}>
                <Typography style={styles.instructionText}>
                  Vote for who you think is the mafia!
                </Typography>
              </View>
            ) : (
              <View style={styles.instructions}>
                <Typography style={styles.instructionText}>
                  {revealStage < 3 ? "Votes are being counted..." : "Voting Results"}
                </Typography>
              </View>
            )}
            
            {/* Player List for Voting */}
            {!showResults ? (
              <FlatList
                data={alivePlayers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.playerCard,
                      selectedPlayerId === item.id && !showResults && styles.selectedPlayer,
                      item.id === currentPlayerId && styles.currentPlayer,
                      showResults && item.votes > 0 && styles.votedPlayer
                    ]}
                    onPress={() => handleSelectPlayer(item.id)}
                    disabled={item.id === currentPlayerId || voteSubmitted || showResults}
                  >
                    <View style={styles.playerInfo}>
                      <Image source={faceEmoji} style={styles.playerAvatar} />
                      <Text style={styles.playerName}>
                        {item.name}
                        {item.id === currentPlayerId && " (You)"}
                      </Text>
                    </View>
                    
                    {/* Show checkmark if selected */}
                    {selectedPlayerId === item.id && !showResults && (
                      <View style={styles.checkContainer}>
                        <Image source={checkMarkEmoji} style={styles.checkIcon} />
                      </View>
                    )}
                    
                    {/* Show vote count when results are visible */}
                    {showResults && (
                      <View style={styles.voteCountContainer}>
                        <Text style={styles.voteCount}>{item.votes} votes</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.playerList}
              />
            ) : (
              <FlatList
                data={alivePlayers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.playerCard,
                      item.id === eliminatedPlayer?.id && revealStage === 3 && styles.eliminatedPlayerCard,
                    ]}
                  >
                    <View style={styles.playerInfo}>
                      <Image source={faceEmoji} style={styles.playerAvatar} />
                      <Text style={styles.playerName}>
                        {item.name}
                        {item.id === currentPlayerId && " (You)"}
                      </Text>
                    </View>
                    
                    {/* Show vote count for this player if counting is complete */}
                    {revealStage >= 1 && (
                      <View style={styles.voteCountContainer}>
                        <Text style={styles.voteCount}>
                          {voteCounts[item.id] || 0} votes
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                contentContainerStyle={styles.playerList}
              />
            )}
            
            {/* Submit button or results based on state */}
            {!showResults ? (
              <View style={[styles.submitButton, !selectedPlayerId && styles.disabledButton]}>
                <LinearGradient
                  colors={['#FF3B30', '#FF9500']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TouchableOpacity
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleVoteSubmit}
                    disabled={!selectedPlayerId || voteSubmitted}
                  >
                    <Text style={styles.submitText}>
                      {voteSubmitted ? "Vote Submitted" : "Submit Vote"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              renderResultsView()
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalView: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  timerIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  timerText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  playerList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    justifyContent: 'space-between',
  },
  selectedPlayer: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.3)',
  },
  currentPlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.7,
  },
  votedPlayer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  checkContainer: {
    backgroundColor: 'rgba(76, 217, 100, 0.8)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 18,
    height: 18,
  },
  voteCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  voteCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    margin: 20,
    borderRadius: 28,
    overflow: 'hidden',
    height: 56,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSummary: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  resultsIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  resultsText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsStagingArea: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  countingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  suspenseText: {
    color: '#FFC107',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  tensionIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  eliminatedText: {
    color: '#FF3B30',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleRevealText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  eliminatedPlayerCard: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
}); 