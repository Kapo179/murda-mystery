import React from 'react';
import { StyleSheet, View, Image, ViewStyle } from 'react-native';
import { Typography } from '@/components/Typography';

interface FeaturePillProps {
  emoji: any;
  text: string;
  style?: ViewStyle;
}

export function FeaturePill({ emoji, text, style }: FeaturePillProps) {
  return (
    <View style={[styles.pill, style]}>
      <Image source={emoji} style={styles.emoji} />
      <Typography style={styles.text}>{text}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
}); 