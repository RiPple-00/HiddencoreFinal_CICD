import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { fetchGuardianLinkedPatients } from "@/api/careChecklistApi";
import { fetchGuardianActivityGallery } from "@/api/activityGalleryApi";
import { resolveGuardianGalleryPatientId } from "@/utils/guardianPatientId";
import { mapGalleryPhotos } from "@/utils/galleryPhotoUtils";

const MAX_SLIDE_PHOTOS = 4;

export default function GuardianGallery({ navigation }) {
  const { t } = useI18n();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [rowWidth, setRowWidth] = useState(0);
  const scrollRef = useRef(null);

  const fallbackWidth = Dimensions.get("window").width;
  const effectiveWidth = rowWidth || fallbackWidth;
  const galleryWidth = Math.max(0, effectiveWidth);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const linkedRes = await fetchGuardianLinkedPatients();
          const pid = resolveGuardianGalleryPatientId(linkedRes.data ?? []);
          if (!pid) {
            if (!cancelled) {
              setPhotos([]);
              setCurrentImage(0);
            }
            return;
          }

          const galleryRes = await fetchGuardianActivityGallery(pid);
          if (cancelled) return;

          const mapped = mapGalleryPhotos(galleryRes.data?.slots ?? [])
            .filter(Boolean)
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .slice(0, MAX_SLIDE_PHOTOS);

          setPhotos(mapped);
          setCurrentImage(0);
          scrollRef.current?.scrollTo({ x: 0, animated: false });
        } catch {
          if (!cancelled) {
            setPhotos([]);
            setCurrentImage(0);
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

  useEffect(() => {
    if (photos.length < 2 || !galleryWidth) return;
    const interval = setInterval(() => {
      const nextIndex =
        currentImage === photos.length - 1 ? 0 : currentImage + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * galleryWidth,
        animated: true,
      });
      setCurrentImage(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImage, galleryWidth, photos.length]);

  const navigateToGallery = () => navigation.navigate("ActivePhotoGallery");

  return (
    <View className="mx-5 mt-5">
      <TouchableOpacity activeOpacity={0.7} onPress={navigateToGallery}>
        <Text className="text-base font-extrabold text-guardian-text-primary mb-3">
          {t("guardian.gallery")}
        </Text>
      </TouchableOpacity>
      <View onLayout={(e) => setRowWidth(e?.nativeEvent?.layout?.width ?? 0)}>
        <TouchableOpacity onPress={navigateToGallery} activeOpacity={0.9}>
          <View className="bg-background-neutral rounded-2xl overflow-hidden">
            {loading ? (
              <View
                style={{ width: galleryWidth, height: 200 }}
                className="items-center justify-center"
              >
                <ActivityIndicator color="#FCC101" />
              </View>
            ) : photos.length === 0 ? (
              <View
                style={{ width: galleryWidth, height: 200 }}
                className="items-center justify-center bg-guardian-bg-secondary"
              >
                <Text className="text-sm text-guardian-text-neutral">
                  {t("guardian.gallery_empty", "등록된 사진이 없습니다.")}
                </Text>
              </View>
            ) : photos.length === 1 ? (
              <Image
                source={{ uri: photos[0].image }}
                style={{ width: galleryWidth, height: 200 }}
                resizeMode="cover"
              />
            ) : (
              <>
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const x = event.nativeEvent.contentOffset.x;
                    setCurrentImage(Math.round(x / galleryWidth));
                  }}
                  scrollEventThrottle={16}
                >
                  {photos.map((photo) => (
                    <Image
                      key={photo.id ?? photo.documentId}
                      source={{ uri: photo.image }}
                      style={{ width: galleryWidth, height: 200 }}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                <View className="absolute bottom-3 right-3 bg-black/40 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {currentImage + 1} / {photos.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
