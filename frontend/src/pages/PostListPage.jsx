import { Navigate, useParams } from 'react-router-dom';

/**
 * 예전 단순 목록 페이지는 시설 게시판(BoardListPage)으로 통합됨.
 * 혹시 남은 링크는 시설 게시판으로 보냄.
 */
function PostListPage() {
  const { facilityId, boardId } = useParams();
  const id = facilityId ?? boardId ?? '1';
  return <Navigate to={`/facilities/${id}/board`} replace />;
}

export default PostListPage;
