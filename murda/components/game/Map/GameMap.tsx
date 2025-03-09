import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export function GameMap() {
  return (
    <View style={styles.container}>
      <ThemedText>Game Map Component</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 