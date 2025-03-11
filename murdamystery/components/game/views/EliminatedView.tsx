import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CustomMapView } from '@/components/game/MapView';
import { PlayersRemainingPanel } from '@/components/game/PlayersRemainingPanel';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EliminatedViewProps {
  players: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    position?: { latitude: number; longitude: number };
  }[];
  totalPlayers: number;
  gameTimeRemaining?: string;
}

export function EliminatedView({ 
  players, 
  totalPlayers,
  gameTimeRemaining,
}: EliminatedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [expandedMap, setExpandedMap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Count alive players and hunters
  const aliveCount = players.filter(p => p.role === 'alive' && p.isAlive).length;
  const hunterCount = players.filter(p => p.role === 'hunter').length;
  const eliminatedCount = players.filter(p => !p.isAlive).length;
  
  return (
    <View style={styles.container}>
      <PlayersRemainingPanel
        totalPlayers={totalPlayers}
        alivePlayers={aliveCount}
        hunterCount={hunterCount}
        timeRemaining={gameTimeRemaining}
      />
      
      <LinearGradient
        colors={isDark ? ['#2c2c2e', '#1c1c1e'] : ['#f2f2f7', '#e5e5ea']}
        style={styles.eliminatedBanner}
      >
        <FontAwesome5 name="ghost" size={24} color={isDark ? '#FF3B30' : '#FF3B30'} />
        <Text style={[
          styles.eliminatedText,
          { color: isDark ? '#FF3B30' : '#FF3B30' }
        ]}>
          YOU WERE ELIMINATED
        </Text>
      </LinearGradient>
      
      <View style={[styles.mapContainer, expandedMap && styles.expandedMap]}>
        <CustomMapView 
          showAllPlayers={true} 
          showHunterView={true}
          showSpectatorView={true}
        />
        
        <TouchableOpacity
          style={[
            styles.mapToggleButton,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }
          ]}
          onPress={() => setExpandedMap(!expandedMap)}
        >
          <Ionicons 
            name={expandedMap ? 'contract' : 'expand'} 
            size={24} 
            color={isDark ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.statsButton,
          { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }
        ]}
        onPress={() => setShowStats(!showStats)}
      >
        <FontAwesome5 
          name={showStats ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={isDark ? '#ffffff' : '#000000'} 
          style={styles.statsIcon}
        />
        <Text style={[
          styles.statsButtonText,
          { color: isDark ? '#ffffff' : '#000000' }
        ]}>
          {showStats ? 'Hide Spectator Stats' : 'Show Spectator Stats'}
        </Text>
      </TouchableOpacity>
      
      {showStats && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[
            styles.statsContainer,
            { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                {aliveCount}
              </Text>
              <Text style={[
                styles.statLabel,
                { color: isDark ? '#adadad' : '#8e8e93' }
              ]}>
                Still Alive
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                {hunterCount}
              </Text>
              <Text style={[
                styles.statLabel,
                { color: isDark ? '#adadad' : '#8e8e93' }
              ]}>
                Hunters
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                {eliminatedCount}
              </Text>
              <Text style={[
                styles.statLabel,
                { color: isDark ? '#adadad' : '#8e8e93' }
              ]}>
                Eliminated
              </Text>
            </View>
          </View>
          
          <View style={styles.leaderboardContainer}>
            <Text style={[
              styles.leaderboardTitle,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              LEADERBOARD
            </Text>
            
            {/* Player rankings - in a real app, you'd sort by performance */}
            {players
              .filter(player => player.role === 'hunter')
              .map((player, index) => (
                <View key={player.id} style={styles.playerRank}>
                  <Text style={[
                    styles.rankNumber,
                    { color: isDark ? '#adadad' : '#8e8e93' }
                  ]}>
                    {index + 1}.
                  </Text>
                  <Text style={[
                    styles.playerName,
                    { color: isDark ? '#ffffff' : '#000000' }
                  ]}>
                    {player.name}
                  </Text>
                  <Text style={[
                    styles.playerScore,
                    { color: isDark ? '#adadad' : '#8e8e93' }
                  ]}>
                    {/* In a real app, you'd calculate scores */}
                    {Math.floor(Math.random() * 5)} tags
                  </Text>
                </View>
              ))}
          </View>
        </Animated.View>
      )}
      
      <Text style={[
        styles.spectatorText,
        { color: isDark ? '#adadad' : '#8e8e93' }
      ]}>
        You're now in spectator mode. You can watch the game unfold but can't interact with players.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eliminatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  eliminatedText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  expandedMap: {
    flex: 1,
  },
  mapToggleButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statsIcon: {
    marginRight: 8,
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  leaderboardContainer: {
    marginTop: 8,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  playerRank: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
  },
  rankNumber: {
    width: 30,
    fontSize: 16,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
  },
  playerScore: {
    fontSize: 16,
  },
  spectatorText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 20,
  },
}); 