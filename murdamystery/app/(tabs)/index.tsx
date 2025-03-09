import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapViewWithGameCard } from '@/components/game/views/MapViewWithGameCard';
import { GameInstructionsModal } from '@/components/modals/GameInstructionsModal';
import { GameSetupSheet } from '@/components/sheets/GameSetupSheet';
import { CoinInfoModal } from '@/components/modals/CoinInfoModal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Define theme constants based on the design documentation
const theme = {
  borderRadius: 16,
  typography: {
    headerSize: 17,
    subheaderSize: 13,
  },
  colors: {
    gradientStart: '#EA3B7F',
    gradientEnd: '#EB5F5A',
    infoTagBackground: '#2F2E33',
    enabledStatus: '#4CFF00',
    disabledStatus: '#FFB700',
    coinBackground: '#AFAFAF',
  }
};

export default function HomeScreen() {
  // Get the user's preferred color scheme
  const colorScheme = useColorScheme() ?? 'dark';
  
  // Set theme colors based on color scheme
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#F3F3F3';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  
  // Import the coin emoji asset
  const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  
  // Mock coin count - this would come from your state management
  const coinCount = 3;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header with Play text and Coin Counter */}
      <View style={styles.header}>
        <Text style={[
          styles.headerText, 
          { 
            color: textColor,
            fontSize: theme.typography.headerSize 
          }
        ]}>
          Play
        </Text>
        
        <TouchableOpacity 
          style={styles.coinCounter}
          onPress={() => setShowCoinInfo(true)}
        >
          <Text style={styles.coinCountText}>{coinCount}</Text>
          <Image 
            source={coinEmoji} 
            style={styles.coinImage} 
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      
      <MapViewWithGameCard 
        onOpenInstructions={() => {
          console.log('Opening instructions modal from ! button');
          setShowInstructions(true);
        }}
        onOpenCoinInfo={() => setShowCoinInfo(true)}
        onPlay={() => console.log("Play button pressed")}
        theme={theme}
        colorScheme={colorScheme}
      />
      
      {/* Keep the modals */}
      <GameInstructionsModal 
        visible={showInstructions}
        onClose={() => {
          console.log('Closing instructions modal');
          setShowInstructions(false);
        }}
        onStartSetup={() => {
          console.log('Starting game setup from instructions modal');
          setShowInstructions(false);
          // Small delay to ensure the instructions modal is fully closed
          setTimeout(() => {
            setShowSetup(true);
          }, 100);
        }}
      />

      <GameSetupSheet 
        visible={showSetup}
        onClose={() => {
          console.log('Closing game setup sheet');
          setShowSetup(false);
        }}
      />

      <CoinInfoModal 
        visible={showCoinInfo}
        onClose={() => setShowCoinInfo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60, // Adjusted for the status bar and safe area
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: '500', // Medium weight
    // Using SF Pro Display on iOS by default, will fall back to system font
  },
  coinCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 46, 51, 0.8)', // #2F2E33 with opacity
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinCountText: {
    color: '#FFFFFF',
    fontSize: theme.typography.subheaderSize,
    fontWeight: '500', // Medium
    marginRight: 8,
  },
  coinImage: {
    width: 28,
    height: 28,
  },
}); 