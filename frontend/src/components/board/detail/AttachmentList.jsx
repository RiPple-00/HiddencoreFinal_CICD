import Button from '../../Button';
import { parseAttachmentUrls } from '../../../utils/boardUtils';

// 파일 확장자별 아이콘 색상
const getFileStyle = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf')  return { label: 'PDF',  color: 'text-red-500',  bg: 'bg-red-50' };
  if (ext === 'xlsx') return { label: 'XLSX', color: 'text-green-600', bg: 'bg-green-50' };
  if (ext === 'docx') return { label: 'DOCX', color: 'text-blue-500',  bg: 'bg-blue-50' };
  if (['png', 'jpg', 'jpeg'].includes(ext))
    return { label: 'IMG', color: 'text-purple-500', bg: 'bg-purple-50' };
  return { label: 'FILE', color: 'text-gray-500', bg: 'bg-gray-100' };
};

// 파일 크기를 읽기 쉬운 형태로 변환 (URL만 있을 경우 표시 불가)
// CHECK!!! 백엔드에서 파일 메타(size, originalName)를 함께 내려주면 표시 가능
const getFileName = (url) => decodeURIComponent(url.split('/').pop());

/**
 * 첨부파일 목록 컴포넌트
 * attachmentUrls(JSON String) → 파싱 후 목록 렌더링
 * 수정 페이지에서도 재사용 가능
 *
 * @param {string|null} attachmentUrls - JSON String (Post 도메인 저장 형태)
 */
const AttachmentList = ({ attachmentUrls }) => {
  const urls = parseAttachmentUrls(attachmentUrls);

  if (urls.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
        <span className="text-sm font-medium text-gray-700">첨부 파일</span>
      </div>

      {/* 파일 목록 */}
      <ul className="flex flex-col gap-2">
        {urls.map((url, idx) => {
          const fileName = getFileName(url);
          const style    = getFileStyle(fileName);

          return (
            <li
              key={idx}
              className="flex items-center justify-between px-3 py-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* 파일 타입 아이콘 + 파일명 */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${style.bg}`}>
                  <span className={`text-xs font-medium ${style.color}`}>{style.label}</span>
                </div>
                <span className="text-sm text-gray-700 truncate">{fileName}</span>
              </div>

              {/* 다운로드 버튼 */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="shrink-0 ml-3"
              >
                ↓
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AttachmentList;
