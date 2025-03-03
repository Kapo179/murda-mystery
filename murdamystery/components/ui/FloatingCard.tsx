import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface FloatingCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
}

export function FloatingCard({ children, style, intensity = 45, ...props }: FloatingCardProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <BlurView intensity={intensity} style={styles.blur} tint="dark">
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
}); 