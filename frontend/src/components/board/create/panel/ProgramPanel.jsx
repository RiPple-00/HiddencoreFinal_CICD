import { PanelHeader, PanelMeta, PanelActions } from './PanelBase';
import Input from '../../../Input';
import { useI18n } from '../../../../hooks/useI18n.jsx';

/**
 * 모집 상태 실시간 계산 (작성 페이지 미리보기 전용)
 * 실제 저장 값은 백엔드 PostDto.getRecruitStatus()에서 계산
 */
const getRecruitPreview = (startAt, endAt, t) => {
  if (!startAt || !endAt) return null;
  const now = new Date();
  if (now < new Date(startAt)) return { label: t('board.recruitStatus.scheduled', '모집 예정'), className: 'bg-gray-100 text-gray-600' };
  if (now > new Date(endAt))   return { label: t('board.recruitStatus.closed', '마감'),     className: 'bg-red-100 text-red-600' };
  return                               { label: t('board.recruitStatus.open', '모집 중'),  className: 'bg-green-100 text-green-700' };
};

/**
 * 프로그램 전용 우측 패널
 * 순서: 상단고정+게시상태 → 모집일정 → 정원 → 작성자/수정일 → 상태 → 버튼
 */
const ProgramPanel = ({ panelState, onPanelChange, onSaveDraft, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useI18n();
  const {
    isPinned, publishType, reservationAt,
    startAt, endAt, capacity,
    authorName, updatedAt,
  } = panelState;

  const recruitPreview = getRecruitPreview(startAt, endAt, t);

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

      {/* 2. 모집 일정 (프로그램 전용) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">{t('board.create.panel.recruitSchedule', '모집 일정')}</p>
        <div className="flex flex-col gap-3">
          <Input
            label={t('board.create.panel.startDate', '시작일')}
            type="date"
            value={startAt ?? ''}
            onChange={(e) => onPanelChange({ startAt: e.target.value })}
          />
          <Input
            label={t('board.create.panel.endDate', '종료일')}
            type="date"
            value={endAt ?? ''}
            onChange={(e) => onPanelChange({ endAt: e.target.value })}
          />
        </div>
      </div>

      {/* 3. 정원 (프로그램 전용) */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 shrink-0">{t('board.create.panel.capacity', '정원')}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={capacity ?? 30}
            onChange={(e) => onPanelChange({ capacity: Number(e.target.value) })}
            className="w-16 text-right"
          />
          <span className="text-sm text-gray-500 shrink-0">{t('board.create.panel.capacityUnit', '명')}</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 4. 작성자 / 마지막 수정 */}
      <PanelMeta authorName={authorName} updatedAt={updatedAt} />

      {/* 5. 모집 상태 미리보기 (프로그램 전용) */}
      {recruitPreview && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t('board.create.panel.status', '상태')}</p>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${recruitPreview.className}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-70 shrink-0" />
            {recruitPreview.label}
          </div>
        </div>
      )}

      {/* 6. 버튼 */}
      <PanelActions
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </aside>
  );
};

export default ProgramPanel;
