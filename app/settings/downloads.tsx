import { StatusBar, View, Text } from '@/components/Themed';
import React from 'react';
import {
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsPage, SettingsRow, SettingsSection } from '@/components/NativeSettings';

const AppResourcesScreen = () => {
  const resources = [
    {
      id: 1,
      title: 'Google Play Store',
      subtitle: 'Download for Android Devices',
      icon: 'logo-google-playstore' as const,
      iconColor: '#34a853',
      url: 'https://play.google.com/store/apps/details?id=com.vijayyuvi.embedin',
    },
    {
      id: 2,
      title: 'Manual IPA Install',
      subtitle: 'Direct download for sideloading',
      icon: 'logo-apple' as const,
      iconColor: '#ffffff',
      url: 'https://github.com/vjdev1212/embedin/releases',
    },
    {
      id: 3,
      title: 'SideStore Source',
      subtitle: 'One-click install via SideStore',
      icon: 'cloud-download-outline' as const,
      iconColor: '#5e5ce6',
      url: 'sidestore://source?url=https://raw.githubusercontent.com/vjdev1212/embedin/refs/heads/main/sources/sidestore-source.json',
    },
    {
      id: 4,
      title: 'AltStore Source',
      subtitle: 'One-click install via AltStore',
      icon: 'cloud-download-outline' as const,
      iconColor: '#0a84ff',
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
    <View style={styles.container}>
      <StatusBar />
      <SettingsPage>
          {resources.map((resource) => (
            <SettingsSection key={resource.id} footer={`${resource.subtitle}.`}>
              <SettingsRow
                title={resource.title}
                onPress={() => handlePress(resource.url)}
                leading={<Ionicons name={resource.icon} size={20} color={resource.iconColor} />}
                trailing={<Ionicons name="open-outline" size={17} color="#8e8e93" />}
                isLast
              />
            </SettingsSection>
          ))}
      </SettingsPage>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
});

export default AppResourcesScreen;