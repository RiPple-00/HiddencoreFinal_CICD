import { View, } from "react-native";
import Text from "../../components/Text";

export default function ReportPage() {
  return (
    <View className="flex-1 justify-center items-center bg-guardian-bg-primary">
      <Text className="text-[22px] font-extrabold text-guardian-text-primary">
        동의서 확인 페이지
      </Text>
    </View>
  );
}