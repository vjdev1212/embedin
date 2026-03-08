import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultMovieUrlTemplate,
  defaultTvShowUrlTemplate
} from '@/constants/Embed';
import { Text, View } from '@/components/Themed';

const EmbedPlayer = () => {
  const { imdbid, tmdbid, type, season, episode } = useLocalSearchParams();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
  const [seriesUrlTemplate, setSeriesUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);

  useEffect(() => {
    const loadEmbedSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('embedSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setMovieUrlTemplate(parsedSettings.movie?.template ?? defaultMovieUrlTemplate);
          setSeriesUrlTemplate(parsedSettings.tv?.template ?? defaultTvShowUrlTemplate);
        }
      } catch (error) {
        console.error('Failed to load embed settings:', error);
      }
    };

    loadEmbedSettings();
  }, [type]);

  useEffect(() => {
    if (imdbid) {
      let url = '';
      if (type === 'movie') {
        url = generateUrl(movieUrlTemplate, {
          imdbid: imdbid as string,
          tmdbid: tmdbid as string,
        });
      }
      if (type === 'series' && season && episode) {
        url = generateUrl(seriesUrlTemplate, {
          imdbid: imdbid as string,
          tmdbid: tmdbid as string,
          season: season as string,
          episode: episode as string,
        });
      }
      setVideoUrl(url);
    }
  }, [imdbid, tmdbid, season, episode, movieUrlTemplate, seriesUrlTemplate]);

  const generateUrl = (
    template: string,
    {
      imdbid,
      tmdbid,
      season = '1',
      episode = '1',
    }: { imdbid: string; tmdbid: string; season?: string; episode?: string }
  ) => {
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

  const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <title>EmbedPlayer</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            background-color: #000;
          }
        </style>
      </head>
      <body>
        <iframe
          src="${videoUrl}"
          frameborder="0"
          referrerpolicy="origin"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
        ></iframe>
        <script>
          // Block popups
          window.open = function() { return null; };
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {videoUrl ? (
        Platform.OS === 'web' ? (
          <iframe
            src={videoUrl}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#000000',
            }}
            referrerPolicy="no-referrer-when-downgrade"
            allow="encrypted-media; autoplay; fullscreen; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: iframeHtml, baseUrl: videoUrl }}
            style={styles.webview}
            forceDarkOn={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            allowsAirPlayForMediaPlayback={true}
            allowsPictureInPictureMediaPlayback={true}
            allowsInlineMediaPlayback={false}
            bounces={false}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('HTTP error: ', nativeEvent.statusCode);
            }}
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
    paddingBottom: 20,
  },
  webview: {
    flex: 1,
    marginBottom: 20,
  },
});

export default EmbedPlayer;