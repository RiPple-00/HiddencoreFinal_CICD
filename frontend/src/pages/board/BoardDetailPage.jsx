import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import postApi from '../../api/postApi';
import { formatDate } from '../../utils/dateUtils';
import { getBadgeStyle, BOARD_TABS_MAP } from '../../utils/boardUtils';
import StatusBadge from '../../components/common/StatusBadge';
import DetailActionBar from '../../components/board/detail/DetailActionBar';
import AttachmentList from '../../components/board/detail/AttachmentList';
import { useAuth } from '../../contexts/AutoContext.jsx';
import Header from '../../components/common/Header';

/**
 * post.type과 BOARD_TABS_MAP을 역참조해서 브레드크럼 라벨 반환
 * ex) 'CLINICAL' → '임상 가이드라인'
 */
const getBreadcrumbLabel = (type) => {
  for (const tabs of Object.values(BOARD_TABS_MAP)) {
    if (!tabs) continue;
    const found = tabs.find((t) => t.type === type);
    if (found) return found.label;
  }
  return type ?? '게시판';
};

/**
 * 게시글 상세 페이지
 * URL: /facilities/:facilityId/board/:postId
 */
const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { facilityId, postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI 요약 토글 상태
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await postApi.getPost(facilityId, postId);
        // CHECK!!! 백엔드 응답 구조 확인 필요 - res.data가 PostResponse 객체인지
        setPost(res.data);
      } catch {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [facilityId, postId]);

  // 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      if (!user) {
        toast.error('삭제하려면 로그인해 주세요.');
        return;
      }
      await postApi.deletePost(facilityId, postId);
      navigate(`/facilities/${facilityId}/board`);
    } catch {
      // 에러는 Axios 인터셉터에서 toast로 처리
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
        <Header activeNav="notice" />
        <div className="flex items-center justify-center py-32 text-sm text-gray-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
        <Header activeNav="notice" />
        <div className="flex items-center justify-center py-32 text-sm text-red-400">
          {error ?? '게시글을 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  const breadcrumbLabel = getBreadcrumbLabel(post.type);
  const isProgram = ['APPLY', 'REVIEW'].includes(post.type);

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
      <Header activeNav="notice" />
    <div>
      {/* 상단 고정 액션바 */}
      <DetailActionBar
        post={post}
        user={user}
        facilityId={facilityId}
        onDelete={handleDelete}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* 브레드크럼 */}
        <p className="text-sm text-gray-400 mb-3">
          게시판 &gt; 공지사항 &gt;{' '}
          <span className="text-teal-600">{breadcrumbLabel}</span>
        </p>

        {/* 제목 영역 */}
        <div className="mb-4">
          {/* 프로그램 타입일 때 모집 상태 배지 표시 */}
          {isProgram && post.recruitStatus && (
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 mb-2
              ${post.recruitStatus === '모집 중'   ? 'bg-green-100 text-green-700' : ''}
              ${post.recruitStatus === '모집 예정' ? 'bg-gray-100 text-gray-600'  : ''}
              ${post.recruitStatus === '마감'      ? 'bg-red-100 text-red-600'    : ''}
            `}>
              {post.recruitStatus === '마감' ? '모집 완료' : post.recruitStatus}
            </span>
          )}
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            {post.title}
          </h1>
        </div>

        {/* 작성자 / 날짜 / 조회수 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
          <span>👤 {post.authorName}</span>
          <span>📅 {formatDate(post.createdAt)}</span>
          <span>👁 {post.views ?? 0}</span>
          {/* 게시글 타입 배지 */}
          <StatusBadge type={post.type} />
        </div>

        {/* AI 요약 토글 */}
        <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setAiOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            <div className="flex items-center gap-2">
              {/* AI 아이콘 */}
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              AI 요약
            </div>
            <span className="text-gray-400">{aiOpen ? '∧' : '∨'}</span>
          </button>

          {aiOpen && (
            <div className="px-4 py-3 text-sm text-gray-400 border-t border-gray-200">
              아직 준비되지 않았습니다.
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="prose max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
          {/* CHECK!!! content가 HTML이면 dangerouslySetInnerHTML 사용 필요 - 현재는 plain text 가정 */}
          {post.content}
        </div>

        {/* 첨부파일 */}
        <AttachmentList attachmentUrls={post.attachmentUrls} />

      </div>
    </div>
    </div>
  );
};

export default BoardDetailPage;
