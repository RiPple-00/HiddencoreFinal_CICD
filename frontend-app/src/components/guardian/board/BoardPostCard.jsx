import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { boardStyles } from "../../../styles/guardianBoard.styles";
import {
  BADGE_LABELS,
  formatBoardDate,
  rowId,
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

export default function BoardPostCard({ post, onPress }) {
  return (
    <TouchableOpacity
      key={rowId(post) ?? post.title}
      style={boardStyles.postCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={boardStyles.postTopRow}>
        <View style={getBadgeStyle(post.type)}>
          <Text style={getBadgeTextStyle(post.type)}>
            {BADGE_LABELS[post.type] ?? "일반"}
          </Text>
        </View>

        {post.isPinned && (
          <View style={boardStyles.pinnedBadge}>
            <Text style={boardStyles.pinnedBadgeText}>고정</Text>
          </View>
        )}
      </View>

      <Text style={boardStyles.postTitle} numberOfLines={2}>
        {post.title}
      </Text>

      {!!post.content && (
        <Text style={boardStyles.postContent} numberOfLines={2}>
          {post.content}
        </Text>
      )}

      <View style={boardStyles.postMetaRow}>
        <Text style={boardStyles.postMetaText}>{post.authorName ?? "-"}</Text>

        <Text style={boardStyles.postMetaText}>
          {formatBoardDate(post.updatedAt ?? post.createdAt)}
        </Text>

        <Text style={boardStyles.postMetaText}>
          조회 {post.views ?? post.viewCount ?? 0}
        </Text>
      </View>
    </TouchableOpacity>
  );
}