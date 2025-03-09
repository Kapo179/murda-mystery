import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../Typography';

interface GlowButtonProps {
  title: string;
  onPress?: () => void;
  color?: string;
}

export function GlowButton({ title, onPress, color = '#FF3131' }: GlowButtonProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${color}33`, 'transparent']} // 33 is 20% opacity in hex
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: color }]}
        onPress={onPress}
      >
        <Typography variant="label" style={styles.text}>
          {title}
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 40,
    borderRadius: 32,
  },
  button: {
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
  },
}); 