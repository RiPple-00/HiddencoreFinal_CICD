import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Text from "@/components/Text";
import { fetchGuardianActivityGallery } from '../../../api/activityGalleryApi';
import { mapGalleryPhotos } from '../../../utils/galleryPhotoUtils';
import ActivePhotoMobileShell from '../../../components/guardian/activePhoto/ActivePhotoMobileShell';
import ActivePhotoTopBar from '../../../components/guardian/activePhoto/ActivePhotoTopBar';
import ActivePhotoInfoText from '../../../components/guardian/activePhoto/ActivePhotoInfoText';
import GallerySlotCard from '../../../components/guardian/activePhoto/GallerySlotCard';
import ActivityPhotoDetailModal from '../../../components/guardian/activePhoto/ActivityPhotoDetailModal';

function GuardianMorePage({ route, navigation }) {
  const patientId = route?.params?.patientId;
  const [loading, setLoading] = useState(true);
  const [slotPhotos, setSlotPhotos] = useState(route?.params?.slots ?? []);
  const [filledCount, setFilledCount] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (patientId == null) {
        setLoading(false);
        return undefined;
      }
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const res = await fetchGuardianActivityGallery(patientId);
          if (cancelled) return;
          const data = res.data ?? {};
          setSlotPhotos(mapGalleryPhotos(data.slots ?? []));
          setFilledCount(data.filledCount ?? 0);
        } catch {
          if (!cancelled && !route?.params?.slots?.length) {
            setSlotPhotos([]);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [patientId, route?.params?.slots])
  );

  const filledSlots = useMemo(
    () =>
      slotPhotos
        .filter(Boolean)
        .map((photo) => ({
          photo,
          slotIndex: photo.slotIndex ?? 0,
        })),
    [slotPhotos]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1">
        <ActivePhotoMobileShell scrollable={false}>
          <ActivePhotoTopBar
            title="활동 기록 상세"
            onBack={() => navigation.goBack()}
          />
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <ActivePhotoInfoText />

            {loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator />
              </View>
            ) : null}

            {!loading && filledCount === 0 ? (
              <Text className="text-sm text-guardian-text-neutral py-4">
                등록된 사진이 없습니다.
              </Text>
            ) : null}

            <View className="gap-5">
              {filledSlots.map(({ photo, slotIndex }) => (
                <View key={`detail-slot-${slotIndex}`}>
                  <Text className="text-lg font-extrabold text-guardian-text-primary mb-3">
                    {slotIndex}번 기록
                  </Text>
                  <GallerySlotCard
                    slotIndex={slotIndex}
                    photo={photo}
                    onClick={setSelectedPhoto}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <ActivityPhotoDetailModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onSave={() => setSelectedPhoto(null)}
          />
        </ActivePhotoMobileShell>
      </View>
    </SafeAreaView>
  );
}

export default GuardianMorePage;
