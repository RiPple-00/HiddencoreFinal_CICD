import { Image, Pressable, View } from 'react-native';
import Text from "../../Text";

function ActivityPhotoCard({ photo, onClick }) {
  return (
    <Pressable
      className="w-[48%] overflow-hidden rounded-2xl bg-background-neutral"
      style={{ elevation: 2 }}
      onPress={onClick}
    >
      <Image source={{ uri: photo.image }} className="w-full h-24" />
      <View className="p-3 gap-[2px]">
        <Text className="text-sm font-bold text-guardian-text-primary" numberOfLines={1}>
          {photo.title}
        </Text>
        <Text className="text-[11px] text-guardian-text-neutral">{photo.time}</Text>
        <Text className="text-[11px] leading-4 text-guardian-text-neutral" numberOfLines={2}>
          {photo.desc}
        </Text>
        <View className="items-end">
          <Text className="text-guardian-text-neutral opacity-30">♡</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default ActivityPhotoCard;