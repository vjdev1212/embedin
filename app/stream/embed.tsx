import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Iframe } from "@bounceapp/iframe"
import { movieUrlTemplate, sanboxAllowed, seriesUrlTemplate } from '@/constants/Embed';

const EmbedPlayer = () => {
    const { imdbid, type, season, episode } = useLocalSearchParams();
    const [videoUrl, setVideoUrl] = useState('');

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
            console.log('Video URL:', url);
        }
    }, [imdbid, season, episode]);

    const generateUrl = (template: string, { imdbid, season = '1', episode = '1' }: { imdbid: string; season?: string; episode?: string; }) => {
        let url = template;
        url = url.split('{IMDBID}').join(imdbid);
        url = url.split('{SEASON}').join(season.toString());
        url = url.split('{EPISODE}').join(episode.toString());
        return url;
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
                    sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
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
                            sanboxAllowed ? (
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
                        javaScriptEnabledAndroid
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
