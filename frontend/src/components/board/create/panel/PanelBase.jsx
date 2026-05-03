import Input from '../../../Input';
import Button from '../../../Button';
import { formatDate } from '../../../../utils/dateUtils';

/**
 * 패널 상단 영역: 상단 고정 토글 + 게시 상태
 * 작성자/수정일은 PanelMeta로 분리 - 패널별로 다른 위치에 배치하기 위함
 */
export const PanelHeader = ({
  isPinned, onPinnedChange,
  publishType, onPublishTypeChange,
  reservationAt, onReservationAtChange,
}) => (
  <div className="flex flex-col gap-5">

    {/* 상단 고정 토글 */}
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-sm text-gray-700 shrink-0">상단 고정</span>
      <button
        type="button"
        aria-pressed={isPinned}
        aria-label="상단 고정"
        onClick={() => onPinnedChange(!isPinned)}
        className={`
          relative inline-flex h-6 w-10 shrink-0 cursor-pointer overflow-hidden rounded-full
          transition-colors
          ${isPinned ? 'bg-teal-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow
            transition-transform duration-200 ease-out
            ${isPinned ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </div>

    {/* 게시 상태 */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">게시 상태</p>
      <div className="flex flex-col gap-2">

        <label className={`
          flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
          ${publishType === 'IMMEDIATE' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}
        `}>
          <input
            type="radio"
            name="publishType"
            checked={publishType === 'IMMEDIATE'}
            onChange={() => onPublishTypeChange('IMMEDIATE')}
            className="mt-0.5 accent-teal-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">즉시 게시</p>
            <p className="text-xs text-gray-400">저장 후 바로 시스템에 노출됩니다.</p>
          </div>
        </label>

        <label className={`
          flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
          ${publishType === 'SCHEDULED' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}
        `}>
          <input
            type="radio"
            name="publishType"
            checked={publishType === 'SCHEDULED'}
            onChange={() => onPublishTypeChange('SCHEDULED')}
            className="mt-0.5 accent-teal-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">예약 게시</p>
            <p className="text-xs text-gray-400">지정한 일시에 자동으로 게시됩니다.</p>
          </div>
        </label>

        {publishType === 'SCHEDULED' && (
          <Input
            type="datetime-local"
            value={reservationAt}
            onChange={(e) => onReservationAtChange(e.target.value)}
          />
        )}
      </div>
    </div>
  </div>
);

/**
 * 작성자 / 마지막 수정 영역
 * PanelHeader에서 분리 - 패널 타입별로 다른 위치에 배치
 */
export const PanelMeta = ({ authorName, updatedAt }) => (
  <div className="flex flex-col gap-1 text-sm">
    <div className="flex justify-between">
      <span className="text-gray-400">작성자</span>
      {/* CHECK!!! AuthContext 연동 후 실제 user?.name으로 교체 */}
      <span className="text-gray-700 font-medium">{authorName ?? '-'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">마지막 수정</span>
      <span className="text-gray-700 font-medium">
        {updatedAt ? formatDate(updatedAt) : '-'}
      </span>
    </div>
  </div>
);

/**
 * 하단 버튼 영역
 * Button 컴포넌트의 rounded-full을 rounded-lg로 덮어씀 (디자인 기준 사각형)
 */
export const PanelActions = ({ onSaveDraft, onSubmit, onCancel, isSubmitting }) => (
  <div className="flex flex-col gap-2">
    <Button
      type="button"
      variant="outline"
      size="md"
      onClick={onSaveDraft}
      className="w-full !rounded-lg"
    >
      임시 저장
    </Button>
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={onSubmit}
      disabled={isSubmitting}
      className="w-full !rounded-lg"
    >
      {isSubmitting ? '등록 중...' : '✓ 게시글 등록'}
    </Button>
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={onCancel}
      className="w-full !rounded-lg"
    >
      취소
    </Button>
  </div>
);
