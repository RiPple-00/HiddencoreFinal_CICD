// 원무과 상단 필터바
// 버튼 = 전체, 대기, 승인, 반려

import React from 'react';

const AdminVisitFilterBar = ({ filter, setFilter }) => {
  const filters = ['전체', '대기', '승인', '반려'];
    return (
        <div className="admin-visit-filter-bar flex space-x-4 mb-4">
            {filters.map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md ${
                        filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
    );
}

export default AdminVisitFilterBar;