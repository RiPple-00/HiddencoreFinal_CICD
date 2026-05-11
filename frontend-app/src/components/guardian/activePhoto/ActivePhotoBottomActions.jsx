import { Pressable, View } from 'react-native';
import Text from "../../Text";

function ActivePhotoBottomActions() {
  return (
    <View className="mt-4 flex-row gap-[10px]">

      <Pressable className="flex-1 rounded-xl py-3 px-2 items-center justify-center bg-guardian-button-secondary border border-guardian-button-primary">
        <Text className="text-[13px] font-bold text-guardian-text-primary">
          ♡ 좋아요 누른 사진들
        </Text>
      </Pressable>

      <Pressable className="flex-1 rounded-xl py-3 px-2 items-center justify-center bg-guardian-button-primary">
        <Text className="text-[13px] font-bold text-guardian-text-primary">
          □ 전체 사진 보기
        </Text>
      </Pressable>

    </View>
  );
}

export default ActivePhotoBottomActions;