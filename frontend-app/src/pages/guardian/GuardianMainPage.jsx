import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GuardianGallery from "@/components/guardian/basic/GuardianGallery";
import GuardianButton from "@/components/guardian/basic/GuardianButton";
import GuardianMeal from "@/components/guardian/basic/GuardianMeal";
import GuardianBoard from "@/components/guardian/basic/GuardianBoard";

export default function GuardianMainPage({ navigation }) {
  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <GuardianGallery navigation={navigation} />
        <GuardianButton navigation={navigation} />
        <GuardianMeal />
        <GuardianBoard navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}
