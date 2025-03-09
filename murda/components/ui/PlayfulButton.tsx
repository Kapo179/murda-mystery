import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Typography } from '../Typography';

interface PlayfulButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  style?: ViewStyle;
}

export function PlayfulButton({ 
  onPress, 
  title, 
  color = '#FFFFFF',
  style 
}: PlayfulButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.touchable, style]}
      activeOpacity={0.8}
    >
      <View style={[styles.container, { backgroundColor: color }]}>
        <Typography 
          variant="label"
          weight="bold"
          style={{
            fontSize: 20,
            textAlign: 'center',
            letterSpacing: 0.5,
            color: '#FFFFFF'
          }}
        >
          {title}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  container: {
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 8,
  },
}); 