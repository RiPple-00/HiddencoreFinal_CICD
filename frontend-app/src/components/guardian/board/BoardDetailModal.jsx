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
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "../../../styles/guardianTheme";
import { C } from "../../../styles/caregiverTheme";
import {
  BADGE_LABELS,
  formatBoardDateTime,
  parseAttachmentUrls,
} from "../../../utils/guardianBoardUtils";

const GUARDIAN_COLORS = {
  overlayBg: "rgba(80, 49, 21, 0.55)",
  sheetBg: G.bgSecondary,
  handleColor: GMutedLight,
  headerBg: G.bgSecondary,
  titleColor: GInkSoft,
  closeBtnBg: GBorder,
  closeBtnText: GMuted,
  cardBg: G.backgroundNeutral,
  cardBorder: GBorder,
  labelColor: GMutedLight,
  valueColor: GInkSoft,
  contentTitleColor: GInkSoft,
  contentTextColor: GMuted,
  loadingColor: G.textSecondary,
  emptyTextColor: GMutedLight,
  attachTitleColor: GInkSoft,
  attachTextColor: G.textSecondary,
  badgeNoticeBg: G.buttonSecondary,
  badgeNoticeText: G.textSecondary,
  badgeProgramBg: G.successSecondary,
  badgeProgramText: G.successPrimary,
  badgeGeneralBg: G.bgSecondary,
  badgeGeneralText: GMuted,
  badgeUrgentBg: G.errorSecondary,
  badgeUrgentText: G.errorPrimary,
  recruitBadgeBg: "#FFF7E6",
  recruitBadgeText: "#D97706",
};

const CAREGIVER_COLORS = {
  overlayBg: "rgba(0, 94, 83, 0.55)",
  sheetBg: C.bgPrimary,
  handleColor: C.borderSoft,
  headerBg: C.bgPrimary,
  titleColor: C.textPrimary,
  closeBtnBg: C.borderRow,
  closeBtnText: C.textSecondary,
  cardBg: C.bgNeutral,
  cardBorder: C.borderSoft,
  labelColor: C.textSecondary,
  valueColor: C.textPrimary,
  contentTitleColor: C.textPrimary,
  contentTextColor: C.textNeutral,
  loadingColor: C.buttonPrimary,
  emptyTextColor: C.textSecondary,
  attachTitleColor: C.textPrimary,
  attachTextColor: C.buttonSecondary,
  badgeNoticeBg: C.bgSecondary,
  badgeNoticeText: C.textPrimary,
  badgeProgramBg: "rgba(0, 94, 83, 0.12)",
  badgeProgramText: C.buttonPrimary,
  badgeGeneralBg: C.bgSecondary,
  badgeGeneralText: C.textSecondary,
  badgeUrgentBg: "#FEECEB",
  badgeUrgentText: "#ED584C",
  recruitBadgeBg: C.bgSecondary,
  recruitBadgeText: C.buttonSecondary,
};

const getBadgeColors = (type, tc) => {
  if (type === "URGENT") return { bg: tc.badgeUrgentBg, text: tc.badgeUrgentText };
  if (type === "APPLY" || type === "REVIEW") return { bg: tc.badgeProgramBg, text: tc.badgeProgramText };
  if (type === "GENERAL") return { bg: tc.badgeGeneralBg, text: tc.badgeGeneralText };
  return { bg: tc.badgeNoticeBg, text: tc.badgeNoticeText };
};

export default function BoardDetailModal({
  visible,
  loading,
  post,
  onClose,
  variant = "guardian",
}) {
  const attachments = parseAttachmentUrls(post?.attachmentUrls);
  const tc = variant === "caregiver" ? CAREGIVER_COLORS : GUARDIAN_COLORS;
  const badge = post ? getBadgeColors(post.type, tc) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[boardStyles.detailModalOverlay, { backgroundColor: tc.overlayBg }]}>
        <View style={[boardStyles.detailSheet, { backgroundColor: tc.sheetBg }]}>
          <View style={[boardStyles.detailHandle, { backgroundColor: tc.handleColor }]} />

          <View style={[boardStyles.detailModalHeader, { backgroundColor: tc.headerBg }]}>
            <Text style={[boardStyles.detailModalTitle, { color: tc.titleColor }]}>
              게시글 상세
            </Text>
            <TouchableOpacity
              style={[boardStyles.detailCloseButton, { backgroundColor: tc.closeBtnBg }]}
              onPress={onClose}
            >
              <Text style={[boardStyles.detailCloseButtonText, { color: tc.closeBtnText }]}>×</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={boardStyles.detailLoadingBox}>
              <ActivityIndicator size="large" color={tc.loadingColor} />
              <Text style={[boardStyles.loadingText, { color: tc.labelColor }]}>불러오는 중...</Text>
            </View>
          ) : post ? (
            <ScrollView
              style={boardStyles.detailScroll}
              contentContainerStyle={boardStyles.detailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 제목 카드 */}
              <View style={[boardStyles.detailHeroCard, { backgroundColor: tc.cardBg }]}>
                <View style={boardStyles.detailBadgeRow}>
                  <View style={[boardStyles.boardBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[boardStyles.boardBadgeText, { color: badge.text }]}>
                      {BADGE_LABELS[post.type] ?? "일반"}
                    </Text>
                  </View>

                  {post.recruitStatus && (
                    <View style={[boardStyles.recruitBadge, { backgroundColor: tc.recruitBadgeBg }]}>
                      <Text style={[boardStyles.recruitBadgeText, { color: tc.recruitBadgeText }]}>
                        {post.recruitStatus}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[boardStyles.detailTitle, { color: tc.titleColor }]}>
                  {post.title}
                </Text>
              </View>

              {/* 작성자 / 날짜 / 조회수 */}
              <View style={[boardStyles.detailInfoCard, { backgroundColor: tc.cardBg, borderColor: tc.cardBorder }]}>
                <View style={boardStyles.detailInfoRow}>
                  <Text style={[boardStyles.detailInfoLabel, { color: tc.labelColor }]}>작성자</Text>
                  <Text style={[boardStyles.detailInfoValue, { color: tc.valueColor }]}>
                    {post.authorName ?? "-"}
                  </Text>
                </View>

                <View style={boardStyles.detailInfoRow}>
                  <Text style={[boardStyles.detailInfoLabel, { color: tc.labelColor }]}>작성일</Text>
                  <Text style={[boardStyles.detailInfoValue, { color: tc.valueColor }]}>
                    {formatBoardDateTime(post.createdAt)}
                  </Text>
                </View>

                <View style={boardStyles.detailInfoRow}>
                  <Text style={[boardStyles.detailInfoLabel, { color: tc.labelColor }]}>조회수</Text>
                  <Text style={[boardStyles.detailInfoValue, { color: tc.valueColor }]}>
                    {post.views ?? post.viewCount ?? 0}
                  </Text>
                </View>
              </View>

              {/* 내용 */}
              <View style={[boardStyles.detailContentCard, { backgroundColor: tc.cardBg, borderColor: tc.cardBorder }]}>
                <Text style={[boardStyles.detailContentTitle, { color: tc.contentTitleColor }]}>내용</Text>
                <Text style={[boardStyles.detailContent, { color: tc.contentTextColor }]}>
                  {post.content || "내용이 없습니다."}
                </Text>
              </View>

              {/* 첨부파일 */}
              {attachments.length > 0 && (
                <View style={[boardStyles.attachmentBox, { backgroundColor: tc.cardBg, borderColor: tc.cardBorder }]}>
                  <Text style={[boardStyles.attachmentTitle, { color: tc.attachTitleColor }]}>첨부파일</Text>

                  {attachments.map((url, index) => (
                    <TouchableOpacity
                      key={`${url}-${index}`}
                      style={[boardStyles.attachmentItem, { borderTopColor: tc.cardBorder }]}
                      onPress={() => Linking.openURL(url)}
                    >
                      <Text
                        style={[boardStyles.attachmentText, { color: tc.attachTextColor }]}
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
              <Text style={[boardStyles.emptyText, { color: tc.emptyTextColor }]}>
                게시글을 찾을 수 없습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
