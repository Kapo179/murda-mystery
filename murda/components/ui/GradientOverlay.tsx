import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientOverlayProps {
  position: 'top' | 'bottom';
}

export function GradientOverlay({ position }: GradientOverlayProps) {
  const colors = position === 'top' 
    ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']
    : ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'];

  return (
    <LinearGradient
      colors={colors}
      style={[
        styles.gradient,
        position === 'top' ? styles.top : styles.bottom
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 150,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});