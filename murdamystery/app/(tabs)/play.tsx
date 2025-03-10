import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import GameView from '../../components/game/views/GameView';
import { RoleReveal } from '@/components/game/RoleReveal';
import { Typography } from '@/components/Typography';
import { GameProvider, useGame } from '@/contexts/GameContext';

function GameContent() {
  const [isRevealing, setIsRevealing] = useState(true);
  const { role } = useGame();
  const router = useRouter();

  // Add debug logging
  useEffect(() => {
    console.log('Play component mounted');
    console.log('Current role from context:', role);
  }, [role]);

  if (!role) {
    console.log('No role available yet');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Typography style={styles.loadingText}>Assigning role...</Typography>
      </View>
    );
  }

  console.log('Rendering Play component with role:', role);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {isRevealing ? (
        <RoleReveal 
          role={role} 
          onComplete={() => {
            console.log('Role reveal complete, transitioning to game view');
            setIsRevealing(false);
          }} 
        />
      ) : (
        <GameView />
      )}
    </View>
  );
}

export default function GameScreen() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
  }
}); 