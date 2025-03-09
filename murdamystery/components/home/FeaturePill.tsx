import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';

export interface FeaturePillProps {
  emoji: any; // Source for Image component
  text: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export function FeaturePill({ emoji, text, style, onPress }: FeaturePillProps) {
  const PillComponent = onPress ? TouchableOpacity : View;
  
  return (
    <PillComponent 
      style={[styles.container, style]}
      {...(onPress && { onPress })}
    >
      <Image source={emoji} style={styles.emoji} />
      <Text style={styles.text}>{text}</Text>
    </PillComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2E33',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  emoji: {
    width: 20,
    height: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500', // Medium
  },
}); 