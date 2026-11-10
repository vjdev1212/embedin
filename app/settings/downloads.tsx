import { StatusBar, View, Text } from '@vjdev1212/media-ui-kit';
import React from 'react';
import {
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { settingsIconColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const AppResourcesScreen = () => {
  const { colors } = useTheme();
  const resources = [
    {
      id: 1,
      title: 'Google Play Store',
      subtitle: 'Download for Android Devices',
      icon: 'logo-google-playstore' as const,
      iconColor: settingsIconColors.googlePlay,
      url: 'https://play.google.com/store/apps/details?id=com.vijayyuvi.embedin',
    },
    {
      id: 2,
      title: 'Manual IPA Install',
      subtitle: 'Direct download for sideloading',
      icon: 'logo-apple' as const,
      iconColor: settingsIconColors.apple,
      url: 'https://github.com/vjdev1212/embedin/releases',
    },
    {
      id: 3,
      title: 'SideStore Source',
      subtitle: 'One-click install via SideStore',
      icon: 'cloud-download-outline' as const,
      iconColor: settingsIconColors.sideStore,
      url: 'sidestore://source?url=https://raw.githubusercontent.com/vjdev1212/embedin/refs/heads/main/sources/sidestore-source.json',
    },
    {
      id: 4,
      title: 'AltStore Source',
      subtitle: 'One-click install via AltStore',
      icon: 'cloud-download-outline' as const,
      iconColor: settingsIconColors.altStore,
      url: 'altstore://source?url=https://raw.githubusercontent.com/vjdev1212/embedin/refs/heads/main/sources/sidestore-source.json',
    },
  ];

  const handlePress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />
      <SettingsPage>
          {resources.map((resource) => (
            <SettingsSection key={resource.id} footer={`${resource.subtitle}.`}>
              <SettingsRow
                title={resource.title}
                onPress={() => handlePress(resource.url)}
                leading={<Ionicons name={resource.icon} size={20} color={resource.iconColor} />}
                trailing={<Ionicons name="open-outline" size={17} color={settingsIconColors.neutral} />}
                isLast
              />
            </SettingsSection>
          ))}
      </SettingsPage>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default AppResourcesScreen;