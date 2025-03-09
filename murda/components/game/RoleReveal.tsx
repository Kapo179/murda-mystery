import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, Image, TextStyle } from 'react-native';
import { Typography } from '../Typography';
import type { GameRole } from '@/components/game/views/GameView'

// Import role emojis
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');

interface RoleRevealProps {
  role: GameRole;
  onComplete: () => void;
}

export function RoleReveal({ role, onComplete }: RoleRevealProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const iconScaleAnim = React.useRef(new Animated.Value(0)).current;
  
  // Move this ref to the component body
  const initialRoleRef = React.useRef(role);

  useEffect(() => {
    console.log('RoleReveal mounted with role:', role);
    
    // Now we can safely access the ref value
    const initialRole = initialRoleRef.current;
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('Animation sequence complete with role:', initialRole);
      onComplete();
    });
  }, []);

  const getRoleColor = () => {
    switch (role) {
      case 'mafia':
        return '#FF3131';
      case 'detective':
        return '#4B9EF4';
      default:
        return '#32D74B';
    }
  };

  const getRoleEmoji = () => {
    switch (role) {
      case 'mafia':
        return ninjaEmoji;
      case 'detective':
        return detectiveEmoji;
      default:
        return faceEmoji;
    }
  };

  const titleStyle: TextStyle = {
    ...styles.text,
    color: getRoleColor(),
  };

  const roleTextStyle: TextStyle = {
    ...styles.roleText,
    color: getRoleColor(),
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Typography 
          variant="title" 
          style={titleStyle}
        >
          You are
        </Typography>
        <View style={styles.roleContainer}>
          <Typography 
            variant="title" 
            style={roleTextStyle}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Typography>
          <Animated.Image 
            source={getRoleEmoji()} 
            style={[
              styles.roleIcon,
              {
                transform: [{ scale: iconScaleAnim }],
              },
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  roleText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
    letterSpacing: 0.5,
  } as TextStyle,
  roleIcon: {
    width: 40,
    height: 40,
  },
}); 