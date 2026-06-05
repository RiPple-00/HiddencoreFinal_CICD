import { Image, Pressable, View } from 'react-native';
import Text from '../../Text';

function GallerySlotCard({ slotIndex, photo, onClick }) {
  const filled = Boolean(photo?.image);

  if (!filled) {
    return (
      <View
        className="w-[48%] min-h-[168px] rounded-2xl border border-dashed border-guardian-button-secondary bg-guardian-bg-secondary/40 p-3 justify-center items-center"
      >
        <Text className="text-xs font-bold text-guardian-text-neutral mb-1">
          {slotIndex}번
        </Text>
        <Text className="text-[11px] text-guardian-text-neutral text-center leading-4">
          사진 대기 중
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      className="w-[48%] overflow-hidden rounded-2xl bg-background-neutral"
      style={{ elevation: 2 }}
      onPress={() => onClick?.(photo)}
    >
      <View className="absolute top-2 left-2 z-10 rounded-full bg-guardian-button-secondary px-2 py-[2px]">
        <Text className="text-[10px] font-bold text-guardian-text-primary">{slotIndex}번</Text>
      </View>
      <Image source={{ uri: photo.image }} className="w-full h-24" />
      <View className="p-3 gap-[2px]">
        <Text className="text-sm font-bold text-guardian-text-primary" numberOfLines={1}>
          {photo.title}
        </Text>
        <Text className="text-[11px] text-guardian-text-secondary">{photo.time}</Text>
        <Text className="text-[11px] leading-4 text-guardian-text-neutral" numberOfLines={3}>
          {photo.desc}
        </Text>
      </View>
    </Pressable>
  );
}

export default GallerySlotCard;
