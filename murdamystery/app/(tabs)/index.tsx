import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapViewWithGameCard } from '@/components/game/views/MapViewWithGameCard';
import { GameInstructionsModal } from '@/components/modals/GameInstructionsModal';
import { GameSetupSheet } from '@/components/sheets/GameSetupSheet';
import { CoinInfoModal } from '@/components/modals/CoinInfoModal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TokenDisplay } from '@/components/tokens/TokenDisplay';

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
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header with Play text and Token Display */}
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
          onPress={() => setShowCoinInfo(true)}
          activeOpacity={0.7}
        >
          <TokenDisplay 
            compact={true} 
            showButtons={false}
            onTokensChanged={setTokenBalance}
          />
        </TouchableOpacity>
      </View>
      
      <MapViewWithGameCard 
        onOpenInstructions={() => {
          console.log('Opening instructions modal from ! button');
          setShowInstructions(true);
        }}
        onOpenCoinInfo={() => setShowCoinInfo(true)}
        onPlay={() => {
          console.log("Play button pressed, opening game setup sheet");
          setShowSetup(true);
        }}
        theme={theme}
        colorScheme={colorScheme}
      />
      
      {/* Full token display section */}
      <View style={styles.tokenSection}>
        <TokenDisplay 
          showButtons={true}
          onTokensChanged={setTokenBalance}
        />
      </View>
      
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
  tokenSection: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
}); 