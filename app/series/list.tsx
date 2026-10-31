import { Stack, useLocalSearchParams } from 'expo-router';
import MediaGrid from '@/components/MediaGrid';

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
      <MediaGrid apiUrl={apiUrl ?? ''} detailsPath="/series/details" />
    </>
  );
};

export default SeriesList;