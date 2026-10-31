import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { View, StatusBar } from '@/components/Themed';
import { isHapticsSupported } from '@/utils/platform';
import { SettingsPage, SettingsRow, SettingsSection, SettingsTitle } from '@/components/NativeSettings';

type IconLibrary = 'AntDesign' | 'Ionicons';

interface ContactItem {
    type: string;
    value: string;
    icon: string;
    iconLibrary: IconLibrary;
    action: () => Promise<void>;
}

const ContactScreen = () => {
    const feedbackUrl = process.env.EXPO_PUBLIC_FEEDBACK_URL || '';
    const reportBugUrl = process.env.EXPO_PUBLIC_REPORT_BUG_URL || '';
    
    const contactInfo: ContactItem[] = [
        {
            type: 'Feedback',
            value: 'Submit your feedback',
            icon: 'form',
            iconLibrary: 'AntDesign',
            action: async () => {
                if (await isHapticsSupported()) {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                await Linking.openURL(feedbackUrl);
            },
        },
        {
            type: 'Report Bug',
            value: 'Found a Bug? Report here',
            icon: 'bug-outline',
            iconLibrary: 'Ionicons',
            action: async () => {
                if (await isHapticsSupported()) {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                await Linking.openURL(reportBugUrl);
            },
        }        
    ];

    return (
        <View style={styles.container}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle title="Get in Touch" subtitle="Your input makes the app better." />
                <SettingsSection title="Contact">
                    {contactInfo.map((item, index) => (
                        <SettingsRow
                            key={item.type}
                            title={item.type}
                            detail={item.value}
                            onPress={item.action}
                            leading={<Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color="#0a84ff" />}
                            trailing={<Ionicons name="open-outline" size={17} color="#8e8e93" />}
                            isLast={index === contactInfo.length - 1}
                        />
                    ))}
                </SettingsSection>
            </SettingsPage>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
});

export default ContactScreen;