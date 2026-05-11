import { Image, Modal, Pressable, View } from 'react-native';
import Text from "../../Text";

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80';
const FALLBACK_TITLE = '제목 없음';
const FALLBACK_DESC  = '내용이 없습니다.';
const FALLBACK_TIME  = '시간 정보 없음';

function getFirstFileUrl(fileUrls) {
  if (!fileUrls || typeof fileUrls !== 'string') return '';
  const [firstUrl] = fileUrls.split(',').map((url) => url.trim()).filter(Boolean);
  return firstUrl ?? '';
}

function normalizePhoto(photo) {
  if (!photo) return null;
  const imageUrl =
    photo.imageUrl ??
    photo.image ??
    photo.fileUrl ??
    getFirstFileUrl(photo.fileUrls) ??
    FALLBACK_IMAGE;
  const title = photo.title?.trim()   || FALLBACK_TITLE;
  const desc  = photo.content?.trim() || photo.desc?.trim() || FALLBACK_DESC;
  const time  = photo.time?.trim()    || photo.createdAt?.trim() || FALLBACK_TIME;
  return { imageUrl, title, desc, time, raw: photo };
}

function ActivityPhotoDetailModal({ photo, onClose, onSave }) {
  const normalizedPhoto = normalizePhoto(photo);

  return (
    <Modal
      visible={Boolean(normalizedPhoto)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/[0.45] justify-center items-center p-4">
        {/* maxWidth는 NativeWind에서 불안정하여 inline style 유지 */}
        <View className="w-full bg-background-neutral rounded-[28px] p-4" style={{ maxWidth: 330 }}>

          {/* 상단 액션 바 */}
          <View className="mb-3 flex-row justify-between items-center">
            <Pressable
              className="rounded-lg bg-guardian-button-primary px-3 py-1"
              onPress={() => onSave?.(normalizedPhoto?.raw)}
            >
              <Text className="text-guardian-text-primary text-xs font-bold">저장</Text>
            </Pressable>
            <Text className="text-guardian-text-neutral opacity-50">•••</Text>
            <Pressable onPress={onClose}>
              <Text className="text-[30px] leading-[30px] text-guardian-text-neutral opacity-50">×</Text>
            </Pressable>
          </View>

          {normalizedPhoto && (
            <>
              <Image
                source={{ uri: normalizedPhoto.imageUrl }}
                className="mb-4 w-full h-64 rounded-2xl"
              />
              <View className="gap-2">
                <Text className="text-2xl font-bold text-guardian-text-primary">
                  제목 : {normalizedPhoto.title}
                </Text>
                <Text className="text-sm text-guardian-text-neutral">
                  ◷ {normalizedPhoto.time}
                </Text>
                <Text className="text-base font-bold text-guardian-text-primary">내용 :</Text>
                <Text className="text-sm leading-[22px] text-guardian-text-neutral">
                  {normalizedPhoto.desc}
                </Text>
              </View>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
}

export default ActivityPhotoDetailModal;