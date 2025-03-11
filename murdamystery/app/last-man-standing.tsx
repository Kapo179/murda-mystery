import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, AppState, AppStateStatus } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HunterView } from '@/components/game/views/HunterView';
import { AliveView } from '@/components/game/views/AliveView';
import { ProximityManager } from '@/components/game/ProximityManager';
import { EliminatedView } from '@/components/game/views/EliminatedView';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mock data for player positions (in a real app, this would come from a backend)
const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'You',
    role: 'hunter', // This will be dynamically set
    isAlive: true,
    position: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: '2',
    name: 'Alex',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7739, longitude: -122.4154 }, // ~500m away
  },
  {
    id: '3',
    name: 'Jamie',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7759, longitude: -122.4174 }, // ~300m away
  },
  {
    id: '4',
    name: 'Sam',
    role: 'hunter',
    isAlive: true,
    position: { latitude: 37.7779, longitude: -122.4164 }, // ~400m away
  },
  {
    id: '5',
    name: 'Taylor',
    role: 'alive',
    isAlive: true,
    position: { latitude: 37.7729, longitude: -122.4184 }, // ~350m away
  },
];

// Mock game configuration
const GAME_DURATION_MINUTES = 30;

export default function LastManStandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { gameId, playerRole = 'alive' } = useLocalSearchParams<{ 
    gameId: string;
    playerRole: 'hunter' | 'alive';
  }>();
  
  // State for game
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [myPlayerId, setMyPlayerId] = useState('1');
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  
  // Refs
  const appState = useRef(AppState.currentState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize player role and game
  useEffect(() => {
    // Set player's role based on URL param
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === myPlayerId ? { ...player, role: playerRole } : player
      )
    );
    
    // Start game timer
    startGameTimer();
    
    // Register for push notifications
    registerForPushNotifications();
    
    // Add app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active'
    ) {
      // App has come to the foreground - refresh game state
      // In a real app, you'd fetch the latest game state from your backend
    }
    
    appState.current = nextAppState;
  };
  
  // Register for push notifications
  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Required',
        'Push notifications are required to receive alerts when players are nearby or when you are tagged.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // In a real app, you'd send this token to your backend
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  };
  
  // Start game timer
  const startGameTimer = () => {
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - gameStartTime;
      const remainingMs = Math.max(0, GAME_DURATION_MINUTES * 60 * 1000 - elapsed);
      
      if (remainingMs <= 0) {
        // Game has ended due to time running out
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        handleGameOver('time');
        return;
      }
      
      // Format time remaining
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  };
  
  // Handle tagging a player (for hunters)
  const handleTagPlayer = async (targetId: string) => {
    // Find the target player
    const targetPlayer = players.find(p => p.id === targetId);
    if (!targetPlayer) return;
    
    // In a real app, you'd send this to your backend to verify the tag
    // For this mock, we'll just update the local state
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === targetId ? { ...player, isAlive: false } : player
      )
    );
    
    // Check if game is over (no more alive players)
    const alivePlayersRemaining = players
      .filter(p => p.id !== targetId) // Exclude the player we just tagged
      .filter(p => p.role === 'alive' && p.isAlive)
      .length;
    
    if (alivePlayersRemaining === 0) {
      handleGameOver('huntersWin');
    }
    
    // Show success message
    Alert.alert(
      'Player Tagged!',
      `You successfully tagged ${targetPlayer.name}!`,
      [{ text: 'OK' }]
    );
  };
  
  // Handle game over
  const handleGameOver = (reason: 'huntersWin' | 'aliveWin' | 'time') => {
    setIsGameOver(true);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // In a real app, you'd send the game results to your backend
  };
  
  // Handle leaving the game
  const handleLeaveGame = () => {
    // In a real app, you'd notify your backend that the player is leaving
    router.replace('/');
  };
  
  // Handle proximity updates from ProximityManager
  const handleProximityUpdate = (nearbyPlayerIds: string[], nearestDistance: number | null) => {
    setNearbyPlayers(nearbyPlayerIds);
    
    // If we're an alive player and there are hunters nearby, we could send a notification
    if (playerRole === 'alive' && nearbyPlayerIds.length > 0 && appState.current !== 'active') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hunter Nearby!',
          body: 'A hunter is getting close to your location!',
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    }
  };
  
  // Handle location updates from ProximityManager
  const handleLocationUpdate = (location: Location.LocationObject) => {
    setMyLocation(location);
    
    // Update our position in the players array
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === myPlayerId 
          ? { 
              ...player, 
              position: { 
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude 
              } 
            } 
          : player
      )
    );
    
    // In a real app, you'd send this location update to your backend
  };
  
  // Determine which view to show based on player role and alive status
  const renderGameView = () => {
    const myPlayer = players.find(p => p.id === myPlayerId);
    if (!myPlayer) return null;
    
    // Player has been eliminated
    if (!myPlayer.isAlive) {
      return (
        <EliminatedView
          players={players}
          totalPlayers={players.length}
          gameTimeRemaining={timeRemaining}
        />
      );
    }
    
    // Player is a hunter
    if (myPlayer.role === 'hunter') {
      return (
        <HunterView
          onTagPlayer={handleTagPlayer}
          players={players}
          totalPlayers={players.length}
          gameTimeRemaining={timeRemaining}
          tagDistance={15}
        />
      );
    }
    
    // Player is alive and trying to survive
    return (
      <AliveView
        players={players}
        totalPlayers={players.length}
        gameTimeRemaining={timeRemaining}
        warningDistance={50}
      />
    );
  };
  
  return (
    <SafeAreaView edges={['top']} style={[
      styles.container, 
      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Game View */}
      {renderGameView()}
      
      {/* Proximity Manager (handles location tracking and proximity detection) */}
      <ProximityManager
        enabled={true}
        playerRole={playerRole}
        players={players}
        onProximityUpdate={handleProximityUpdate}
        onLocationUpdate={handleLocationUpdate}
      />
      
      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        onClose={handleLeaveGame}
        winner={
          players.some(p => p.role === 'alive' && p.isAlive) ? 'alive' : 'hunter'
        }
        playerRole={playerRole}
        stats={{
          playersEliminated: players.filter(p => !p.isAlive).length,
          timePlayed: timeRemaining ? 
            `${GAME_DURATION_MINUTES - parseInt(timeRemaining.split(':')[0])} minutes` :
            `${GAME_DURATION_MINUTES} minutes`,
          distanceTraveled: '1.2 km' // In a real app, you'd calculate this
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 