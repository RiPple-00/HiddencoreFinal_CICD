import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createGuardianFreePost,
  getGuardianPost,
  getGuardianPosts,
} from "../../../api/guardian/guardianApi";
import { boardStyles } from "../../../styles/guardianBoard.styles";
import { G } from "../../../styles/guardianTheme";
import {
  BOARD_MENUS,
  FACILITY_ID,
  normalizePostList,
  rowId,
} from "../../../utils/guardianBoardUtils";
import BoardPostCard from "./BoardPostCard";
import BoardDetailModal from "./BoardDetailModal";
import FreePostWriteModal from "./FreePostWriteModal";

export default function GuardianBoardSection({ selectedBoard }) {
  const [posts, setPosts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getGuardianPosts(FACILITY_ID);
      setPosts(normalizePostList(response.data));
    } catch (error) {
      console.error("게시글 목록 조회 실패", error);
      Alert.alert(
        "조회 실패",
        error?.response?.data?.message || "게시글 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    const currentMenu = BOARD_MENUS.find(
      (menu) => menu.value === selectedBoard,
    );

    let result = posts;

    if (currentMenu?.types) {
      result = result.filter((post) => currentMenu.types.includes(post.type));
    }

    const keyword = searchKeyword.trim().toLowerCase();

    if (keyword) {
      result = result.filter((post) => {
        const title = post.title?.toLowerCase() ?? "";
        const content = post.content?.toLowerCase() ?? "";
        const authorName = post.authorName?.toLowerCase() ?? "";

        return (
          title.includes(keyword) ||
          content.includes(keyword) ||
          authorName.includes(keyword)
        );
      });
    }

    return result;
  }, [posts, selectedBoard, searchKeyword]);

  const selectedBoardLabel =
    BOARD_MENUS.find((menu) => menu.value === selectedBoard)?.label ??
    "전체게시판";

  const openPostDetail = async (post) => {
    const postId = rowId(post);

    if (!postId) return;

    try {
      setDetailModalVisible(true);
      setDetailLoading(true);
      setSelectedPost(null);

      const response = await getGuardianPost(postId, FACILITY_ID);
      setSelectedPost(response.data);
    } catch (error) {
      console.error("게시글 상세 조회 실패", error);
      Alert.alert(
        "조회 실패",
        error?.response?.data?.message || "게시글을 불러오지 못했습니다.",
      );
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedPost(null);
  };

  const openWriteModal = () => {
    setWriteTitle("");
    setWriteContent("");
    setWriteModalVisible(true);
  };

  const closeWriteModal = () => {
    if (submitting) return;

    setWriteModalVisible(false);
    setWriteTitle("");
    setWriteContent("");
  };

  const submitFreePost = async () => {
    const title = writeTitle.trim();
    const content = writeContent.trim();

    if (!title) {
      Alert.alert("입력 확인", "제목을 입력해주세요.");
      return;
    }

    if (!content) {
      Alert.alert("입력 확인", "내용을 입력해주세요.");
      return;
    }

    const requestData = {
      type: "GENERAL",
      title,
      content,
      attachmentUrls: "[]",
      status: "ACTIVE",
      isPinned: false,
      reservationAt: null,
      scheduledAt: null,
      scheduleEndAt: null,
    };

    try {
      setSubmitting(true);

      await createGuardianFreePost(requestData, FACILITY_ID);

      Alert.alert("등록 완료", "자유게시판 글이 등록되었습니다.");

      setWriteModalVisible(false);
      setWriteTitle("");
      setWriteContent("");

      await fetchPosts();
    } catch (error) {
      console.error("자유게시판 글 작성 실패", error);
      Alert.alert(
        "등록 실패",
        error?.response?.data?.message || "게시글 등록에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={boardStyles.boardTopArea}>
        <View style={boardStyles.boardSearchBox}>
          <TextInput
            style={boardStyles.boardSearchInput}
            placeholder="제목, 내용, 작성자 검색"
            placeholderTextColor="#94A3B8"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />

          {searchKeyword.length > 0 && (
            <TouchableOpacity
              style={boardStyles.searchClearButton}
              onPress={() => setSearchKeyword("")}
            >
              <Text style={boardStyles.searchClearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedBoard === "GENERAL" && (
          <TouchableOpacity style={boardStyles.writeButton} onPress={openWriteModal}>
            <Text style={boardStyles.writeButtonText}>+ 자유게시판 글쓰기</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={boardStyles.loadingBox}>
          <ActivityIndicator size="large" color={G.textSecondary} />
          <Text style={boardStyles.loadingText}>게시글을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={boardStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
          }
        >
          <View style={boardStyles.boardSectionHeader}>
            <Text style={boardStyles.boardSectionTitle} numberOfLines={1}>
              {selectedBoardLabel}
            </Text>
            <Text style={boardStyles.boardSectionCount}>
              {filteredPosts.length}개
            </Text>
          </View>

          {filteredPosts.length === 0 ? (
            <View style={boardStyles.emptyBox}>
              <Text style={boardStyles.emptyText}>게시글이 없습니다.</Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <BoardPostCard
                key={rowId(post) ?? post.title}
                post={post}
                onPress={() => openPostDetail(post)}
              />
            ))
          )}
        </ScrollView>
      )}

      <BoardDetailModal
        visible={detailModalVisible}
        loading={detailLoading}
        post={selectedPost}
        onClose={closeDetailModal}
      />

      <FreePostWriteModal
        visible={writeModalVisible}
        title={writeTitle}
        content={writeContent}
        submitting={submitting}
        onChangeTitle={setWriteTitle}
        onChangeContent={setWriteContent}
        onClose={closeWriteModal}
        onSubmit={submitFreePost}
      />
    </>
  );
}