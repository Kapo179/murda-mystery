import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface GameIconProps {
  name: string;
  size?: number;
  color?: string;
  active?: boolean;
}

export function GameIcon({ 
  name, 
  size = 24, 
  color = '#FFFFFF',
  active = false 
}: GameIconProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [active]);

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale }] }
    ]}>
      <View style={styles.shadow} />
      <View style={[styles.icon, { width: size, height: size }]}>
        <IconSymbol 
          name={name}
          size={size * 0.7}
          color={color}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  shadow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    transform: [{ translateY: 4 }],
  }
}); 