import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LinearGradient } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from '../styles/styles';

const HomeScreen = () => {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  return (
    <View style={styles.container}>
      {/* Add a new game mode card for Last Man Standing */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}
        onPress={() => router.push('/last-man-standing-setup')}
      >
        <LinearGradient
          colors={['#FF3B30', '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardIconContainer}
        >
          <FontAwesome5 name="running" size={24} color="#FFFFFF" />
        </LinearGradient>
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
            Last Man Standing
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#adadad' : '#8e8e93' }]}>
            Tag game mode. Hunters vs. Survivors in real-world location-based gameplay.
          </Text>
        </View>
        
        <FontAwesome5 
          name="chevron-right" 
          size={16} 
          color={isDark ? '#adadad' : '#8e8e93'} 
          style={styles.cardArrow}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen; 