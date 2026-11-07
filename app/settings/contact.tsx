import { StatusBar, View } from '@vjdev1212/media-ui-kit';
import { SettingsPage, SettingsTitle } from '@vjdev1212/media-ui-kit';
import { systemDarkBackground } from '@/constants/theme';

export default function ContactScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: systemDarkBackground }}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle title="Get in Touch" subtitle="Let us know how we can help." />
            </SettingsPage>
        </View>
    );
}
