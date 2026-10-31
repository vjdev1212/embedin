import { SettingsPage, SettingsRow, SettingsSection } from '@/components/NativeSettings';

export default function DisclaimerScreen() {
    return (
        <SettingsPage hideScrollIndicator>
            <SettingsSection title="About Embedin">
                <SettingsRow
                    title="Purpose"
                    detail="Embedin provides movie and TV show information. It does not host, store, or distribute video content. Playback is opened through third-party embed providers configured by users."
                    detailSameFont
                    isLast
                />
            </SettingsSection>
            <SettingsSection title="Your responsibility">
                <SettingsRow
                    title="Legal compliance"
                    detail="You are responsible for ensuring that your use of third-party embed providers complies with the laws and regulations in your jurisdiction, including copyright laws and licensing agreements."
                    detailSameFont
                    isLast
                />
            </SettingsSection>
            <SettingsSection title="Third-party content">
                <SettingsRow
                    title="Not endorsed"
                    detail="The developer does not endorse or support accessing pirated or illegally distributed content, using unauthorized sources, or any activity that violates copyright laws."
                    detailSameFont
                    isLast
                />
            </SettingsSection>
            <SettingsSection title="Developer responsibility">
                <SettingsRow
                    title="Third-party sources"
                    detail="The developer does not provide, control, or moderate third-party embed providers and is not responsible for user actions or content accessed through them. The developer is not liable for legal consequences resulting from user actions."
                    detailSameFont
                    isLast
                />
            </SettingsSection>
        </SettingsPage>
    );
}
