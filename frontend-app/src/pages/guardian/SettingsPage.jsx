import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";

const LANGUAGE_OPTIONS = [
  { value: "ko", labelKey: "settings.languageOptions.ko", fallback: "한국어" },
  { value: "en", labelKey: "settings.languageOptions.en", fallback: "English" },
  { value: "ja", labelKey: "settings.languageOptions.ja", fallback: "日本語" },
];

export default function SettingsPage({ navigation }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useI18n();

  return (
    <View className="flex-1 bg-guardian-bg-primary px-5 pt-20">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
        <Text className="text-base font-semibold text-guardian-text-primary">
          {t("settings.back", "뒤로")}
        </Text>
      </TouchableOpacity>

      <Text className="text-2xl font-extrabold text-guardian-text-primary mb-2">
        {t("settings.title", "설정")}
      </Text>
      <Text className="text-sm text-guardian-text-secondary mb-6">
        {t("settings.description", "앱 표시 언어를 선택하세요.")}
      </Text>

      <View className="rounded-3xl bg-white p-5 shadow-sm">
        <Text className="text-lg font-semibold text-guardian-text-primary mb-4">
          {t("settings.language", "언어 설정")}
        </Text>

        {LANGUAGE_OPTIONS.map((option) => {
          const selected = language === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setLanguage(option.value)}
              style={[
                styles.option,
                selected ? styles.optionSelected : styles.optionNormal,
              ]}
            >
              <Text className="text-base font-medium text-guardian-text-primary">
                {t(option.labelKey, option.fallback)}
              </Text>
              <Text className="text-sm text-guardian-text-secondary">
                {selected ? t("settings.current", "현재 선택됨") : null}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfeff",
  },
  optionNormal: {
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
});
