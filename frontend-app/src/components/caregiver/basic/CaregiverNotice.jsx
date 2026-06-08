import React, { useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import Text from "../../Text";
import { getCaregiverNoticeDetail } from "../../../api/noticeApi";
import BoardDetailModal from "../../guardian/board/BoardDetailModal";

function formatNoticeDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function CaregiverNotice({ notices = null, loading = false }) {
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const openDetail = async (notice) => {
    const postId = notice.id ?? notice.postId;
    if (!postId) return;
    setDetailVisible(true);
    setDetailLoading(true);
    setSelectedPost(null);
    try {
      const res = await getCaregiverNoticeDetail(postId);
      setSelectedPost(res.data);
    } catch (e) {
      Alert.alert("조회 실패", e?.response?.data?.message ?? "게시글을 불러오지 못했습니다.");
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

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
          <TouchableOpacity
            key={notice.id ?? notice.postId}
            activeOpacity={0.7}
            onPress={() => openDetail(notice)}
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
          </TouchableOpacity>
        ))
      )}

      <BoardDetailModal
        visible={detailVisible}
        loading={detailLoading}
        post={selectedPost}
        onClose={() => { setDetailVisible(false); setSelectedPost(null); }}
      />
    </View>
  );
}
