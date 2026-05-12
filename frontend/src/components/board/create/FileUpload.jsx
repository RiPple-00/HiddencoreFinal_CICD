import { useRef, useState } from 'react';
import postApi from '@/api/postApi';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
];
const ALLOWED_LABEL = 'PDF, DOCX, JPEG';
const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

/**
 * 첨부파일 업로드 컴포넌트
 * 파일 선택 즉시 업로드 API 호출 후 URL을 부모에 전달
 *
 * @param {string} facilityId - 업로드 API 경로에 사용
 * @param {string[]} attachmentUrls - 현재 업로드된 파일 URL 배열
 * @param {function} onChange - URL 배열 변경 콜백
 */
const FileUpload = ({ facilityId, attachmentUrls = [], onChange }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type))
      return `허용되지 않는 파일 형식입니다. (${ALLOWED_LABEL} 만 가능)`;
    if (file.size > MAX_BYTES)
      return `파일 크기는 ${MAX_MB}MB 이하여야 합니다.`;
    return null;
  };

  const handleUpload = async (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }

    setError(null);
    setUploading(true);
    try {
      // CHECK!!! 백엔드 파일 업로드 엔드포인트 구현 후 연결 필요
      // POST /facilities/:facilityId/posts/upload (multipart/form-data)
      const res = await postApi.uploadFile(facilityId, file);
      onChange([...attachmentUrls, res.data.url]);
    } catch {
      setError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = ''; // 같은 파일 재선택 가능하도록 초기화
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = (url) => {
    onChange(attachmentUrls.filter((u) => u !== url));
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-600 mb-2">첨부파일</p>

      {/* 드래그앤드롭 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-lg py-10 px-4
          cursor-pointer transition-colors
          ${isDragging
            ? 'border-teal-400 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        {/* 업로드 아이콘 */}
        <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>

        {uploading ? (
          <p className="text-sm text-teal-600">업로드 중...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              파일을 드래그하거나{' '}
              <span className="text-teal-600 underline font-medium">여기를 클릭</span>
              하여 업로드하세요
            </p>
            <p className="text-xs text-gray-400 mt-1">{ALLOWED_LABEL} (Max. {MAX_MB}MB)</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* 업로드된 파일 목록 */}
      {attachmentUrls.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {attachmentUrls.map((url) => (
            <li key={url} className="flex items-center justify-between bg-gray-100 rounded px-3 py-1.5 text-sm">
              <span className="text-gray-700 truncate">{url.split('/').pop()}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(url); }}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
