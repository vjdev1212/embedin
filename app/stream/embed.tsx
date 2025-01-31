import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const EmbedPlayer = () => {
    const { imdbid, type, season, episode } = useLocalSearchParams();
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        if (imdbid) {
            let url = '';
            if (type === 'movie') {
                url = `https://vidsrc.cc/v2/embed/movie/${imdbid}`;
            }
            if (type === 'series' && season && episode) {
                url = `https://vidsrc.cc/v2/embed/tv/${imdbid}/${season}/${episode}`;
            }
            setVideoUrl(url);
            console.log('Video URL:', url);
        }
    }, [imdbid, season, episode]);

    // HTML structure with iframe and custom CSS
    const iframeHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Embed Video Player</title>
            <style>
                /* Import your external CSS file if necessary */
                /* Example: @import url('your-stylesheet.css'); */
                
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
                        height: 95vh;
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
                    sandbox="allow-forms allow-scripts allow-same-origin"
                    allowfullscreen>
                </iframe>
            </div>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            {videoUrl ? (
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
            ) : (
                <Text>No video URL available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default EmbedPlayer;
