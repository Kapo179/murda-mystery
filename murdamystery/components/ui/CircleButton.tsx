import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface CircleButtonProps {
  icon: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CircleButton({ icon, onPress, style }: CircleButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconSymbol name={icon} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
}); 