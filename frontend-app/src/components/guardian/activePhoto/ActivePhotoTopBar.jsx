import { Pressable, View } from 'react-native';
import Text from "../../Text";

function ActivePhotoTopBar({ title, onBack }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Pressable hitSlop={8} onPress={onBack}>
        <Text className="text-[28px] text-guardian-text-primary w-7">‹</Text>
      </Pressable>
      <Text className="text-lg font-bold text-guardian-text-primary">{title}</Text>
      <Text className="text-lg w-7 text-right">🔔</Text>
    </View>
  );
}

export default ActivePhotoTopBar;