/**
 * 공통 탭 컴포넌트
 * 탭 목록을 외부에서 주입받아 게시판 종류에 상관없이 재사용
 *
 * @param {Array<{ label: string, type: string|null }>} tabs - 탭 목록
 * @param {string|null} currentTab - 현재 선택된 탭 type
 * @param {function} onChange - 탭 변경 콜백 (type 전달)
 */
const FilterTab = ({ tabs = [], currentTab, onChange }) => {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = tab.type === currentTab;
        return (
          <button
            key={tab.label}
            onClick={() => onChange(tab.type)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors
              ${isActive
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTab;
