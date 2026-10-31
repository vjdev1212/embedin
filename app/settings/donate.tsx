import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Text, StatusBar } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { SettingsPage, SettingsRow, SettingsSection, SettingsTitle } from '@/components/NativeSettings';

const DonateScreen = () => {

    const handleDonate = async () => {
        if (await isHapticsSupported()) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const profileUsername = process.env.EXPO_PUBLIC_BUY_ME_COFFEE || '';
        const buyMeACoffeeUrl = `https://www.buymeacoffee.com/${profileUsername}`;
        Linking.openURL(buyMeACoffeeUrl).catch((err) =>
            console.error('Failed to open URL:', err)
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle
                    title="Enjoying the App?"
                    subtitle="Your support helps keep this project alive and enables continuous improvements. Every contribution makes a difference."
                />
                <SettingsSection title="Your support helps with">
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#30d158" />
                            <Text style={styles.featureText}>Regular updates & improvements</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#30d158" />
                            <Text style={styles.featureText}>New features development</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#30d158" />
                            <Text style={styles.featureText}>Bug fixes & maintenance</Text>
                        </View>
                </SettingsSection>
                <SettingsSection title="Support Embedin" footer="Thank you for supporting this project.">
                    <SettingsRow
                        title="Buy Me a Coffee"
                        onPress={handleDonate}
                        leading={<Ionicons name="cafe-outline" size={20} color="#ff9f0a" />}
                        trailing={<Ionicons name="open-outline" size={17} color="#8e8e93" />}
                        isLast
                    />
                </SettingsSection>
            </SettingsPage>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    featureText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#d1d1d6',
        flex: 1,
    },
});


export default DonateScreen;