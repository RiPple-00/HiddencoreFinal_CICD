import React, { useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../../styles/guardianProgram.styles";
import { boardStyles } from "../../styles/guardianBoard.styles"
import BoardTabs from "../../components/guardian/board/BoardTabs";
import GuardianBoardSection from "../../components/guardian/board/GuardianBoardSection";
import GuardianProgramSection from "../../components/guardian/program/GuardianProgramSection";

export default function NoticePage() {
  const [selectedBoard, setSelectedBoard] = useState("ALL");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>공지사항</Text>
        <Text style={styles.pageSubtitle}>
          병원 공지, 프로그램 안내, 자유게시판을 확인할 수 있어요.
        </Text>
      </View>

      <View style={boardStyles.boardTopArea}>
        <BoardTabs
          selectedBoard={selectedBoard}
          onChangeBoard={setSelectedBoard}
        />
      </View>

      {selectedBoard === "PROGRAM" ? (
        <GuardianProgramSection />
      ) : (
        <GuardianBoardSection selectedBoard={selectedBoard} />
      )}
    </View>
  );
}