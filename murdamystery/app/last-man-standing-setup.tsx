import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';

export default function LastManStandingSetup() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Game settings
  const [gameCode, setGameCode] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(8);
  const [hunterCount, setHunterCount] = useState(2);
  const [gameLength, setGameLength] = useState(30); // minutes
  const [tagDistance, setTagDistance] = useState(15); // meters
  const [warningDistance, setWarningDistance] = useState(50); // meters
  
  // Create a new game
  const handleCreateGame = async () => {
    // Check location permissions first
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'This game requires location access to function properly.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Start loading animation
    setIsCreatingGame(true);
    setIsHost(true);
    
    try {
      // In a real app, you'd send these settings to your backend
      // and get a game code in response
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random 6-letter game code
      const randomCode = Array(6)
        .fill(0)
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        .join('');
      
      setGameCode(randomCode);
      
      // Navigate to the game with host/hunter role
      router.push({
        pathname: '/last-man-standing',
        params: {
          gameId: randomCode,
          playerRole: 'hunter',
        }
      });
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };
  
  // Join an existing game
  const handleJoinGame = async () => {
    if (!gameCode || gameCode.length < 4) {
      Alert.alert('Invalid Code', 'Please enter a valid game code');
      return;
    }
    
    // Check location permissions first
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'This game requires location access to function properly.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Start loading animation
    setIsJoiningGame(true);
    setIsHost(false);
    
    try {
      // In a real app, you'd validate this game code with your backend
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to the game with participant/alive role
      router.push({
        pathname: '/last-man-standing',
        params: {
          gameId: gameCode.toUpperCase(),
          playerRole: 'alive',
        }
      });
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game. Please check your game code and try again.');
    } finally {
      setIsJoiningGame(false);
    }
  };
  
  // Go back to home screen
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? '#ffffff' : '#000000'} 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: isDark ? '#ffffff' : '#000000' }
        ]}>
          Last Man Standing
        </Text>
        
        <View style={styles.backButton} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Type Banner */}
        <LinearGradient
          colors={['#FF3B30', '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gameTypeBanner}
        >
          <FontAwesome5 name="running" size={20} color="#FFFFFF" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>Tag Game Mode</Text>
        </LinearGradient>
        
        {/* Game Description */}
        <Text style={[
          styles.description,
          { color: isDark ? '#adadad' : '#8e8e93' }
        ]}>
          Hunters try to tag survivors before time runs out. Survivors must evade hunters to win!
        </Text>
        
        {/* Join Game Section */}
        <View style={[
          styles.sectionContainer, 
          { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#000000' }
          ]}>
            Join an Existing Game
          </Text>
          
          <View style={styles.codeInputContainer}>
            <Text style={[
              styles.codeLabel,
              { color: isDark ? '#adadad' : '#8e8e93' }
            ]}>
              GAME CODE
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.codeInput,
                { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
              ]}
              onPress={() => {
                Alert.prompt(
                  'Enter Game Code',
                  'Enter the 6-letter code provided by the host',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: (code) => code && setGameCode(code.toUpperCase()),
                    },
                  ],
                  'plain-text',
                  gameCode,
                  'uppercase'
                );
              }}
            >
              <Text style={[
                styles.codeText,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                {gameCode || 'Tap to enter code'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              { opacity: isJoiningGame ? 0.7 : 1 }
            ]}
            onPress={handleJoinGame}
            disabled={isJoiningGame}
          >
            <LinearGradient
              colors={['#4CD964', '#34C759']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isJoiningGame ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome5 name="sign-in-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Join Game</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Create Game Section */}
        <View style={[
          styles.sectionContainer, 
          { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#000000' }
          ]}>
            Create a New Game
          </Text>
          
          {/* Game Settings */}
          <View style={styles.settingsContainer}>
            {/* Player Count */}
            <View style={styles.settingRow}>
              <Text style={[
                styles.settingLabel,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Player Count
              </Text>
              
              <View style={styles.settingValue}>
                <Text style={[
                  styles.settingValueText,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {playerCount}
                </Text>
                
                <View style={styles.settingControls}>
                  <TouchableOpacity 
                    style={[
                      styles.controlButton,
                      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
                    ]}
                    onPress={() => setPlayerCount(Math.max(4, playerCount - 1))}
                  >
                    <FontAwesome5 name="minus" size={12} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.controlButton,
                      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
                    ]}
                    onPress={() => setPlayerCount(Math.min(16, playerCount + 1))}
                  >
                    <FontAwesome5 name="plus" size={12} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Hunter Count */}
            <View style={styles.settingRow}>
              <Text style={[
                styles.settingLabel,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Hunter Count
              </Text>
              
              <View style={styles.settingValue}>
                <Text style={[
                  styles.settingValueText,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {hunterCount}
                </Text>
                
                <View style={styles.settingControls}>
                  <TouchableOpacity 
                    style={[
                      styles.controlButton,
                      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
                    ]}
                    onPress={() => setHunterCount(Math.max(1, hunterCount - 1))}
                  >
                    <FontAwesome5 name="minus" size={12} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.controlButton,
                      { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }
                    ]}
                    onPress={() => setHunterCount(Math.min(Math.floor(playerCount / 2), hunterCount + 1))}
                  >
                    <FontAwesome5 name="plus" size={12} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Game Length */}
            <View style={styles.settingRow}>
              <Text style={[
                styles.settingLabel,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Game Length
              </Text>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={60}
                  step={5}
                  value={gameLength}
                  onValueChange={setGameLength}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor={isDark ? '#4c4c4c' : '#c7c7cc'}
                  thumbTintColor="#007AFF"
                />
                
                <Text style={[
                  styles.sliderValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {gameLength} min
                </Text>
              </View>
            </View>
            
            {/* Tag Distance */}
            <View style={styles.settingRow}>
              <Text style={[
                styles.settingLabel,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Tag Distance
              </Text>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={30}
                  step={5}
                  value={tagDistance}
                  onValueChange={setTagDistance}
                  minimumTrackTintColor="#FF3B30"
                  maximumTrackTintColor={isDark ? '#4c4c4c' : '#c7c7cc'}
                  thumbTintColor="#FF3B30"
                />
                
                <Text style={[
                  styles.sliderValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {tagDistance}m
                </Text>
              </View>
            </View>
            
            {/* Warning Distance */}
            <View style={styles.settingRow}>
              <Text style={[
                styles.settingLabel,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Warning Distance
              </Text>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={100}
                  step={10}
                  value={warningDistance}
                  onValueChange={setWarningDistance}
                  minimumTrackTintColor="#FFCC00"
                  maximumTrackTintColor={isDark ? '#4c4c4c' : '#c7c7cc'}
                  thumbTintColor="#FFCC00"
                />
                
                <Text style={[
                  styles.sliderValue,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {warningDistance}m
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              { opacity: isCreatingGame ? 0.7 : 1 }
            ]}
            onPress={handleCreateGame}
            disabled={isCreatingGame}
          >
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isCreatingGame ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome5 name="plus" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Create Game</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  gameTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  codeInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  actionButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  settingControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 60,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '500',
  },
}); 