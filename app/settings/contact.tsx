import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, View } from '@/components/Themed';
import { SettingsPage, SettingsRow, SettingsSection } from '@/components/NativeSettings';
import { showAlert } from '@/utils/platform';
import { useTheme } from '@/context/ThemeContext';
import { systemDarkBackground } from '@/constants/theme';

const reportBugUrl = process.env.EXPO_PUBLIC_REPORT_BUG_URL ?? '';

export default function ContactScreen() {
    const { colors } = useTheme();

    const openReportBug = async () => {
        if (!reportBugUrl) {
            showAlert('Link Unavailable', 'This contact link has not been configured.');
            return;
        }

        try {
            await Linking.openURL(reportBugUrl);
        } catch (error) {
            console.error('Failed to open contact link:', error);
            showAlert('Unable to Open Link', 'Please try again later.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: systemDarkBackground }}>
            <StatusBar />
            <SettingsPage>
                <SettingsSection title="Contact" footer="Let us know when something is not working">
                    <SettingsRow
                        title="Report a Bug"
                        onPress={openReportBug}
                        isLast
                        leading={<Ionicons name="bug-outline" size={20} color="#FF453A" />}
                        trailing={<Ionicons name="open-outline" size={17} color={colors.textDim} />}
                    />
                </SettingsSection>
            </SettingsPage>
        </View>
    );
}
