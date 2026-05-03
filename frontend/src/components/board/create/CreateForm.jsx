import Input from '../../Input';
import FileUpload from './FileUpload';
import { BOARD_TABS_MAP } from '../../../utils/boardUtils';


// 타입별 타이틀 / 부제목
const FORM_META = {
  NOTICE: {
    title: '공지사항 작성',
    subtitle: '공지사항을 작성할 수 있습니다. 작성 후 게시 설정을 확인하세요.',
  },
  PROGRAM: {
    title: '프로그램 작성',
    subtitle: '환자를 위한 신규 프로그램을 등록합니다.',
  },
  GENERAL: {
    title: '게시글 작성',
    subtitle: '자유롭게 게시글을 작성할 수 있습니다.',
  },
};

/**
 * 게시글 작성 중앙 본문 영역 - 모든 타입 공통
 * 제목 / 본문 / 첨부파일은 타입에 무관하게 동일
 */
const CreateForm = ({ postType, title, content, attachmentUrls, facilityId, onChange, noticeType, onNoticeTypeChange, scheduledAt, scheduleEndAt, onCancel, onSubmit }) => {
  const meta = FORM_META[postType] ?? { title: '', subtitle: '' };

  // NOTICE 탭에서 type이 null인 '전체 공지' 제외하고 사용
  const noticeTypes = BOARD_TABS_MAP.NOTICE.filter(t => t.type !== null);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-400 mb-1">게시판 &gt; 새 게시글 작성</p>
      <h1 className="text-2xl font-bold text-teal-800 mb-1">{meta.title}</h1>
      {meta.subtitle && (
        <p className="text-sm text-gray-500 mb-6">{meta.subtitle}</p>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">

        {/* 분류 + 제목 */}
        <div className="flex items-center gap-3">
          {postType === 'NOTICE' && (
            <select
              value={noticeType ?? 'ADMIN'}
              onChange={(e) => onNoticeTypeChange(e.target.value)}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shrink-0"
            >
              {noticeTypes.map((t) => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>
          )}
          <Input
            label="제목"
            type="text"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="제목을 입력하세요"
            className="text-lg flex-1"
          />
        </div>

        {/* 날짜 필드 - PROGRAM이면 '프로그램', 나머지 NOTICE면 '시설 일정' */}
        {(postType === 'PROGRAM' || postType === 'NOTICE') && (
          <>
            <hr className="border-gray-100 my-5" />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {postType === 'PROGRAM' ? '프로그램 시작 일시' : '시설 일정 시작'}
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt ?? ''}
                  onChange={(e) => onChange({ scheduledAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {postType === 'PROGRAM' ? '프로그램 종료 일시' : '시설 일정 종료'}
                </label>
                <input
                  type="datetime-local"
                  value={scheduleEndAt ?? ''}
                  onChange={(e) => onChange({ scheduleEndAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                />
              </div>
            </div>
          </>
        )}

        <hr className="border-gray-100 my-5" />

        {/* 본문 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
          <textarea
            value={content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="내용을 입력하세요."
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-700 placeholder-gray-300 resize-none"
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
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              게시글 등록
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreateForm;
