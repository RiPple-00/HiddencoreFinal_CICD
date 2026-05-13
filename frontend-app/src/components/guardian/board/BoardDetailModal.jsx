import React from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { boardStyles } from "../../../styles/guardianBoard.styles";
import { G } from "../../../styles/guardianTheme";
import {
  BADGE_LABELS,
  formatBoardDateTime,
  parseAttachmentUrls,
} from "../../../utils/guardianBoardUtils";

const getBadgeStyle = (type) => {
  if (type === "URGENT") {
    return [boardStyles.boardBadge, boardStyles.boardBadgeUrgent];
  }

  if (type === "APPLY" || type === "REVIEW") {
    return [boardStyles.boardBadge, boardStyles.boardBadgeProgram];
  }

  if (type === "GENERAL") {
    return [boardStyles.boardBadge, boardStyles.boardBadgeGeneral];
  }

  return [boardStyles.boardBadge, boardStyles.boardBadgeNotice];
};

const getBadgeTextStyle = (type) => {
  if (type === "URGENT") {
    return [boardStyles.boardBadgeText, boardStyles.boardBadgeTextUrgent];
  }

  if (type === "APPLY" || type === "REVIEW") {
    return [boardStyles.boardBadgeText, boardStyles.boardBadgeTextProgram];
  }

  if (type === "GENERAL") {
    return [boardStyles.boardBadgeText, boardStyles.boardBadgeTextGeneral];
  }

  return [boardStyles.boardBadgeText, boardStyles.boardBadgeTextNotice];
};

export default function BoardDetailModal({
  visible,
  loading,
  post,
  onClose,
}) {
  const attachments = parseAttachmentUrls(post?.attachmentUrls);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={boardStyles.detailModalOverlay}>
        <View style={boardStyles.detailSheet}>
          <View style={boardStyles.detailHandle} />

          <View style={boardStyles.detailModalHeader}>
            <Text style={boardStyles.detailModalTitle}>게시글 상세</Text>

            <TouchableOpacity
              style={boardStyles.detailCloseButton}
              onPress={onClose}
            >
              <Text style={boardStyles.detailCloseButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={boardStyles.detailLoadingBox}>
              <ActivityIndicator size="large" color={G.textSecondary} />
              <Text style={boardStyles.loadingText}>불러오는 중...</Text>
            </View>
          ) : post ? (
            <ScrollView
              style={boardStyles.detailScroll}
              contentContainerStyle={boardStyles.detailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={boardStyles.detailHeroCard}>
                <View style={boardStyles.detailBadgeRow}>
                  <View style={getBadgeStyle(post.type)}>
                    <Text style={getBadgeTextStyle(post.type)}>
                      {BADGE_LABELS[post.type] ?? "일반"}
                    </Text>
                  </View>

                  {post.recruitStatus && (
                    <View style={boardStyles.recruitBadge}>
                      <Text style={boardStyles.recruitBadgeText}>
                        {post.recruitStatus}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={boardStyles.detailTitle}>{post.title}</Text>
              </View>

              <View style={boardStyles.detailInfoCard}>
                <View style={boardStyles.detailInfoRow}>
                  <Text style={boardStyles.detailInfoLabel}>작성자</Text>
                  <Text style={boardStyles.detailInfoValue}>
                    {post.authorName ?? "-"}
                  </Text>
                </View>

                <View style={boardStyles.detailInfoRow}>
                  <Text style={boardStyles.detailInfoLabel}>작성일</Text>
                  <Text style={boardStyles.detailInfoValue}>
                    {formatBoardDateTime(post.createdAt)}
                  </Text>
                </View>

                <View style={boardStyles.detailInfoRow}>
                  <Text style={boardStyles.detailInfoLabel}>조회수</Text>
                  <Text style={boardStyles.detailInfoValue}>
                    {post.views ?? post.viewCount ?? 0}
                  </Text>
                </View>
              </View>

              <View style={boardStyles.detailContentCard}>
                <Text style={boardStyles.detailContentTitle}>내용</Text>
                <Text style={boardStyles.detailContent}>
                  {post.content || "내용이 없습니다."}
                </Text>
              </View>

              {attachments.length > 0 && (
                <View style={boardStyles.attachmentBox}>
                  <Text style={boardStyles.attachmentTitle}>첨부파일</Text>

                  {attachments.map((url, index) => (
                    <TouchableOpacity
                      key={`${url}-${index}`}
                      style={boardStyles.attachmentItem}
                      onPress={() => Linking.openURL(url)}
                    >
                      <Text
                        style={boardStyles.attachmentText}
                        numberOfLines={1}
                      >
                        📎 첨부파일 {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={boardStyles.emptyBox}>
              <Text style={boardStyles.emptyText}>
                게시글을 찾을 수 없습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}