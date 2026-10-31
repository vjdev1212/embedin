import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import PersonDetailsSheet from '@/components/person-details-sheet';
import PersonDetailsContent from '@/components/person-details-content';
import type { Credit, Person } from '@/components/person-details-types';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const PROFILE_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const PERSON_COLORS = {
  primary: '#0a84ff',
  background: '#000000',
  backgroundCard: '#1c1c1e',
  text: '#ffffff',
  textMuted: '#8e8e93',
  border: '#38383a',
} as const;

export interface PersonDetailsScreenProps {
  visible: boolean;
  personId: number | null;
  onClose: () => void;
}

export default function PersonDetailsScreen({ visible, personId, onClose }: PersonDetailsScreenProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [castCredits, setCastCredits] = useState<Credit[]>([]);
  const [crewCredits, setCrewCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [profileImageError, setProfileImageError] = useState(false);
  const loadedPersonId = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadPerson = async () => {
      if (!visible || personId === null || loadedPersonId.current === personId) return;
      loadedPersonId.current = null;
      setLoading(true);
      setError(null);
      setPerson(null);
      setCastCredits([]);
      setCrewCredits([]);
      setProfileImageLoading(true);
      setProfileImageError(false);

      try {
        if (!Number.isSafeInteger(personId) || personId <= 0) throw new Error('Invalid person ID');
        if (!TMDB_API_KEY) throw new Error('TMDB API key is not configured');
        const baseUrl = `https://api.themoviedb.org/3/person/${personId}`;
        const [personResponse, creditsResponse] = await Promise.all([
          fetch(`${baseUrl}?api_key=${TMDB_API_KEY}`, { signal: controller.signal }),
          fetch(`${baseUrl}/combined_credits?api_key=${TMDB_API_KEY}`, { signal: controller.signal }),
        ]);
        if (!personResponse.ok) throw new Error(`TMDB person request failed (${personResponse.status})`);
        if (!creditsResponse.ok) throw new Error(`TMDB credits request failed (${creditsResponse.status})`);
        const [personResult, creditsResult] = await Promise.all([
          personResponse.json() as Promise<Person>,
          creditsResponse.json() as Promise<{ cast?: Credit[]; crew?: Credit[] }>,
        ]);
        if (!personResult?.id || !personResult.name) throw new Error('TMDB returned an invalid person response');

        const relevantCredits = (credits: Credit[]) => {
          const uniqueCredits = new Map<string, Credit>();
          credits.filter((credit) => (credit.media_type === 'movie' || credit.media_type === 'tv') && credit.id)
            .forEach((credit) => {
              const key = `${credit.media_type}-${credit.id}`;
              if (!uniqueCredits.has(key)) uniqueCredits.set(key, credit);
            });
          return Array.from(uniqueCredits.values()).sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0)).slice(0, 30);
        };

        setPerson(personResult);
        setCastCredits(relevantCredits(creditsResult.cast ?? []));
        setCrewCredits(relevantCredits(creditsResult.crew ?? []));
        loadedPersonId.current = personId;
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error('Error loading person details:', loadError);
        setError('Could not load this profile. Check your connection and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadPerson();
    return () => controller.abort();
  }, [personId, retryCount, visible]);

  const handleCreditPress = (credit: Credit) => {
    onClose();
    router.push({
      pathname: credit.media_type === 'movie' ? '/movie/details' : '/series/details',
      params: { moviedbid: String(credit.id) },
    });
  };

  const profileImage = useMemo(
    () => person?.profile_path ? `${PROFILE_IMAGE_BASE}${person.profile_path}` : null,
    [person?.profile_path],
  );

  return (
    <PersonDetailsSheet visible={visible} onClose={onClose} backgroundColor={PERSON_COLORS.background}>
      <PersonDetailsContent
        colors={PERSON_COLORS}
        loading={loading}
        error={error}
        person={person}
        castCredits={castCredits}
        crewCredits={crewCredits}
        profileImage={profileImage}
        profileImageLoading={profileImageLoading}
        profileImageError={profileImageError}
        onProfileImageLoad={() => setProfileImageLoading(false)}
        onProfileImageError={() => { setProfileImageLoading(false); setProfileImageError(true); }}
        onRetry={() => setRetryCount((count) => count + 1)}
        onClose={onClose}
        onCreditPress={handleCreditPress}
      />
    </PersonDetailsSheet>
  );
}