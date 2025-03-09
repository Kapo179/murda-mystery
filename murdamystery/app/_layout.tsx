import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from '@/components/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync().catch(() => {
  // If this fails, the app will still work but splash screen may
  // flicker on app startup
  console.warn('Error preventing splash screen auto hide');
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts and other assets here
        // Example: 
        await Font.loadAsync({
          // Add your custom fonts here
          // 'YourFontName': require('../assets/fonts/your-font.ttf'),
        });
        
        // Load any other resources you need
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error loading app resources:', e);
      } finally {
        // Resources are loaded, app is ready
        setAppIsReady(true);
      }
    }
    
    prepare();
  }, []);
  
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen once the app is ready
      await SplashScreen.hideAsync().catch(e => {
        console.warn('Error hiding splash screen:', e);
      });
    }
  }, [appIsReady]);
  
  // Handle the final loading completion
  const handleFinishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  if (!appIsReady) {
    return null; // SplashScreen is still visible
  }
  
  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <SafeAreaProvider>
          {isLoading ? (
            <LoadingScreen onFinishLoading={handleFinishLoading} />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            />
          )}
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

