import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { SettingsPage, SettingsRow, SettingsSection } from '@/components/NativeSettings';

const SettingsScreen = () => {
  const showContact = process.env.EXPO_PUBLIC_SHOW_CONTACT === 'true';
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version;

  const contactList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Contact', route: '/settings/contact', icon: 'mail-outline' },
    { title: 'Donate', route: '/settings/donate', icon: 'heart-outline' },
  ];

  const generalList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Language & Region', route: '/settings/preferences', icon: 'globe-outline' },
  ];

  const preferencesList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Movie', route: '/settings/embed-movie', icon: 'film-outline' },
    { title: 'TV', route: '/settings/embed-tv', icon: 'tv-outline' },
  ];

  const resourcesList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Downloads', route: '/settings/downloads', icon: 'download-outline' },
  ];

  const onSettingsItemPress = async (route: string) => {
    if (await isHapticsSupported()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: route as never });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <SettingsPage hideScrollIndicator>
        <SettingsSection title="General">
          {generalList.map((item, index) => (
            <SettingsRow
              key={item.route}
              title={item.title}
              leading={<Ionicons name={item.icon} size={20} color="#64d2ff" />}
              trailing={<MaterialIcons name="chevron-right" size={22} color="#6e6e73" />}
              onPress={() => onSettingsItemPress(item.route)}
              isLast={index === generalList.length - 1}
            />
          ))}
        </SettingsSection>
        <SettingsSection title="Embed Settings">
            {preferencesList.map((item, index) => (
              <SettingsRow
                key={item.route}
                title={item.title}
                leading={<Ionicons name={item.icon} size={20} color="#0a84ff" />}
                trailing={<MaterialIcons name="chevron-right" size={22} color="#6e6e73" />}
                onPress={() => onSettingsItemPress(item.route)}
                isLast={index === preferencesList.length - 1}
              />
            ))}
        </SettingsSection>
        {resourcesList.length > 0 && (
          <SettingsSection title="Resources">
              {resourcesList.map((item, index) => (
                <SettingsRow
                  key={item.route}
                  title={item.title}
                  leading={<Ionicons name={item.icon} size={20} color="#64d2ff" />}
                  trailing={<MaterialIcons name="chevron-right" size={22} color="#6e6e73" />}
                  onPress={() => onSettingsItemPress(item.route)}
                  isLast={index === resourcesList.length - 1}
                />
              ))}
          </SettingsSection>
        )}
        {showContact && (
          <SettingsSection title="Contact">
              {contactList.map((item, index) => (
                <SettingsRow
                  key={item.route}
                  title={item.title}
                  leading={<Ionicons name={item.icon} size={20} color="#64d2ff" />}
                  trailing={<MaterialIcons name="chevron-right" size={22} color="#6e6e73" />}
                  onPress={() => onSettingsItemPress(item.route)}
                  isLast={index === contactList.length - 1}
                />
              ))}
          </SettingsSection>
        )}
        <SettingsSection title="About">
          <SettingsRow
            title="Disclaimer"
            leading={<Ionicons name="information-circle-outline" size={20} color="#ff9f0a" />}
            trailing={<MaterialIcons name="chevron-right" size={22} color="#6e6e73" />}
            onPress={() => onSettingsItemPress('/settings/disclaimer')}
            isLast
          />
        </SettingsSection>
        <SettingsSection title="EmbedIn">
          <SettingsRow title="Version" detail={appVersion ?? 'Unknown'} isLast />
        </SettingsSection>
      </SettingsPage>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', color: '#ffffff' },
});

export default SettingsScreen;