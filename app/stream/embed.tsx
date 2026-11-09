import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { storageService } from '@/utils/StorageService';
import {
  defaultMovieUrlTemplate,
  defaultTvShowUrlTemplate
} from '@/constants/Embed';
import { Text, View } from '@vjdev1212/media-ui-kit';

const EmbedPlayer = () => {
  const { imdbid, tmdbid, type, season, episode, name, poster, background } = useLocalSearchParams();
  const headerTitle = typeof name === 'string' && name.trim() ? name : 'Embed Player';
  const htmlTitle = headerTitle.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
  const artworkUrl =
    typeof poster === 'string' && poster.trim()
      ? poster
      : typeof background === 'string' && background.trim()
        ? background
        : '';
  const nowPlayingArtworkScript = `
    (() => {
      const artworkUrl = ${JSON.stringify(artworkUrl)};
      const fallbackTitle = ${JSON.stringify(headerTitle)};
      if (!artworkUrl || typeof MediaSession === 'undefined' || typeof MediaMetadata === 'undefined') {
        return true;
      }

      const metadataDescriptor = Object.getOwnPropertyDescriptor(MediaSession.prototype, 'metadata');
      const addArtwork = (metadata) => {
        if (!metadata || metadata.artwork?.length) return metadata;
        return new MediaMetadata({
          title: metadata.title || fallbackTitle,
          artist: metadata.artist,
          album: metadata.album,
          artwork: [{ src: artworkUrl }],
        });
      };

      if (metadataDescriptor?.set) {
        const originalSetter = metadataDescriptor.set;
        const originalGetter = metadataDescriptor.get;
        Object.defineProperty(MediaSession.prototype, 'metadata', {
          configurable: true,
          enumerable: metadataDescriptor.enumerable,
          get: originalGetter ? function() { return originalGetter.call(this); } : undefined,
          set: function(metadata) { originalSetter.call(this, addArtwork(metadata)); },
        });
      }

      const updateArtwork = () => {
        const session = navigator.mediaSession;
        if (!session || session.metadata?.artwork?.length) return;
        session.metadata = addArtwork(session.metadata || new MediaMetadata({
          title: document.title || fallbackTitle,
        }));
      };

      document.addEventListener('play', updateArtwork, true);
      updateArtwork();
      return true;
    })();
    true;
  `;
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
  const [seriesUrlTemplate, setSeriesUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);

  useEffect(() => {
    const loadEmbedSettings = async () => {
      try {
        const storedSettings = await storageService.getObject<{
          movie?: { template?: string };
          tv?: { template?: string };
        }>('embedSettings');
        setMovieUrlTemplate(storedSettings?.movie?.template ?? defaultMovieUrlTemplate);
        setSeriesUrlTemplate(storedSettings?.tv?.template ?? defaultTvShowUrlTemplate);
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
        <title>${htmlTitle}</title>
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle,
          title: headerTitle,
          headerTransparent: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
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
            injectedJavaScriptBeforeContentLoaded={nowPlayingArtworkScript}
            injectedJavaScriptBeforeContentLoadedForMainFrameOnly={Platform.OS !== 'ios'}
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
            allowsInlineMediaPlayback={true}
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