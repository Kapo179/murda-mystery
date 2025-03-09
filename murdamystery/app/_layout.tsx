import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from '@/components/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Add real resource loading here (fonts, assets, etc.)
        // Example: await Font.loadAsync({ ... });
        
        // Simulate some loading time
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        
        // Now we can hide the splash screen
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);
  
  // Once resources are ready, show our custom loading screen
  if (!appIsReady) {
    return null; // SplashScreen is still visible
  }
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <SafeAreaProvider>
          {isLoading ? (
            <LoadingScreen onFinishLoading={() => setIsLoading(false)} />
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

