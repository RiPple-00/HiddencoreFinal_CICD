import { useNavigate } from 'react-router-dom';

// 타입 선택 버튼 목록
// disabled: true면 화면에 보이되 클릭 불가 (미확정 타입)
const TYPE_BUTTONS = [
  { label: '공지사항 작성', type: 'NOTICE', officialOnly: true },
  { label: '프로그램 작성', type: 'PROGRAM', officialOnly: true },
  { label: '게시글 작성', type: 'GENERAL', officialOnly: false },
];

const ListIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ shrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

/**
 * 게시글 작성 페이지 좌측 사이드바
 */
const CreateSidebar = ({ postType, onTypeChange, facilityId, title, content, canWriteOfficial }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-52 shrink-0 flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-medium mb-2 px-2">새 게시글 작성</p>

      {/* 타입 선택 버튼 */}
      {TYPE_BUTTONS.map((btn) => {
        const disabled = btn.officialOnly && !canWriteOfficial;
        return (
          <button
            key={btn.type}
            onClick={() => !disabled && onTypeChange(btn.type)}
            disabled={disabled}
            className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors
        ${disabled
                ? 'text-gray-300 cursor-not-allowed'
                : postType === btn.type
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }
      `}
          >
            <ListIcon />
            {btn.label}
          </button>
        );
      })}

      <hr className="border-gray-200 my-2" />

      {/* 작성 이력 */}
      <button
        onClick={() => navigate(`/facilities/${facilityId}/board/history`)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        작성 이력
      </button>

      {/* 보관함 */}
      <button
        onClick={() => navigate(`/facilities/${facilityId}/board/draft`)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        보관함
      </button>

      {/* Quick Preview */}
      <div className="mt-4 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-400 font-medium mb-2">QUICK PREVIEW</p>
        <div className="bg-gray-50 rounded min-h-24 flex flex-col items-center justify-center p-3">
          {title || content ? (
            <div className="w-full text-left">
              {title && <p className="text-xs font-medium text-gray-700 truncate">{title}</p>}
              {content && <p className="text-xs text-gray-400 mt-1 line-clamp-4">{content}</p>}
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-gray-400 text-center">
                작성 중인 내용은 실시간으로 보존되며, 게시 전 미리보기를 통해 레이아웃을 확인할 수 있습니다.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CreateSidebar;
