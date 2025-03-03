import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GameMap from '../GameMap';
import { sharedStyles } from './shared/styles';
import { Typography } from '@/components/Typography';
import { usePlayerRole } from '@/hooks/useGame';

export default function MapView() {
  const { player, isMafia } = usePlayerRole();
  
  return (
    <View style={[styles.container, sharedStyles.container]}>
      <View style={styles.header}>
        <Typography variant="title" style={styles.title}>
          Game Map
        </Typography>
        {player && (
          <Typography variant="body" style={styles.subtitle}>
            {isMafia 
              ? 'You can see all players' 
              : 'You can only see your location'}
          </Typography>
        )}
      </View>
      
      <View style={styles.mapContainer}>
        <GameMap showAllPlayers={isMafia} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ddd',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
}); 