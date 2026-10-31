import { StatusBar, View } from '@/components/Themed';
import { SettingsPage, SettingsTitle } from '@/components/NativeSettings';
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
