import React from "react";
import styled from "styled-components";

// 면회 안내 문구
// 지각 시 불가 안내
// 병원 정책 안내

const VisitNoticeBox = () => {
  return (
    <VisitNoticeContainer>
      <NoticeTitle>면회 안내</NoticeTitle>
      <NoticeList>
        <NoticeItem>면회 시간은 10:00 ~ 18:00입니다.</NoticeItem>
        <NoticeItem>지각 시 면회가 불가할 수 있습니다.</NoticeItem>
        <NoticeItem>병원 정책에 따라 면회가 제한될 수 있습니다.</NoticeItem>
      </NoticeList>
    </VisitNoticeContainer>
  );
};

const VisitNoticeContainer = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const NoticeTitle = styled.h2`
  color: #333;
  margin-bottom: 10px;
`;

const NoticeList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
`;

const NoticeItem = styled.li`
  color: #555;
  margin-bottom: 5px;
`;

export default VisitNoticeBox;
