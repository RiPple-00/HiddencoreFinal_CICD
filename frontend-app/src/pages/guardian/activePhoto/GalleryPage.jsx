import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Text from "@/components/Text";
import { fetchGuardianLinkedPatients } from '../../../api/careChecklistApi';
import { fetchGuardianActivityGallery } from '../../../api/activityGalleryApi';
import { mapGalleryPhotos } from '../../../utils/galleryPhotoUtils';
import ActivePhotoMobileShell from '../../../components/guardian/activePhoto/ActivePhotoMobileShell';
import ActivePhotoTopBar from '../../../components/guardian/activePhoto/ActivePhotoTopBar';
import ActivePhotoInfoText from '../../../components/guardian/activePhoto/ActivePhotoInfoText';
import GallerySlotGrid from '../../../components/guardian/activePhoto/GallerySlotGrid';
import ActivePhotoBottomActions from '../../../components/guardian/activePhoto/ActivePhotoBottomActions';

function GuardianGalleryPage({ navigation }) {
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filledCount, setFilledCount] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const linkedRes = await fetchGuardianLinkedPatients();
          const list = linkedRes.data ?? [];
          const primary = list.find((p) => p.primary) ?? list[0];
          const pid = primary?.patientId ?? null;
          if (!pid) {
            if (!cancelled) {
              setPatientId(null);
              setGalleryPhotos([]);
              setFilledCount(0);
            }
            return;
          }
          if (!cancelled) setPatientId(pid);

          const galleryRes = await fetchGuardianActivityGallery(pid);
          if (cancelled) return;
          const data = galleryRes.data ?? {};
          const mapped = mapGalleryPhotos(data.slots ?? []);
          setGalleryPhotos(mapped);
          setFilledCount(data.filledCount ?? mapped.length);
        } catch (e) {
          if (!cancelled) {
            setError(e?.response?.data?.message ?? '활동 사진을 불러오지 못했습니다.');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const latestPhoto = useMemo(
    () => galleryPhotos[galleryPhotos.length - 1] ?? null,
    [galleryPhotos]
  );

  const handleOpenMore = () => {
    navigation.navigate('GalleryMore', { range: 'slots', patientId, slots: galleryPhotos });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1">
        <ActivePhotoMobileShell>
          <ActivePhotoTopBar
            title="프로그램 사진 기록"
            onBack={() => navigation.goBack()}
          />
          <ActivePhotoInfoText />

          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator />
            </View>
          ) : null}

          {error ? (
            <Text className="text-sm text-red-600 mb-4">{error}</Text>
          ) : null}

          {!loading && filledCount === 0 && !error ? (
            <Text className="text-sm text-guardian-text-neutral mb-5">
              아직 등록된 사진이 없습니다. 
            </Text>
          ) : null}

          {!loading ? (
            <GallerySlotGrid photos={galleryPhotos} filledCount={filledCount} />
          ) : null}

          {!loading && filledCount > 0 ? (
            <View className="mt-5 items-end">
              
            </View>
          ) : null}

          <ActivePhotoBottomActions />
        </ActivePhotoMobileShell>
      </View>
    </SafeAreaView>
  );
}

export default GuardianGalleryPage;
