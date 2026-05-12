import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postApi from '../../api/postApi';
import PostList from './PostList';
import { WIDGET_SIZE, BOARD_TYPE_MAP } from '../../utils/boardUtils';

/**
 * 메인 페이지용 게시판 위젯
 * BoardContext 없이 로컬 상태로 독립 동작
 * widget 모드로 PostList를 렌더링
 *
 * 호출 예시: 공지 게시판
    <BoardWidget title="공지사항" boardType="NOTICE" facilityId={facilityId} />
 * @param {string} title - 위젯 헤더 타이틀
 * @param {string|null} boardType - 'NOTICE' | 'PROGRAM' | 'GENERAL' | null(전체)
 * @param {string|number} facilityId - API 호출용
 */
const BoardWidget = ({ title, boardType = null, facilityId }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!facilityId) return;

    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await postApi.getPostList(facilityId, null, 0, 9999);
        const all = res.data ?? [];

        // boardType이 있으면 해당 게시판 PostType 묶음으로 필터링
        const filtered = boardType
          ? all.filter((p) => BOARD_TYPE_MAP[boardType]?.includes(p.type))
          : all;

        // 최신순 상위 WIDGET_SIZE개만 표시
        setPosts(filtered.slice(0, WIDGET_SIZE));
      } catch {
        // 에러는 Axios 인터셉터에서 toast로 처리
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [facilityId, boardType]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">

      {/* 위젯 헤더: 타이틀 + 전체보기 링크 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <button
          onClick={() => navigate(`/facilities/${facilityId}/board`)}
          className="text-xs text-teal-600 hover:underline"
        >
          전체보기
        </button>
      </div>

      {/* 게시글 목록 */}
      {isLoading ? (
        <p className="text-xs text-gray-400 py-4 text-center">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">게시글이 없습니다.</p>
      ) : (
        <PostList posts={posts} mode="widget" facilityId={facilityId} />
      )}
    </div>
  );
};

export default BoardWidget;
