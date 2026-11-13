import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform, View, StyleSheet } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { useTheme } from '@/context/ThemeContext';
import { initializeUserInterfaceStyle } from '@/utils/UserInterfaceStyle';

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
  const { colors, colorScheme } = useTheme();
  const pathname = usePathname();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.primaryCard,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
  const headerTintColor = colorScheme === 'dark' ? '#ffffff' : '#000000';
  const screenContentStyle = { backgroundColor: colors.background };

  useEffect(() => {
    void initializeUserInterfaceStyle().catch((error: unknown) => {
      console.error('Failed to initialize appearance preference:', error);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const orientationLock = pathname === '/stream/embed'
      ? ScreenOrientation.OrientationLock.DEFAULT
      : ScreenOrientation.OrientationLock.PORTRAIT_UP;

    ScreenOrientation.lockAsync(orientationLock).catch((error: unknown) => {
      console.warn('Failed to update screen orientation:', error);
    });
  }, [pathname]);

  const InvisibleHeaderBackground = () => (
    <View style={{ flex: 1, backgroundColor: 'transparent' }} />
  );

  const settingsScreenOptions = (title: string) => ({
    headerShown: true,
    headerTransparent: true,
    headerBackground: InvisibleHeaderBackground,
    headerTitle: title,
    title,
    headerUserInterfaceStyle: colorScheme,
    headerTintColor,
    headerBackTitle: '',
    headerShadowVisible: true,
    headerStyle: { backgroundColor: 'transparent' },
  });
  return (
    <ThemeProvider value={navigationTheme}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActionSheetProvider>
          <Stack
            screenOptions={{
              headerUserInterfaceStyle: colorScheme,
              headerTintColor,
              headerBackTitle: '',
              headerTransparent: true,
              headerStyle: { backgroundColor: 'transparent' },
              headerBackground: InvisibleHeaderBackground,
              headerShadowVisible: true,
              contentStyle: screenContentStyle,
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
                headerTintColor,
                headerBackTitle: '',
                title: 'Home',
                contentStyle: screenContentStyle,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                contentStyle: [styles.modalContent, { backgroundColor: colors.background }]
              }}
            />
            <Stack.Screen
              name="movie/details"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor,
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="movie/list"
              options={{
                headerShown: true,
                headerTransparent: false,
                headerTitle: '',
                headerTintColor,
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="series/details"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor,
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
                headerTransparent: false,
                headerBackground: InvisibleHeaderBackground,
                headerTitle: '',
                headerTintColor,
                headerBackTitle: '',
                headerShadowVisible: false,
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
                headerUserInterfaceStyle: 'dark',
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
            <Stack.Screen name="settings/appearance" options={settingsScreenOptions('Appearance')} />
            <Stack.Screen name="settings/home" options={settingsScreenOptions('Home Screen')} />
            <Stack.Screen
              name="settings/home-editor"
              options={{ ...settingsScreenOptions('Add List'), presentation: 'card' }}
            />
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
  },
  modalContent: {
    flex: 1,
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