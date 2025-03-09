import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapViewWithGameCard } from '@/components/game/views/MapViewWithGameCard';
import { GameInstructionsModal } from '@/components/modals/GameInstructionsModal';
import { GameSetupSheet } from '@/components/sheets/GameSetupSheet';
import { CoinInfoModal } from '@/components/modals/CoinInfoModal';

export default function HomeScreen() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCoinInfo, setShowCoinInfo] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <MapViewWithGameCard 
        onOpenInstructions={() => setShowInstructions(true)}
        onOpenCoinInfo={() => setShowCoinInfo(true)}
      />
      
      {/* Keep the modals */}
      <GameInstructionsModal 
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        onStartSetup={() => {
          setShowInstructions(false);
          setShowSetup(true);
        }}
      />

      <GameSetupSheet 
        visible={showSetup}
        onClose={() => setShowSetup(false)}
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
    backgroundColor: '#000000',
  },
}); 