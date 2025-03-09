import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Image, 
  SafeAreaView,
  Alert,
  Share
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

// Import emoji assets
const mafiaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const civilianEmoji = require('@/assets/images/emojis/assets/Beaming face with smiling eyes/3D/beaming_face_with_smiling_eyes_3d.png');
const personEmoji = require('@/assets/images/emojis/assets/Person/Default/3D/person_3d_default.png');
const crownEmoji = require('@/assets/images/emojis/assets/Crown/3D/crown_3d.png');

export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract parameters
  const gameCode = params.gameCode as string || 'NO CODE';
  const isHost = params.isHost === 'true';
  const mafiaCount = parseInt(params.mafiaCount as string || '2', 10);
  const civilianCount = parseInt(params.civilianCount as string || '6', 10);
  
  // State for game and players
  const [players, setPlayers] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate some mock players
  useEffect(() => {
    const mockPlayers = [
      { id: '1', name: 'You (Host)', isHost: true, isReady: true, avatar: personEmoji },
      { id: '2', name: 'Player 2', isHost: false, isReady: false, avatar: personEmoji },
      { id: '3', name: 'Player 3', isHost: false, isReady: true, avatar: personEmoji },
    ];
    
    setPlayers(isHost ? mockPlayers : mockPlayers.slice(1).concat({ 
      id: '1', 
      name: 'You', 
      isHost: false, 
      isReady: isReady,
      avatar: personEmoji
    }));
  }, [isHost, isReady]);
  
  // Copy game code to clipboard
  const copyGameCode = async () => {
    await Clipboard.setStringAsync(gameCode);
    Alert.alert('Copied!', 'Game code copied to clipboard');
  };
  
  // Share game code
  const shareGameCode = async () => {
    try {
      await Share.share({
        message: `Join my Murda Mystery game with code: ${gameCode}`,
      });
    } catch (error) {
      console.error('Error sharing game code:', error);
    }
  };
  
  // Toggle ready status
  const toggleReady = () => {
    setIsReady(!isReady);
  };
  
  // Start the game (host only)
  const startGame = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to the game screen
      router.replace('/play');
    } catch (error) {
      console.error('Error starting game:', error);
      setIsLoading(false);
    }
  };
  
  // Leave the lobby
  const leaveLobby = () => {
    Alert.alert(
      'Leave Lobby',
      'Are you sure you want to leave this lobby?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => router.push('/')
        }
      ]
    );
  };
  
  // Render player item
  const renderPlayer = ({ item }: { item: any }) => (
    <View style={styles.playerItem}>
      <View style={styles.playerInfo}>
        <Image source={item.avatar} style={styles.playerAvatar} />
        <Text style={styles.playerName}>{item.name}</Text>
        {item.isHost && (
          <Image source={crownEmoji} style={styles.hostIcon} />
        )}
      </View>
      <View style={[
        styles.readyIndicator, 
        { backgroundColor: item.isReady ? '#4CFF00' : '#FFB700' }
      ]}>
        <Text style={styles.readyText}>
          {item.isReady ? 'Ready' : 'Waiting'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          title: 'Game Lobby',
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Lobby</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Game Info */}
      <View style={styles.gameInfoContainer}>
        <Text style={styles.gameCodeLabel}>GAME CODE</Text>
        <View style={styles.gameCodeContainer}>
          <Text style={styles.gameCode}>{gameCode}</Text>
          <TouchableOpacity onPress={copyGameCode} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={shareGameCode} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Invite</Text>
        </TouchableOpacity>
      </View>
      
      {/* Role Count */}
      {isHost && (
        <View style={styles.roleCountContainer}>
          <View style={styles.roleItem}>
            <Image source={mafiaEmoji} style={styles.roleEmoji} />
            <Text style={styles.roleCount}>{mafiaCount}</Text>
          </View>
          
          <View style={styles.roleItem}>
            <Image source={civilianEmoji} style={styles.roleEmoji} />
            <Text style={styles.roleCount}>{civilianCount}</Text>
          </View>
          
          <View style={styles.totalPlayersItem}>
            <Text style={styles.totalPlayersText}>
              {mafiaCount + civilianCount} Players Total
            </Text>
          </View>
        </View>
      )}
      
      {/* Players List */}
      <View style={styles.playersContainer}>
        <Text style={styles.sectionTitle}>Players</Text>
        <Text style={styles.playersCount}>
          {players.length} / {mafiaCount + civilianCount}
        </Text>
        
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.playersList}
        />
      </View>
      
      {/* Actions */}
      <View style={styles.actionsContainer}>
        {isHost ? (
          <TouchableOpacity 
            style={[
              styles.startButton,
              isLoading && styles.loadingButton
            ]}
            onPress={startGame}
            disabled={isLoading}
          >
            <Text style={styles.startButtonText}>
              {isLoading ? 'Starting...' : 'Start Game'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.readyButton,
              isReady && styles.readyButtonActive
            ]}
            onPress={toggleReady}
          >
            <Text style={styles.readyButtonText}>
              {isReady ? 'Ready' : 'Mark as Ready'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.leaveButton}
          onPress={leaveLobby}
          disabled={isLoading}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gameInfoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  gameCodeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  gameCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginRight: 16,
  },
  copyButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  roleCountContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  roleEmoji: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  roleCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalPlayersItem: {
    marginLeft: 'auto',
  },
  totalPlayersText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  playersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playersCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  playersList: {
    paddingBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  hostIcon: {
    width: 18,
    height: 18,
    marginLeft: 8,
  },
  readyIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#FF544E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingButton: {
    opacity: 0.7,
  },
  readyButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  readyButtonActive: {
    backgroundColor: '#4CFF00',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaveButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
}); 