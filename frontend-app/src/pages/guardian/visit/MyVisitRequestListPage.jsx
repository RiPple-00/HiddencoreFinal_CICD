// 보호자 신청 내역 페이지
// 보호자 신청 목록 조회
// VisitRequestCard로 렌더링
// 상태별 신청 확인

import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, } from "react-native";
import Text from "../../components/Text";
import { getVisitRequests } from "../../api/visitApi";
import VisitRequestCard from "../../components/VisitRequestCard";

function MyVisitRequestListPage() {
  const [visitRequests, setVisitRequests] = useState([]);

  useEffect(() => {
    const fetchVisitRequests = async () => {
      try {
        const response = await getVisitRequests();
        setVisitRequests(response.data);
      } catch (error) {
        console.error("방문 신청 목록 조회 실패:", error);
      }
    };

    fetchVisitRequests();
  }, []);

  return (
    // 전체 배경: 보호자 기본 배경색
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">
      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>

        {/* 페이지 제목 */}
        <Text className="text-2xl font-extrabold text-guardian-text-primary mb-5">
          내 방문 신청 내역
        </Text>

        {visitRequests.length === 0 ? (
          // 신청 내역 없을 때 안내 메시지
          <Text className="text-base text-guardian-text-neutral opacity-60">
            방문 신청 내역이 없습니다.
          </Text>
        ) : (
          // 신청 목록: 카드 간격 15px
          <View className="flex-col gap-[15px] pb-10">
            {visitRequests.map((request) => (
              <VisitRequestCard key={request.id} request={request} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

export default MyVisitRequestListPage;