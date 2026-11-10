import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { Text } from '@expo/ui';
import Constants from 'expo-constants';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { settingsIconColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const SettingsScreen = () => {
  const { colors, colorScheme } = useTheme();
  const showContact = process.env.EXPO_PUBLIC_SHOW_CONTACT === 'true';
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? 'Unknown';

  const contactList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { title: 'Contact', route: '/settings/contact', icon: 'mail-outline', color: settingsIconColors.contact },
    { title: 'Donate', route: '/settings/donate', icon: 'heart-outline', color: settingsIconColors.donate },
  ];

  const generalList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { title: 'Appearance', route: '/settings/appearance', icon: 'contrast-outline', color: settingsIconColors.appearance },
    { title: 'Language & Region', route: '/settings/preferences', icon: 'globe-outline', color: settingsIconColors.contact },
  ];

  const preferencesList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { title: 'Movie', route: '/settings/embed-movie', icon: 'film-outline', color: settingsIconColors.mediaPlayer },
    { title: 'TV', route: '/settings/embed-tv', icon: 'tv-outline', color: settingsIconColors.mediaPlayer },
  ];

  const resourcesList: { title: string; route: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { title: 'Downloads', route: '/settings/downloads', icon: 'download-outline', color: settingsIconColors.downloads },
  ];

  const onSettingsItemPress = async (route: string) => {
    if (await isHapticsSupported()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: route as never });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <SettingsPage hideScrollIndicator>
        <SettingsSection title="General">
          {generalList.map((item, index) => (
            <SettingsRow
              key={item.route}
              title={item.title}
              leading={<Ionicons name={item.icon} size={20} color={item.color} />}
              trailing={<MaterialIcons name="chevron-right" size={22} color={settingsIconColors.neutral} />}
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
                leading={<Ionicons name={item.icon} size={20} color={item.color} />}
                trailing={<MaterialIcons name="chevron-right" size={22} color={settingsIconColors.neutral} />}
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
                  leading={<Ionicons name={item.icon} size={20} color={item.color} />}
                  trailing={<MaterialIcons name="chevron-right" size={22} color={settingsIconColors.neutral} />}
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
                  leading={<Ionicons name={item.icon} size={20} color={item.color} />}
                  trailing={<MaterialIcons name="chevron-right" size={22} color={settingsIconColors.neutral} />}
                  onPress={() => onSettingsItemPress(item.route)}
                  isLast={index === contactList.length - 1}
                />
              ))}
          </SettingsSection>
        )}
        <SettingsSection title="About">
          <SettingsRow
            title="Disclaimer"
            leading={<Ionicons name="information-circle-outline" size={20} color={settingsIconColors.disclaimer} />}
            trailing={<MaterialIcons name="chevron-right" size={22} color={settingsIconColors.neutral} />}
            onPress={() => onSettingsItemPress('/settings/disclaimer')}
            isLast
          />
        </SettingsSection>
        <SettingsSection title="Version">
          <SettingsRow
            title="Version"
            trailingNative={<Text textStyle={{ color: colorScheme === 'dark' ? '#EBEBF599' : '#3C3C4399', fontSize: 13 }}>{version}</Text>}
            isLast
          />
        </SettingsSection>
      </SettingsPage>
    </>
  );
};

export default SettingsScreen;