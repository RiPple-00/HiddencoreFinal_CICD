import React, { useState } from "react";
import { View } from "react-native";
import Text from "@/components/Text";
import { boardStyles } from "../../styles/guardianBoard.styles";
import BoardTabs from "../../components/guardian/board/BoardTabs";
import GuardianBoardSection from "../../components/guardian/board/GuardianBoardSection";
import GuardianProgramSection from "./GuardianProgramApplicationPage";

export default function NoticePage() {
  const [selectedBoard, setSelectedBoard] = useState("ALL");

  return (
    <View className="flex-1 bg-guardian-bg-primary">
      <View className="px-5 pt-6 pb-2">
        <Text className="text-[22px] font-extrabold text-guardian-text-primary">공지사항</Text>
        <Text className="text-sm text-guardian-text-neutral mt-1">
          병원 공지, 프로그램 안내, 자유게시판을 확인할 수 있어요.
        </Text>
      </View>

      <View style={boardStyles.boardTopArea}>
        <BoardTabs selectedBoard={selectedBoard} onChangeBoard={setSelectedBoard} />
      </View>

      {selectedBoard === "PROGRAM" ? (
        <GuardianProgramSection />
      ) : (
        <GuardianBoardSection selectedBoard={selectedBoard} />
      )}
    </View>
  );
}
