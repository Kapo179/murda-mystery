import React from 'react';
import { View } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface BellIconProps {
  size?: number;
  color?: string;
}

export function BellIcon({ size = 24, color = '#FFFFFF' }: BellIconProps) {
  return (
    <IconSymbol 
      name="bell"
      size={size}
      color={color}
      weight="light"
    />
  );
} 