import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
    defaultMovieUrlTemplate,
    defaultTvShowUrlTemplate,
    defaultSandboxAllowedForMovie,
    defaultSandboxAllowedForTv
} from '@/constants/Embed';
import { useColorScheme } from '@/components/useColorScheme';

const EmbedPlayer = () => {
    const { imdbid, tmdbid, type, season, episode } = useLocalSearchParams();
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
    const [seriesUrlTemplate, setSeriesUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);
    const [sandboxAllowedForMovie, setSandboxAllowedForMovie] = useState<boolean>(defaultSandboxAllowedForMovie);
    const [sandboxAllowedForTv, setSandboxAllowedForTv] = useState<boolean>(defaultSandboxAllowedForTv);
    const [sandboxAllowed, setSandboxAllowed] = useState<boolean>(true);
    const colorScheme = useColorScheme();

    useEffect(() => {
        const enableOrientation = async () => {
            if (Platform.OS !== 'web') {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
            }
        };
    
        enableOrientation();
    
        const loadEmbedSettings = async () => {
            try {
                const storedSettings = await AsyncStorage.getItem('embedSettings');
                if (storedSettings) {
                    const parsedSettings = JSON.parse(storedSettings);
                    console.log('Parsed embed settings:', parsedSettings);
                    setMovieUrlTemplate(parsedSettings.movie?.template ?? defaultMovieUrlTemplate);
                    setSeriesUrlTemplate(parsedSettings.tv?.template ?? defaultTvShowUrlTemplate);
                    setSandboxAllowedForMovie(parsedSettings.movie?.sandboxAllowed ?? defaultSandboxAllowedForMovie);
                    setSandboxAllowedForTv(parsedSettings.tv?.sandboxAllowed ?? defaultSandboxAllowedForTv);
    
                    if (type === 'movie') {
                        setSandboxAllowed(parsedSettings.movie?.sandboxAllowed ?? defaultSandboxAllowedForMovie);
                    } else if (type === 'series') {
                        setSandboxAllowed(parsedSettings.tv?.sandboxAllowed ?? defaultSandboxAllowedForTv);
                    }
                }
            } catch (error) {
                console.error('Failed to load embed settings:', error);
            }
        };
    
        loadEmbedSettings();
    
        return () => {
            if (Platform.OS !== 'web') {
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            }
        };
    }, [type]);
    

    useEffect(() => {
        if (imdbid) {
            let url = '';
            if (type === 'movie') {
                url = generateUrl(movieUrlTemplate, { imdbid: imdbid as string, tmdbid: tmdbid as string });
            }
            if (type === 'series' && season && episode) {
                url = generateUrl(seriesUrlTemplate,
                    {
                        imdbid: imdbid as string,
                        tmdbid: tmdbid as string,
                        season: season as string,
                        episode: episode as string
                    }
                );
            }
            setVideoUrl(url);
            console.log('Video URL:', url);
        }
    }, [imdbid, tmdbid, season, episode, movieUrlTemplate, seriesUrlTemplate]);

    const generateUrl = (template: string, { imdbid, tmdbid, season = '1', episode = '1' }: { imdbid: string; tmdbid: string; season?: string; episode?: string; }) => {
        return template
            .replace(/(\{ID\})/gi, tmdbid)
            .replace(/(\{TMDBID\})/gi, tmdbid)
            .replace(/(\{TMDB_ID\})/gi, tmdbid)
            .replace(/(\{IMDBID\})/gi, imdbid)
            .replace(/(\{IMDB_ID\})/gi, imdbid)
            .replace(/(\{SEASON\})/gi, season.toString())
            .replace(/(\{SEASONNUMBER\})/gi, season.toString())
            .replace(/(\{SEASON_NUMBER\})/gi, season.toString())
            .replace(/(\{SEASONNO\})/gi, season.toString())
            .replace(/(\{SEASON_NO\})/gi, season.toString())
            .replace(/(\{EPISODE\})/gi, episode.toString())
            .replace(/(\{EPISODENO\})/gi, episode.toString())
            .replace(/(\{EPISODE_NO\})/gi, episode.toString())
            .replace(/(\{EPISODENUMBER\})/gi, episode.toString())
            .replace(/(\{EPISODE_NUMBER\})/gi, episode.toString());
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
                    allow="encrypted-media; autoplay; fullscreen"
                    referrerPolicy="no-referrer-when-downgrade"
                    ${sandboxAllowed ? 'sandbox="allow-same-origin allow-scripts allow-forms allowfullscreen allow-presentation"' : ''}
                    allowfullscreen>
                </iframe>
            </div>

            <script>
                // Block popups by overriding window.open
                window.open = function() { return null; };
            </script>
            <script>
            document.addEventListener('DOMContentLoaded', function () {
                document.querySelector('iframe').addEventListener('click', function () {
                    if (this.requestFullscreen) {
                        this.requestFullscreen();
                    } else if (this.mozRequestFullScreen) {
                        this.mozRequestFullScreen();
                    } else if (this.webkitRequestFullscreen) {
                        this.webkitRequestFullscreen();
                    } else if (this.msRequestFullscreen) {
                        this.msRequestFullscreen();
                    }
                });
            });
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
                                    allow="encrypted-media; autoplay; fullscreen"
                                    frameBorder={0}
                                    allowFullScreen
                                />
                            ) : (
                                <iframe
                                    src={videoUrl as string}
                                    style={{ flex: 1, width: "100%", height: "100%" }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allow="encrypted-media; autoplay; fullscreen"
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
                        style={{
                            flex: 1,
                            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                            marginTop: 30,
                            marginBottom: 10
                        }}
                        javaScriptEnabled
                        domStorageEnabled
                        startInLoadingState
                        allowUniversalAccessFromFileURLs
                        allowFileAccess
                        mediaPlaybackRequiresUserAction={false}
                        allowsFullscreenVideo={true}
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
