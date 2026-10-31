import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, StatusBar } from '@/components/Themed';

const DisclaimerScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                    <Text style={styles.intro}>
                        Embedin provides movie and TV information and opens HTTP video embeds configured by the user. It does not host, store, or distribute video content.
                    </Text>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Application Purpose</Text>
                    <Text style={styles.sectionText}>
                        Embedin is a dashboard for movie and TV show information. Playback is provided by third-party HTTP embed providers selected through the movie and TV embed URL settings.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal Notice</Text>
                    <Text style={styles.sectionText}>
                        Users are responsible for ensuring their use of third-party embed providers complies with applicable laws and licensing agreements in their jurisdiction.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Not Endorsed</Text>
                    <Text style={styles.sectionText}>
                        The developer does not endorse accessing pirated or illegally distributed content, using unauthorized sources, or any activity that violates copyright laws.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Developer Responsibility</Text>
                    <View style={styles.warningRow}>
                        <Ionicons name="alert-circle-outline" size={22} color="#ff9f0a" />
                        <Text style={styles.sectionText}>
                            The developer is not responsible for user actions, external content, or legal consequences resulting from third-party embed providers.
                        </Text>
                    </View>
                    <Text style={styles.footerText}>
                        This notice explains user responsibilities for third-party content. The developer does not control or moderate external embed providers or their content.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    content: { width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36, gap: 20 },
    intro: { fontSize: 15, color: '#d1d1d6', lineHeight: 22 },
    section: { gap: 8 },
    sectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', color: '#ffffff' },
    sectionText: {
        fontSize: 15,
        color: '#d1d1d6',
        lineHeight: 21,
    },
    warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    footerText: { fontSize: 13, lineHeight: 18, color: '#8e8e93' },
});

export default DisclaimerScreen;