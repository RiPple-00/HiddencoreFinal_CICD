import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import postApi from '../../api/postApi';
import { useAuth } from '../../contexts/AutoContext.jsx';
import PostList from '../../components/board/PostList';

// 작성 이력과 보관함

const HEADINGS = {
  history: '작성 이력',
  draft: '보관함 (임시 저장)',
};

/*
 * 작성 이력(/history) · 보관함(/draft)
 * 백엔드는 userId 기준 전체 시설 글을 줄 수 있어, 현재 facilityId로 한 번 더 필터링
 */

// TODO: 작성 이력과 보관함을 한 페이지에서 탭으로 구분하는 방식으로 변경 고려
const BoardUserPostsPage = ({ variant }) => {
  const { facilityId } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res =
          variant === 'draft'
            ? await postApi.getMyDrafts(facilityId, null, 0, 500)
            : await postApi.getMyPosts(facilityId, null, 0, 500);
        const raw = Array.isArray(res.data) ? res.data : [];
        const fid = String(facilityId);
        const filtered = raw.filter(
          (p) => p == null || String(p.facilityId) === fid
        );
        if (!cancelled) setPosts(filtered);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [facilityId, user, variant]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <p className="text-gray-600 mb-4">로그인 후 이용할 수 있습니다.</p>
        <Link
          to="/login"
          className="inline-flex text-teal-600 font-medium hover:underline"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {HEADINGS[variant] ?? '내 게시글'}
        </h1>
        <div className="flex gap-4 text-sm">
          <Link
            to={`/facilities/${facilityId}/board/create`}
            className="text-teal-600 hover:underline"
          >
            새 글 작성
          </Link>
          <Link
            to={`/facilities/${facilityId}/board`}
            className="text-gray-600 hover:underline"
          >
            게시판 목록
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-16 text-sm text-gray-400">불러오는 중...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <PostList posts={posts} mode="table" facilityId={facilityId} />
        </div>
      )}
    </div>
  );
};

export default BoardUserPostsPage;
