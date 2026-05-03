// 선택한 날짜/시간 표시
// 환자명 표시해도 됨

import React from 'react';

const VisitInfoCard = ({ visitInfo }) => {
    const { date, time, patientName } = visitInfo;
    return (
        <div className="visit-info-card">
            <h2 className="section-title">방문 정보</h2>
            <div className="visit-details">
                <p><strong>환자명:</strong> {patientName}</p>
                <p><strong>방문 날짜:</strong> {date}</p>
                <p><strong>방문 시간:</strong> {time}</p>
            </div>
        </div>
    );
}

export default VisitInfoCard;