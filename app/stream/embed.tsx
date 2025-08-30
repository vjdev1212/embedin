import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  defaultMovieUrlTemplate,
  defaultTvShowUrlTemplate,
  defaultSandboxAllowedForMovie,
  defaultSandboxAllowedForTv
} from '@/constants/Embed';
import { Text, View } from '@/components/Themed';

const EmbedPlayer = () => {
  const { imdbid, tmdbid, type, season, episode } = useLocalSearchParams();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
  const [seriesUrlTemplate, setSeriesUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);
  const [sandboxAllowedForMovie, setSandboxAllowedForMovie] = useState<boolean>(defaultSandboxAllowedForMovie);
  const [sandboxAllowedForTv, setSandboxAllowedForTv] = useState<boolean>(defaultSandboxAllowedForTv);
  const [sandboxAllowed, setSandboxAllowed] = useState<boolean>(true);

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

  const iframeHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EmbedIn</title>
      <!-- Google Cast SDK -->
      <script src="https://www.gstatic.com/cast/sdk/libs/sender/1.0/cast_sender.js"></script>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background-color: #000;
        }
        iframe {
          position: absolute;
          top: 0;
          left: 0;
          border: none;
          width: 100%;
          height: 100%;
        }
        @media (orientation: portrait) {
          .iframe-container {
            aspect-ratio: 16/9;
          }
        }
      </style>
    </head>
    <body>
      <div class="iframe-container">
        <iframe
          src="${videoUrl}"
          frameborder="0"
          style="width: 100%; height: 100%; border: 0; background-color: #000000"
          referrerpolicy="no-referrer-when-downgrade"
          ${sandboxAllowed ? 'sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"' : ''}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share"
          allowfullscreen
          x-webkit-airplay="allow"
          webkit-playsinline="false">
        </iframe>
        <!-- Google Cast button -->
        <google-cast-launcher class="cast-button" style="position: absolute; top: 10px; right: 10px; z-index: 1000;"></google-cast-launcher>
      </div>
      <script>
        window.open = function() { return null; };
        
        // Initialize Google Cast
        window['__onGCastApiAvailable'] = function(isAvailable) {
          if (isAvailable) {
            const castContext = cast.framework.CastContext.getInstance();
            castContext.setOptions({
              receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
            
            // Add cast button functionality
            const castButton = castContext.getCastButton(document.querySelector('.cast-button'));
          }
        };
        
        // Function to cast video
        function castVideo() {
          const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
          if (castSession) {
            const mediaInfo = new chrome.cast.media.MediaInfo('${videoUrl}', 'video/mp4');
            const request = new chrome.cast.media.LoadRequest(mediaInfo);
            castSession.loadMedia(request);
          }
        }
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

  const webViewBgColor = '#000';

  return (
    <View style={styles.container}>
      {videoUrl ? (
        Platform.OS === 'web' ? (
          <>
            {
              sandboxAllowed ? (
                <iframe
                  src={videoUrl as string}
                  style={{ flex: 1, width: "100%", height: "100%", border: 0, backgroundColor: '#000000' }}
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
                  allow="encrypted-media; autoplay; fullscreen; picture-in-picture; web-share"
                  frameBorder="0"
                  allowFullScreen
                  x-webkit-airplay="allow"
                  webkit-playsinline="false"
                />
              ) : (
                <iframe
                  src={videoUrl as string}
                  style={{ flex: 1, width: "100%", height: "100%", border: 0, backgroundColor: '#000000' }}
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="encrypted-media; autoplay; fullscreen; picture-in-picture; web-share"
                  frameBorder="0"
                  allowFullScreen
                  x-webkit-airplay="allow"
                  webkit-playsinline="false"
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
              backgroundColor: webViewBgColor,
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
            allowsAirPlayForMediaPlayback={true}
            allowsPictureInPictureMediaPlayback={true}
            allowsInlineMediaPlayback={false}
            bounces={false}
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