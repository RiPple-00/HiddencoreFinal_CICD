import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import { getGuardianPosts } from "@/api/guardian/guardianApi";
import { FACILITY_ID, rowId } from "@/utils/guardianBoardUtils";

function formatMainNoticeDate(dateText) {
  if (!dateText) return "날짜 미정";

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default function GuardianBoard({ navigation }) {
  const [noticePosts, setNoticePosts] = useState([]);

  useEffect(() => {
    const fetchMainNotices = async () => {
      try {
        const response = await getGuardianPosts(FACILITY_ID);

        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

        const boardOnlyPosts = list.filter((post) =>
          ["URGENT", "CLINICAL", "ADMIN", "FACILITY", "GENERAL"].includes(
            post.type,
          ),
        );

        setNoticePosts(boardOnlyPosts);
      } catch (error) {
        console.error("메인 공지사항 조회 실패", error);
        setNoticePosts([]);
      }
    };

    fetchMainNotices();
  }, []);

  const mainNoticePosts = useMemo(() => {
    return [...noticePosts]
      .sort((a, b) => {
        const aUrgent = a.type === "URGENT";
        const bUrgent = b.type === "URGENT";

        if (aUrgent !== bUrgent) {
          return aUrgent ? -1 : 1;
        }

        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();

        return bTime - aTime;
      })
      .slice(0, 2);
  }, [noticePosts]);

  return (
    <View className="mx-5 mt-5">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-extrabold text-guardian-text-primary">
          공지사항
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
          <Text className="text-sm font-bold text-guardian-text-secondary">
            전체보기
          </Text>
        </TouchableOpacity>
      </View>
      {mainNoticePosts.length === 0 ? (
        <TouchableOpacity className="flex-row justify-between items-center bg-background-neutral px-4 py-4 rounded-2xl mb-2 border border-guardian-button-secondary">
          <View>
            <Text className="text-sm font-bold text-guardian-text-primary">
              등록된 공지사항이 없습니다.
            </Text>
            <Text className="text-xs text-guardian-text-neutral mt-1">-</Text>
          </View>
          <Text className="text-xl text-guardian-text-secondary">›</Text>
        </TouchableOpacity>
      ) : (
        mainNoticePosts.map((post) => (
          <TouchableOpacity
            key={rowId(post) ?? post.title}
            className="flex-row justify-between items-center bg-background-neutral px-4 py-4 rounded-2xl mb-2 border border-guardian-button-secondary"
            onPress={() => navigation.navigate("Notice")}
          >
            <View className="flex-1 pr-2">
              <Text
                className="text-sm font-bold text-guardian-text-primary"
                numberOfLines={1}
              >
                {post.type === "URGENT" ? "🚨 " : ""}
                {post.title}
              </Text>
              <Text className="text-xs text-guardian-text-neutral mt-1">
                {formatMainNoticeDate(post.updatedAt ?? post.createdAt)}
              </Text>
            </View>
            <Text className="text-xl text-guardian-text-secondary">›</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}
