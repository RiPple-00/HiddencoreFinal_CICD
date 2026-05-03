import { useNavigate } from 'react-router-dom';
import Button from '../../Button';

/**
 * 게시글 상세 페이지 상단 고정 액션바
 * 목록으로 돌아가기 / 수정 / 삭제 / 신청하기
 *
 * 버튼 노출 조건:
 * - 수정/삭제: 본인 글(authorName === user?.name) 또는 ADMIN
 * - 신청하기: APPLY 타입 + 모집 중 + 정원 미달
 *
 * @param {object} post - PostResponse 전체
 * @param {object|null} user - AuthContext user (CHECK!!! 연동 후 실제 값)
 * @param {string|number} facilityId
 * @param {function} onDelete - 삭제 핸들러
 */
const DetailActionBar = ({ post, user, facilityId, onDelete }) => {
  const navigate = useNavigate();

  // CHECK!!! AuthContext 연동 후 user?.userId === post.authorId 방식으로 교체
  const isAuthor = user?.name === post?.authorName;
  const isAdmin  = user?.role === 'ADMIN';
  const canEdit  = isAuthor || isAdmin;

  // 신청하기: APPLY 타입이고 모집 중이며 정원이 남아있을 때만 활성화
  const isApplyType     = post?.type === 'APPLY';
  const isRecruiting    = post?.recruitStatus === '모집 중';
  const hasCapacity     = post?.currentEnrolled < post?.capacity;
  const canApply        = isApplyType && isRecruiting && hasCapacity;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">

        {/* 좌측: 목록으로 돌아가기 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/facilities/${facilityId}/board`)}
        >
          ← 목록으로 돌아가기
        </Button>

        {/* 우측: 수정 / 삭제 / 신청하기 */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/facilities/${facilityId}/board/${post.id}/edit`)}
              >
                수정
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={onDelete}
              >
                삭제
              </Button>
            </>
          )}

          {/* 신청하기: APPLY 타입일 때만 렌더링 */}
          {isApplyType && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!canApply}
              onClick={() => {
                // CHECK!!! 신청하기 API 엔드포인트 구현 후 연결 필요
                alert('신청하기 API 연결 필요');
              }}
            >
              {isRecruiting && hasCapacity ? '신청하기' : '신청 불가'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailActionBar;
