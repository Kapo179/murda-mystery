import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { FloatingCard } from './FloatingCard';

interface NotificationBellProps {
  onPress?: () => void;
  hasNotifications?: boolean;
  style?: ViewStyle;
}

export function NotificationBell({ onPress, hasNotifications = false, style }: NotificationBellProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <FloatingCard style={styles.container} intensity={30}>
        <IconSymbol 
          name="bell.fill" 
          size={20} 
          color="#FFFFFF" 
        />
        {hasNotifications && (
          <View style={styles.badge} />
        )}
      </FloatingCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
}); 