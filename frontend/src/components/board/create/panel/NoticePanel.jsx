import { PanelHeader, PanelMeta, PanelActions } from './PanelBase';
import { TARGET_ROLES } from '../../../../utils/boardUtils';

/**
 * 공지사항 전용 우측 패널
 * 순서: 상단고정+게시상태 → 공개대상 → 작성자/수정일 → 게시팁 → 버튼
 */
const NoticePanel = ({ panelState, onPanelChange, onSaveDraft, onSubmit, onCancel, isSubmitting }) => {
  const {
    isPinned, publishType, reservationAt,
    targetRoles = [],
    authorName, updatedAt,
  } = panelState;

  const handleRoleToggle = (value) => {
    const updated = targetRoles.includes(value)
      ? targetRoles.filter((r) => r !== value)
      : [...targetRoles, value];
    onPanelChange({ targetRoles: updated });
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-5 bg-white border border-gray-200 rounded-lg p-5">

      {/* 1. 상단 고정 + 게시 상태 */}
      <PanelHeader
        isPinned={isPinned}
        onPinnedChange={(val) => onPanelChange({ isPinned: val })}
        publishType={publishType}
        onPublishTypeChange={(val) => onPanelChange({ publishType: val })}
        reservationAt={reservationAt}
        onReservationAtChange={(val) => onPanelChange({ reservationAt: val })}
      />

      <hr className="border-gray-100" />

      {/* 2. 공개 대상 (공지 전용) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">공개 대상</p>
        <div className="flex flex-col gap-2">
          {TARGET_ROLES.map((role) => (
            <label
              key={role.value}
              className="flex items-center justify-between text-sm text-gray-700 cursor-pointer"
            >
              {role.label}
              <input
                type="checkbox"
                checked={targetRoles.includes(role.value)}
                onChange={() => handleRoleToggle(role.value)}
                className="w-4 h-4 accent-teal-600"
              />
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 3. 작성자 / 마지막 수정 */}
      <PanelMeta authorName={authorName} updatedAt={updatedAt} />

      {/* 4. 게시 팁 */}
      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex gap-2">
        <span className="text-teal-500 shrink-0 text-sm">💡</span>
        <p className="text-xs text-teal-700">
          중요 공지사항은 상단 고정 기능을 사용하면 효율적입니다.
        </p>
      </div>

      {/* 5. 버튼 */}
      <PanelActions
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </aside>
  );
};

export default NoticePanel;
