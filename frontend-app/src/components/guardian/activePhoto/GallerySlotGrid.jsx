import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from '../../Text';
import GallerySlotCard from './GallerySlotCard';
import ActivityPhotoDetailModal from './ActivityPhotoDetailModal';
import { GALLERY_PHOTOS_PER_PAGE } from '../../../utils/galleryPhotoUtils';

function GallerySlotGrid({ photos = [], filledCount = 0 }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalCount = Math.max(filledCount, photos.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / GALLERY_PHOTOS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const pagePhotos = useMemo(() => {
    const start = currentPage * GALLERY_PHOTOS_PER_PAGE;
    return Array.from({ length: GALLERY_PHOTOS_PER_PAGE }, (_, index) => {
      const globalIndex = start + index;
      const photo = photos[globalIndex] ?? null;
      return {
        photo,
        slotIndex: globalIndex + 1,
      };
    });
  }, [photos, currentPage]);

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <>
      <View className="mb-3 flex-row justify-between items-center">
        <Text className="text-base font-bold text-guardian-text-primary">활동 기록</Text>
        <Text className="text-xs text-guardian-text-neutral">
          총 {totalCount}개 · {currentPage + 1}/{totalPages}페이지
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {pagePhotos.map(({ photo, slotIndex }) => (
          <GallerySlotCard
            key={`gallery-slot-${slotIndex}`}
            slotIndex={slotIndex}
            photo={photo}
            onClick={setSelectedPhoto}
          />
        ))}
      </View>

      {totalPages > 1 ? (
        <View className="mt-4 flex-row items-center justify-center gap-3">
          <Pressable
            className={`rounded-lg px-4 py-2 ${
              canGoPrev ? 'bg-guardian-button-secondary' : 'bg-guardian-bg-secondary/60'
            }`}
            onPress={() => canGoPrev && setCurrentPage((page) => page - 1)}
            disabled={!canGoPrev}
          >
            <Text
              className={`text-sm font-bold ${
                canGoPrev ? 'text-guardian-text-primary' : 'text-guardian-text-neutral'
              }`}
            >
              이전
            </Text>
          </Pressable>

          <Text className="text-sm text-guardian-text-neutral min-w-[72px] text-center">
            {currentPage + 1} / {totalPages}
          </Text>

          <Pressable
            className={`rounded-lg px-4 py-2 ${
              canGoNext ? 'bg-guardian-button-secondary' : 'bg-guardian-bg-secondary/60'
            }`}
            onPress={() => canGoNext && setCurrentPage((page) => page + 1)}
            disabled={!canGoNext}
          >
            <Text
              className={`text-sm font-bold ${
                canGoNext ? 'text-guardian-text-primary' : 'text-guardian-text-neutral'
              }`}
            >
              다음
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ActivityPhotoDetailModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSave={() => setSelectedPhoto(null)}
      />
    </>
  );
}

export default GallerySlotGrid;
