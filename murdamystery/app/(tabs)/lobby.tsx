import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LobbyView } from '../../components/game/LobbyView';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';

// Mock data for now
const MOCK_PLAYERS = [
  { id: '1', name: 'You', isHost: true, isReady: false },
  { id: '2', name: 'Player 2', isReady: false },
  { id: '3', name: 'Player 3', isReady: false },
  { id: '4', name: 'Player 4', isReady: false },
];

export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [players, setPlayers] = React.useState(MOCK_PLAYERS);
  const [inviteCode] = React.useState('ABC123');

  // Log the parameters to verify they're coming through
  React.useEffect(() => {
    console.log('Lobby params:', params);
  }, [params]);

  const handlePlayerReady = (playerId: string) => {
    setPlayers(current => 
      current.map(player => 
        player.id === playerId 
          ? { ...player, isReady: !player.isReady }
          : player
      )
    );
  };

  const handleStartGame = () => {
    console.log('Starting game...');
    router.push('/play'); // Correct path to the play screen
  };

  const handleClose = () => {
    router.back(); // Go back to previous screen
  };

  const handleCopyInvite = async (code: string) => {
    await Clipboard.setStringAsync(code);
    // Could add toast notification here
  };

  return (
    <View style={styles.container}>
      <LobbyView 
        players={players}
        inviteCode={inviteCode}
        onStartGame={handleStartGame}
        onPlayerReady={handlePlayerReady}
        currentPlayerId="1"
        onClose={handleClose}
        onCopyInvite={handleCopyInvite}
      />
      <TouchableOpacity 
        testID="start-game-button"
        onPress={handleStartGame}
      >
        <Typography>Start Game</Typography>
      </TouchableOpacity>

      {players.map((player, index) => (
        <TouchableOpacity
          key={player.id}
          testID={`player-ready-${index + 1}`}
          onPress={() => handlePlayerReady(player.id)}
        >
          {/* ... player UI ... */}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  }
}); 