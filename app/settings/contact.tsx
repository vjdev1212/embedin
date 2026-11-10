import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, View } from '@vjdev1212/media-ui-kit';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { showAlert } from '@/utils/platform';
import { useTheme } from '@/context/ThemeContext';
import { settingsIconColors } from '@/constants/theme';

const reportBugUrl = process.env.EXPO_PUBLIC_REPORT_BUG_URL ?? '';

export default function ContactScreen() {
  const { colors } = useTheme();

  const reportBug = async () => {
    if (!reportBugUrl) {
      showAlert('Link Unavailable', 'The bug report link has not been configured.');
      return;
    }

    try {
      await Linking.openURL(reportBugUrl);
    } catch (error) {
      console.error('Failed to open bug report link:', error);
      showAlert('Unable to Open Link', 'Please try again later.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar />
      <SettingsPage>
        <SettingsSection title="Contact" footer="Let us know when something is not working.">
          <SettingsRow
            title="Report a Bug"
            onPress={reportBug}
            isLast
            leading={<Ionicons name="bug-outline" size={20} color={settingsIconColors.contact} />}
            trailing={<Ionicons name="open-outline" size={17} color={colors.textDim} />}
          />
        </SettingsSection>
      </SettingsPage>
    </View>
  );
}
