import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Mapbox from '@rnmapbox/maps';
import { useLocation } from '@/hooks/useLocation';
import { MAPBOX_ACCESS_TOKEN } from '@env';
import Constants from 'expo-constants';
import { Typography } from '@/components/Typography';

// Custom dark theme style URL - you can create your own style in Mapbox Studio
const CUSTOM_STYLE_URL = 'mapbox://styles/kapo179/custom-dark-style';

interface MapViewProps {
  showAllPlayers?: boolean;
  showLastMafiaLocation?: boolean;
  showNearbyPlayers?: boolean;
}

export function CustomMapView(props: MapViewProps) {
  const { latitude, longitude, error, isLoading } = useLocation();
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const isExpoGo = Constants.appOwnership === 'expo';

  // Use the token from env
  useEffect(() => {
    try {
      if (MAPBOX_ACCESS_TOKEN) {
        console.log("Setting Mapbox access token");
        Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
      } else {
        console.error("Mapbox token is undefined");
      }
    } catch (err) {
      console.error('Error initializing Mapbox:', err);
    }
  }, []);

  // Only set dimensions when we have valid numbers
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setMapDimensions({ width, height });
    }
  };

  if (isExpoGo) {
    return (
      <View style={styles.placeholderContainer}>
        <Typography style={styles.placeholderText}>
          Map Preview (Only available in development builds)
        </Typography>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {mapDimensions.width > 0 && mapDimensions.height > 0 && (
        <>
          <Mapbox.MapView
            style={{
              width: mapDimensions.width,
              height: mapDimensions.height,
            }}
            styleURL={Mapbox.StyleURL.Dark}
            zoomEnabled
            scrollEnabled
            rotateEnabled={false}
            attributionEnabled={false}
            logoEnabled={false}
            compassEnabled={false}
            scaleBarEnabled={false}
          >
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={[longitude || -122.4324, latitude || 37.78825]}
              animationMode="flyTo"
              animationDuration={2000}
            />
            
            <Mapbox.UserLocation
              visible
              animated
            />

            {/* Custom location marker */}
            {latitude && longitude && (
              <Mapbox.PointAnnotation
                id="userLocation"
                coordinate={[longitude, latitude]}
              >
                <View style={styles.locationMarker} />
              </Mapbox.PointAnnotation>
            )}
          </Mapbox.MapView>
          
          {/* Add a top gradient overlay for smooth transition */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.3)', 'transparent']}
            style={styles.topGradient}
            pointerEvents="none"
          />
          
          {/* Keep existing bottom gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 10,
    marginBottom: 0,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 1,
  },
  locationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3131',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  errorText: {
    color: '#FF3131',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 3,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 3,
  },
}); 