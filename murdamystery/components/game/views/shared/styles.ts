import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface SharedStyles {
  container: ViewStyle;
  header: ViewStyle;
  roleText: TextStyle;
  playerCount: TextStyle;
  actions: ViewStyle;
  actionButton: ViewStyle;
  emergencyButton: ViewStyle;
  emergencyCounter: ViewStyle;
  emergencyCounterText: TextStyle;
  actionIcon: ImageStyle;
  actionText: TextStyle;
}

export const sharedStyles = StyleSheet.create<SharedStyles>({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  playerCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
    marginBottom: 15,
    zIndex: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 49, 49, 0.9)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  emergencyCounterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
}); 