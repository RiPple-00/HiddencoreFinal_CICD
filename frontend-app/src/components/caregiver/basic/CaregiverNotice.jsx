import React from "react";
import { ActivityIndicator, View } from "react-native";
import Text from "../../Text";

function formatNoticeDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 공지사항 리스트.
 * - notices: API PostListResponse[] | null(로딩 중) | [](빈 결과)
 * - loading: boolean
 */
export default function CaregiverNotice({ notices = null, loading = false }) {
  return (
    <View className="mx-4 mt-4 mb-4">
      <Text className="font-bold text-caregiver-text-primary mb-2">
        공지사항
      </Text>

      {loading ? (
        <View className="items-center py-4">
          <ActivityIndicator color="#005E53" />
        </View>
      ) : !notices || notices.length === 0 ? (
        <View className="bg-background-neutral rounded-xl px-4 py-3 border border-caregiver-bg-secondary">
          <Text className="text-sm text-caregiver-text-secondary text-center">
            등록된 공지사항이 없습니다.
          </Text>
        </View>
      ) : (
        notices.map((notice) => (
          <View
            key={notice.id ?? notice.postId}
            className="flex-row justify-between items-center bg-background-neutral rounded-xl px-4 py-3 mb-2 border border-caregiver-bg-secondary"
          >
            <Text
              className="text-sm font-bold text-caregiver-text-primary flex-1 mr-3"
              numberOfLines={1}
            >
              {notice.title}
            </Text>
            <Text className="text-xs text-caregiver-text-secondary shrink-0">
              {formatNoticeDate(notice.updatedAt ?? notice.createdAt)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
