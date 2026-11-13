import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MediaGrid } from '@vjdev1212/media-ui-kit';
import { showAlert } from '@/utils/platform';

const SeriesList = () => {
  const { apiUrl, title, minimumPopularity } = useLocalSearchParams<{
    apiUrl?: string;
    title?: string;
    minimumPopularity?: string;
  }>();
  const pageTitle = title || 'TV Shows';
  const parsedMinimumPopularity = minimumPopularity === undefined ? undefined : Number(minimumPopularity);
  const minimumPopularityValue = Number.isFinite(parsedMinimumPopularity) ? parsedMinimumPopularity : undefined;

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
        mediaType="series"
        minimumPopularity={minimumPopularityValue}
        onItemPress={(item) => router.push({ pathname: '/series/details', params: { moviedbid: String(item.tmdbid) } })}
        onActionError={showAlert}
      />
    </>
  );
};

export default SeriesList;