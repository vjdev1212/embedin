import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {

  const GlassDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#0a0a0a',
      card: 'rgba(18, 18, 18, 0.9)',
      border: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const theme = GlassDarkTheme;

  const InvisibleHeaderBackground = () => (
    <View style={{ flex: 1, backgroundColor: 'transparent' }} />
  );

  const settingsScreenOptions = (title: string) => ({
    headerShown: true,
    headerTransparent: true,
    headerBackground: InvisibleHeaderBackground,
    headerTitle: title,
    title,
    headerUserInterfaceStyle: 'dark' as const,
    headerTintColor: '#ffffff',
    headerBackTitle: '',
    headerShadowVisible: true,
    headerStyle: { backgroundColor: 'transparent' },
  });
  return (
    <ThemeProvider value={theme}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#101014', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        <ActionSheetProvider>
          <Stack
            screenOptions={{
              headerUserInterfaceStyle: 'dark',
              headerTintColor: '#ffffff',
              headerBackTitle: '',
              headerTransparent: true,
              headerStyle: { backgroundColor: 'transparent' },
              headerBackground: InvisibleHeaderBackground,
              headerShadowVisible: true,
              contentStyle: styles.screenContent,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerShadowVisible: true,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                title: 'Home',
                contentStyle: styles.screenContent,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                contentStyle: styles.modalContent
              }}
            />
            <Stack.Screen
              name="movie/details"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: 'transparent',
                }
              }}
            />
            <Stack.Screen
              name="movie/list"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: 'transparent',
                }
              }}
            />
            <Stack.Screen
              name="series/details"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: 'transparent',
                }
              }}
            />
            <Stack.Screen
              name="series/list"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: 'transparent',
                }
              }}
            />
            <Stack.Screen
              name="stream/embed"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor: '#ffffff',
                headerBackTitle: '',
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: 'transparent',
                }
              }}
            />
            <Stack.Screen name="settings/embed-movie" options={settingsScreenOptions('Movie Embed')} />
            <Stack.Screen name="settings/embed-tv" options={settingsScreenOptions('TV Embed')} />
            <Stack.Screen name="settings/preferences" options={settingsScreenOptions('Language & Region')} />
            <Stack.Screen name="settings/downloads" options={settingsScreenOptions('Downloads')} />
            <Stack.Screen name="settings/contact" options={settingsScreenOptions('Contact')} />
            <Stack.Screen name="settings/donate" options={settingsScreenOptions('Support Embedin')} />
            <Stack.Screen name="settings/disclaimer" options={settingsScreenOptions('Disclaimer')} />
          </Stack>
        </ActionSheetProvider>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFill,
  },
  screenContent: { backgroundColor: '#000000' },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
});

// Enhanced global glass styles for use in other components
export const globalGlassStyles = StyleSheet.create({
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  glassOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
  },
  glassText: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});