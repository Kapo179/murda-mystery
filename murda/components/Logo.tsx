import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from './Typography';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 40 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Typography
        style={[styles.emoji, { fontSize: size }]}
        weight="regular"
      >
        👀
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontFamily: 'NotoEmoji',
  },
}); 