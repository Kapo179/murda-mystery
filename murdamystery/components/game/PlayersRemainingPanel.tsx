import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';

interface PlayersRemainingPanelProps {
  totalPlayers: number;
  alivePlayers: number;
  hunterCount: number;
  timeRemaining?: string;
  isCompact?: boolean;
}

export function PlayersRemainingPanel({
  totalPlayers,
  alivePlayers,
  hunterCount,
  timeRemaining,
  isCompact = false,
}: PlayersRemainingPanelProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Calculate eliminated players
  const eliminatedPlayers = totalPlayers - alivePlayers - hunterCount;
  
  // Get appropriate text colors
  const getTextColor = () => isDark ? '#FFFFFF' : '#000000';
  const getSubtextColor = () => isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  
  // Get background colors based on theme
  const getBackgroundColors = () => {
    return isDark 
      ? ['#2c2c2e', '#1c1c1e'] 
      : ['#ffffff', '#f2f2f7'];
  };
  
  // Compact view renders a single row with minimal info
  if (isCompact) {
    return (
      <View style={[
        styles.compactContainer, 
        { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }
      ]}>
        <View style={styles.compactRow}>
          <View style={styles.compactPlayerCount}>
            <FontAwesome5 name="user" size={12} solid color="#34C759" />
            <Text style={[styles.compactCountText, { color: '#34C759' }]}>
              {alivePlayers}
            </Text>
          </View>
          
          <View style={styles.compactPlayerCount}>
            <FontAwesome5 name="skull" size={12} solid color="#FF3B30" />
            <Text style={[styles.compactCountText, { color: '#FF3B30' }]}>
              {hunterCount}
            </Text>
          </View>
          
          {timeRemaining && (
            <View style={styles.compactPlayerCount}>
              <FontAwesome5 name="clock" size={12} solid color={getTextColor()} />
              <Text style={[styles.compactCountText, { color: getTextColor() }]}>
                {timeRemaining}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
  
  // Full view with all player counts and time
  return (
    <LinearGradient
      colors={getBackgroundColors()}
      style={styles.container}
    >
      <View style={styles.playerCounts}>
        <View style={styles.countColumn}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="user" size={16} solid color="#34C759" />
          </View>
          <Text style={[styles.countText, { color: getTextColor() }]}>
            {alivePlayers}
          </Text>
          <Text style={[styles.labelText, { color: getSubtextColor() }]}>
            Alive
          </Text>
        </View>
        
        <View style={styles.countColumn}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="skull" size={16} solid color="#FF3B30" />
          </View>
          <Text style={[styles.countText, { color: getTextColor() }]}>
            {hunterCount}
          </Text>
          <Text style={[styles.labelText, { color: getSubtextColor() }]}>
            Hunters
          </Text>
        </View>
        
        <View style={styles.countColumn}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="ghost" size={16} solid color="#8E8E93" />
          </View>
          <Text style={[styles.countText, { color: getTextColor() }]}>
            {eliminatedPlayers}
          </Text>
          <Text style={[styles.labelText, { color: getSubtextColor() }]}>
            Eliminated
          </Text>
        </View>
      </View>
      
      {timeRemaining && (
        <View style={styles.timerContainer}>
          <FontAwesome5 name="clock" size={14} solid color={getSubtextColor()} />
          <Text style={[styles.timerText, { color: getTextColor() }]}>
            {timeRemaining}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: timeRemaining => timeRemaining ? 12 : 0,
  },
  countColumn: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 12,
    marginTop: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Compact styles
  compactContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactPlayerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCountText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 