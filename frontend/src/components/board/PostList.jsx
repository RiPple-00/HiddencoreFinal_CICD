import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';

/**
 * 게시글 목록 컴포넌트
 * table 모드: 게시판 목록 페이지 (전체 컬럼)
 * widget 모드: 메인 페이지 위젯 (간소화된 형태)
 *
 * @param {Array} posts - 렌더링할 게시글 목록 (이미 필터링/slice 완료된 데이터)
 * @param {'table'|'widget'} mode - 렌더링 모드
 * @param {number} [facilityId] - 상세 페이지 이동 시 필요
 */
/** 목록 API(PostListResponse)는 `id`, 구버전 호환으로 `postId` */
const rowId = (post) => post?.id ?? post?.postId;

const PostList = ({ posts = [], mode = 'table', facilityId }) => {
  const navigate = useNavigate();

  const handleRowClick = (post) => {
    const id = rowId(post);
    if (id == null) return;
    navigate(`/facilities/${facilityId}/board/${id}`);
  };

  // 게시글이 없을 때 Empty State
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        게시글이 없습니다.
      </div>
    );
  }

  // table 모드: 게시판 목록 페이지
  if (mode === 'table') {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-xs">
            <th className="py-3 w-12 text-center font-medium">NO.</th>
            <th className="py-3 text-left font-medium">TITLE</th>
            <th className="py-3 w-24 text-center font-medium">AUTHOR</th>
            <th className="py-3 w-24 text-center font-medium">DATE</th>
            <th className="py-3 w-16 text-center font-medium">VIEWS</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr
              key={rowId(post) ?? post.title}
              onClick={() => handleRowClick(post)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* NO */}
              <td className="py-3 text-center text-gray-400">{index + 1}</td>

              {/* TITLE: 배지 + 제목 + 첨부파일 아이콘 + 댓글 수 */}
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <StatusBadge type={post.type} />
                  {/* CHECK!!! HOT 배지 - 추후 isHotPost(post.viewCount) 조건으로 주석 해제 */}
                  {/* {isHotPost(post.viewCount) && <StatusBadge type="HOT" />} */}
                  <span className="text-gray-800">{post.title}</span>
                  {/* CHECK!!! 첨부파일 필드명 확인 필요 - post.attachmentUrls가 배열인지 */}
                  {post.attachmentUrls?.length > 0 && (
                    <img src="/icons/attachment.svg" alt="첨부파일" className="w-3.5 h-3.5 opacity-40" />
                  )}
                  {/* CHECK!!! 댓글 수 필드명 확인 필요 - 백엔드 응답에 commentCount가 있는지 */}
                  {post.commentCount > 0 && (
                    <span className="text-teal-600 text-xs font-medium">({post.commentCount})</span>
                  )}
                </div>
              </td>

              {/* AUTHOR */}
              <td className="py-3 text-center text-gray-500">
                {/* CHECK!!! 작성자 필드명 확인 필요 - post.authorName 또는 post.author?.name */}
                {post.authorName ?? '-'}
              </td>

              {/* DATE */}
              <td className="py-3 text-center text-gray-400">
                {formatDate(post.updatedAt ?? post.createdAt)}
              </td>

              {/* VIEWS */}
              <td className="py-3 text-center text-gray-400">
                {post.views ?? post.viewCount ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // widget 모드: 메인 페이지 공지사항 위젯
  if (mode === 'widget') {
    return (
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li
            key={rowId(post) ?? post.title}
            onClick={() => handleRowClick(post)}
            className="flex flex-col gap-0.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
          >
            {/* 배지 + 제목 */}
            <div className="flex items-center gap-2">
              <StatusBadge type={post.type} />
              <span className="text-sm text-gray-800 truncate">{post.title}</span>
            </div>
            {/* 작성자 + 상대 시간 */}
            <div className="flex justify-between text-xs text-gray-400">
              {/* CHECK!!! 작성자 필드명 확인 필요 */}
              <span>{post.authorName ?? '-'}</span>
              <span>{formatRelativeTime(post.updatedAt ?? post.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return null;
};

export default PostList;
