import { useMemo } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MediaGrid } from '@vjdev1212/media-ui-kit';
import { showAlert } from '@/utils/platform';

const SeriesList = () => {
  const {
    apiUrl,
    title,
    minimumPopularity,
    mediaType,
    movieApiUrl,
    seriesApiUrl,
  } = useLocalSearchParams<{
    apiUrl?: string;
    title?: string;
    minimumPopularity?: string;
    mediaType?: string;
    movieApiUrl?: string;
    seriesApiUrl?: string;
  }>();
  const pageTitle = title || 'TV Shows';
  const parsedMinimumPopularity = minimumPopularity === undefined ? undefined : Number(minimumPopularity);
  const minimumPopularityValue = Number.isFinite(parsedMinimumPopularity) ? parsedMinimumPopularity : undefined;
  const isMixedList = mediaType === 'any';
  const sources = useMemo(() => (
    isMixedList
      ? [
        ...(movieApiUrl ? [{ apiUrl: movieApiUrl, mediaType: 'movie' as const }] : []),
        ...(seriesApiUrl ? [{ apiUrl: seriesApiUrl, mediaType: 'series' as const }] : []),
      ]
      : undefined
  ), [isMixedList, movieApiUrl, seriesApiUrl]);

  return (
    <>
      <Stack.Screen options={{
        title: pageTitle,
        headerTitle: pageTitle,
        headerTitleAlign: 'left',
        headerTransparent: false,
        headerShadowVisible: false,
      }} />
      <MediaGrid
        apiUrl={apiUrl ?? ''}
        apiKey={process.env.EXPO_PUBLIC_TMDB_API_KEY}
        mediaType={isMixedList ? 'any' : 'series'}
        sources={sources}
        minimumPopularity={minimumPopularityValue}
        onItemPress={(item) => {
          const type = item.type === 'movie' ? 'movie' : 'series';
          router.push({ pathname: `/${type}/details`, params: { moviedbid: String(item.tmdbid) } });
        }}
        onActionError={showAlert}
      />
    </>
  );
};

export default SeriesList;