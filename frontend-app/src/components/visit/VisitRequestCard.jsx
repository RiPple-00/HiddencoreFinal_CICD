// 날짜/시간
// 환자명
// 병실
// 면회 유형
// 상태 배지
// 클릭 시 상세 페이지로 이동

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const VisitRequestCard = ({ visit }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/visit/${visit.id}`);
    };

    return (
        <Card onClick={handleClick}>
            <VisitInfo>
                <VisitDate>{visit.date}</VisitDate>
                <VisitPatient>{visit.patientName}</VisitPatient>
                <VisitRoom>{visit.room}</VisitRoom> 
                <VisitType>{visit.type}</VisitType>
            </VisitInfo>
        </Card>
    );
};

const Card = styled.div`
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;    
    cursor: pointer;
    transition: box-shadow 0.3s ease;
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const VisitInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const VisitDate = styled.span`
    font-size: 14px;
    color: #888;
`;

const VisitPatient = styled.span`
    font-size: 16px;
    font-weight: bold;
    color: #333;
`;

const VisitRoom = styled.span`
    font-size: 14px;
    color: #555;
`;

const VisitType = styled.span`
    font-size: 14px;
    color: #555;
`;

export default VisitRequestCard;