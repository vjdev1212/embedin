import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MediaGrid } from '@vjdev1212/media-ui-kit';
import { showAlert } from '@/utils/platform';

const SeriesList = () => {
  const { apiUrl, title } = useLocalSearchParams<{ apiUrl?: string; title?: string }>();
  const pageTitle = title || 'TV Shows';

  return (
    <>
      <Stack.Screen options={{
        title: pageTitle,
        headerTitle: pageTitle,
        headerTitleAlign: 'left',
        headerTransparent: true,
        headerShadowVisible: true,
      }} />
      <MediaGrid
        apiUrl={apiUrl ?? ''}
        apiKey={process.env.EXPO_PUBLIC_TMDB_API_KEY}
        detailsPath="/series/details"
        onItemPress={(item) => router.push({ pathname: '/series/details', params: { moviedbid: String(item.tmdbid) } })}
        onActionError={showAlert}
      />
    </>
  );
};

export default SeriesList;