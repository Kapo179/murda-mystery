import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import GameView from '../../components/game/views/GameView';
import { RoleReveal } from '@/components/game/RoleReveal';
import { useGameRole } from '@/hooks/useGameRole';
import { Typography } from '@/components/Typography';

export default function GameScreen() {
  const [isRevealing, setIsRevealing] = useState(true);
  const { role } = useGameRole();
  const router = useRouter();

  // Add debug logging
  useEffect(() => {
    console.log('Play component mounted');
    console.log('Current role:', role);
    console.log('isRevealing:', isRevealing);
  }, [role, isRevealing]);

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
            console.log('Role reveal complete');
            setIsRevealing(false);
          }} 
        />
      ) : (
        <>
          <GameView />
          
          {/* Temporary Back Button - can be removed once map is fully working */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Typography style={styles.backButtonText}>Back to Lobby</Typography>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FF3131',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
  }
}); 