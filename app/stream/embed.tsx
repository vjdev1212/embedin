import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    defaultMovieUrlTemplate,
    defaultSeriesUrlTemplate,
    defaultSandboxAllowed
} from '@/constants/Embed';

const EmbedPlayer = () => {
    const { imdbid, type, season, episode } = useLocalSearchParams();
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
    const [seriesUrlTemplate, setSeriesUrlTemplate] = useState<string>(defaultSeriesUrlTemplate);
    const [sandboxAllowed, setSandboxAllowed] = useState<boolean>(defaultSandboxAllowed);

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const storedSettings = await AsyncStorage.getItem('embedSettings');
                if (storedSettings) {
                    const parsedSettings = JSON.parse(storedSettings);
                    setMovieUrlTemplate(parsedSettings.movieUrlTemplate ?? defaultMovieUrlTemplate);
                    setSeriesUrlTemplate(parsedSettings.tvShowsUrlTemplate ?? defaultSeriesUrlTemplate);
                    setSandboxAllowed(parsedSettings.sandboxAllowed ?? defaultSandboxAllowed);
                }
            } catch (error) {
                console.error('Failed to load embed settings:', error);
            }
        };

        loadEmbedSettings();
    }, []);

    useEffect(() => {
        if (imdbid) {
            let url = '';
            if (type === 'movie') {
                url = generateUrl(movieUrlTemplate, { imdbid: imdbid as string });
            }
            if (type === 'series' && season && episode) {
                url = generateUrl(seriesUrlTemplate,
                    {
                        imdbid: imdbid as string,
                        season: season as string,
                        episode: episode as string
                    }
                );
            }
            setVideoUrl(url);
        }
    }, [imdbid, season, episode, movieUrlTemplate, seriesUrlTemplate]);

    const generateUrl = (template: string, { imdbid, season = '1', episode = '1' }: { imdbid: string; season?: string; episode?: string; }) => {
        return template
            .replace(/(\{IMDBID\})/gi, imdbid)
            .replace(/(\{SEASON\})/gi, season.toString())
            .replace(/(\{EPISODE\})/gi, episode.toString());
    };

    // HTML structure with iframe and popup-blocking JavaScript
    const iframeHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Embed Video Player</title>
            <style>
                body {
                    padding: 0 !important;
                    margin: 0 !important;
                    background-color: #000;
                }

                .iframe-container {
                    height: 100vh;
                    width: 100%;
                    margin: auto;
                    border: none;
                }

                @media (orientation: portrait) {
                    .iframe-container {
                        height: 100vh;
                    }
                }
            </style>
        </head>
        <body>
            <div class="iframe-container">
                <iframe 
                    src="${videoUrl}" 
                    frameborder="0" 
                    style="width: 100%; height: 100%;"
                    allow="autoplay; fullscreen" 
                    referrerPolicy="no-referrer-when-downgrade"                    
                    ${sandboxAllowed ? 'sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"' : ''}
                    allowfullscreen>
                </iframe>
            </div>

            <script>
                // Block popups by overriding window.open
                window.open = function() { return null; };
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            {videoUrl ? (
                Platform.OS === 'web' ? (
                    <>
                        {
                            sandboxAllowed ? (
                                <iframe
                                    src={videoUrl as string}
                                    style={{ flex: 1, width: "100%", height: "100%" }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
                                    allow="autoplay; fullscreen"
                                    frameBorder={0}
                                    allowFullScreen
                                />
                            ) : (
                                <iframe
                                    src={videoUrl as string}
                                    style={{ flex: 1, width: "100%", height: "100%" }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allow="autoplay; fullscreen"
                                    frameBorder={0}
                                    allowFullScreen
                                />
                            )
                        }
                    </>
                ) : (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: iframeHtml }}
                        style={{ flex: 1 }}
                        javaScriptEnabled
                        domStorageEnabled
                        startInLoadingState
                        allowUniversalAccessFromFileURLs
                        allowFileAccess
                    />
                )
            ) : (
                <Text>No video URL available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20
    },
});

export default EmbedPlayer;
