import Input from '../../Input';
import FileUpload from './FileUpload';
import { BOARD_TABS_MAP } from '../../../utils/boardUtils';
import { useI18n } from '../../../hooks/useI18n.jsx';


// 타입별 타이틀 / 부제목
const FORM_META = {
  NOTICE: {
    titleKey: 'board.create.form.noticeTitle',
    title: '공지사항 작성',
    subtitleKey: 'board.create.form.noticeSubtitle',
    subtitle: '공지사항을 작성할 수 있습니다. 작성 후 게시 설정을 확인하세요.',
  },
  PROGRAM: {
    titleKey: 'board.create.form.programTitle',
    title: '프로그램 작성',
    subtitleKey: 'board.create.form.programSubtitle',
    subtitle: '환자를 위한 신규 프로그램을 등록합니다.',
  },
  GENERAL: {
    titleKey: 'board.create.form.generalTitle',
    title: '게시글 작성',
    subtitleKey: 'board.create.form.generalSubtitle',
    subtitle: '자유롭게 게시글을 작성할 수 있습니다.',
  },
};

/**
 * 게시글 작성 중앙 본문 영역 - 모든 타입 공통
 * 제목 / 본문 / 첨부파일은 타입에 무관하게 동일
 */
const CreateForm = ({ postType, title, content, attachmentUrls, facilityId, onChange, noticeType, onNoticeTypeChange, scheduledAt, scheduleEndAt, onCancel, onSubmit }) => {
  const { t } = useI18n();
  const meta = FORM_META[postType] ?? { title: '', subtitle: '' };

  // NOTICE 탭에서 type이 null인 '전체 공지' 제외하고 사용
  const noticeTypes = BOARD_TABS_MAP.NOTICE.filter((t) => t.type !== null);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-400 mb-1">
        {t('board.create.form.breadcrumb', '게시판 > 새 게시글 작성')}
      </p>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        {t(meta.titleKey ?? '', meta.title)}
      </h1>

      {meta.subtitle && (
        <p className="text-sm text-slate-500 mb-6">
          {t(meta.subtitleKey ?? '', meta.subtitle)}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        {/* 분류 + 제목 */}
        <div className="flex items-center gap-3">
          {postType === 'NOTICE' && (
            <select
              value={noticeType ?? 'ADMIN'}
              onChange={(e) => onNoticeTypeChange(e.target.value)}
              className="h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shrink-0"
            >
              {noticeTypes.map((item) => (
                <option key={item.type} value={item.type}>
                  {t(item.labelKey ?? '', item.label)}
                </option>
              ))}
            </select>
          )}

          <Input
            label={t('board.create.form.titleLabel', '제목')}
            type="text"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={t('board.create.form.titlePlaceholder', '제목을 입력하세요')}
            className="text-lg flex-1"
          />
        </div>

        {/* 날짜 필드 - PROGRAM이면 '프로그램', 나머지 NOTICE면 '시설 일정' */}
        {(postType === 'PROGRAM' || postType === 'NOTICE') && (
          <>
            <hr className="border-slate-100 my-5" />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {postType === 'PROGRAM'
                    ? t('board.create.form.programStartLabel', '프로그램 시작 일시')
                    : t('board.create.form.facilityStartLabel', '시설 일정 시작')}
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt ?? ''}
                  onChange={(e) => onChange({ scheduledAt: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-700"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {postType === 'PROGRAM'
                    ? t('board.create.form.programEndLabel', '프로그램 종료 일시')
                    : t('board.create.form.facilityEndLabel', '시설 일정 종료')}
                </label>

                <input
                  type="datetime-local"
                  value={scheduleEndAt ?? ''}
                  onChange={(e) => onChange({ scheduleEndAt: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-700"
                />
              </div>
            </div>
          </>
        )}

        <hr className="border-slate-100 my-5" />

        {/* 본문 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('board.create.form.contentLabel', '본문')}
          </label>

          <textarea
            value={content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={t('board.create.form.contentPlaceholder', '내용을 입력하세요.')}
            rows={12}
            className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-700 placeholder-slate-400 resize-none"
          />
        </div>

        {/* 첨부파일 */}
        <FileUpload
          facilityId={facilityId}
          attachmentUrls={attachmentUrls}
          onChange={(urls) => onChange({ attachmentUrls: urls })}
        />

        {postType === 'GENERAL' && (
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
            >
              {t('board.create.form.cancelButton', '취소')}
            </button>

            <button
              onClick={onSubmit}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition"
            >
              {t('board.create.form.submitButton', '게시글 등록')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateForm;