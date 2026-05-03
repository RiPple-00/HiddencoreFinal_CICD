// 보호자 신청 내역 페이지
// 보호자 신청 목록 조회
// VisitRequestCard로 렌더링
// 상태별 신청 확인

import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
    <Container>
      <Title>내 방문 신청 내역</Title>
      {visitRequests.length === 0 ? (
        <Message>방문 신청 내역이 없습니다.</Message>
      ) : (
        <RequestList>
          {visitRequests.map((request) => (
            <VisitRequestCard key={request.id} request={request} />
          ))}
        </RequestList>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 20px;
`;
const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;
const Message = styled.p`
  font-size: 16px;
  color: #888;
`;
const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export default MyVisitRequestListPage;
