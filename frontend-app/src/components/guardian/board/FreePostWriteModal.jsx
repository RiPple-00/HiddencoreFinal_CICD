import React from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { boardStyles } from "../../../styles/guardianBoard.styles";

export default function FreePostWriteModal({
  visible,
  title,
  content,
  submitting,
  onChangeTitle,
  onChangeContent,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={boardStyles.writeModalOverlay}>
        <View style={boardStyles.writeModal}>
          <View style={boardStyles.writeModalHeader}>
            <Text style={boardStyles.detailModalTitle}>자유게시판 글쓰기</Text>

            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Text style={boardStyles.detailModalClose}>닫기</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={boardStyles.writeInput}
            placeholder="제목을 입력해주세요."
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={onChangeTitle}
          />

          <TextInput
            style={boardStyles.writeTextArea}
            placeholder="내용을 입력해주세요."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={onChangeContent}
            multiline
            textAlignVertical="top"
          />

          <View style={boardStyles.writeButtonRow}>
            <TouchableOpacity
              style={boardStyles.writeCancelButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={boardStyles.modalCancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                boardStyles.writeSubmitButton,
                submitting && boardStyles.applyButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={submitting}
            >
              <Text style={boardStyles.modalConfirmText}>
                {submitting ? "등록 중..." : "등록"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}