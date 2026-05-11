import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { boardStyles } from "../../../styles/guardianBoard.styles";
import { BOARD_MENUS } from "../../../utils/guardianBoardUtils";

export default function BoardTabs({ selectedBoard, onChangeBoard }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={boardStyles.boardMenuRow}
    >
      {BOARD_MENUS.map((menu) => (
        <TouchableOpacity
          key={menu.value}
          style={[
            boardStyles.boardMenuButton,
            selectedBoard === menu.value && boardStyles.boardMenuButtonActive,
          ]}
          onPress={() => onChangeBoard(menu.value)}
        >
          <Text
            style={[
              boardStyles.boardMenuText,
              selectedBoard === menu.value && boardStyles.boardMenuTextActive,
            ]}
          >
            {menu.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}