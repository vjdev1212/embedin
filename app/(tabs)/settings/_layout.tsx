import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsLayout() {
  const { colors, colorScheme } = useTheme();
  const isIOS = Platform.OS === 'ios';
  const TransparentHeaderBackground = () => (
    <View style={{ flex: 1, backgroundColor: 'transparent' }} />
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTransparent: isIOS,
        headerBackground: TransparentHeaderBackground,
        headerUserInterfaceStyle: colorScheme,
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        headerShadowVisible: true,
        headerStyle: { backgroundColor: isIOS ? 'transparent' : colors.background },
        headerLargeTitleEnabled: isIOS,
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerLargeTitleShadowVisible: true,
        headerBlurEffect: 'none',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
