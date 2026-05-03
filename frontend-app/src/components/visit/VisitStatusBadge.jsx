import React from 'react';
import styled from 'styled-components'; 

// 상태 표시 배지

const VisitStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
        case '승인':
            return '#4CAF50'; // 초록색
        case '승인 대기':
            return '#FFC107'; // 노란색
        case '반려':
            return '#F44336'; // 빨간색
        default:
            return '#9E9E9E'; // 회색
    }
    };

    return (
        <Badge color={getStatusColor(status)}>
            {status}
        </Badge>
    );
};

const Badge = styled.span`
    display: inline-block;
    padding: 5px 10px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    background-color: ${props => props.color};
`;

export default VisitStatusBadge;