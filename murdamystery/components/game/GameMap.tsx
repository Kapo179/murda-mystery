import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useGame } from '@/hooks/useGame';

interface GameMapProps {
  showAllPlayers?: boolean;
}

export default function GameMap({ showAllPlayers = true }: GameMapProps) {
  const { state } = useGame();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Get the current player
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  
  // Get players to show on map
  const playersToShow = showAllPlayers 
    ? state.players.filter(p => p.isAlive && p.position)
    : currentPlayer && currentPlayer.position 
      ? [currentPlayer] 
      : [];

  if (!location) {
    return (
      <View style={styles.container}>
        {/* You can add a loading indicator here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {playersToShow.map((player) => (
          player.position && (
            <Marker
              key={player.id}
              coordinate={{
                latitude: player.position.latitude,
                longitude: player.position.longitude,
              }}
              title={player.name}
              description={`Role: ${player.role || 'Unknown'}`}
              pinColor={player.role === 'mafia' ? 'red' : player.role === 'detective' ? 'blue' : 'green'}
            />
          )
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
}); 