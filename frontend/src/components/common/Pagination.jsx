/**
 * 공통 페이지네이션 컴포넌트
 * 프론트엔드 slice 기반으로 동작 (백엔드 호출 없음)
 *
 * @param {number} currentPage - 현재 페이지 (0-based)
 * @param {number} totalPages - 전체 페이지 수
 * @param {function} onPageChange - 페이지 변경 콜백 (page 전달)
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // 현재 페이지 기준으로 노출할 페이지 번호 범위 계산 (최대 5개)
  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - maxVisible);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();

  const btnBase = 'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors';
  const btnActive = 'bg-teal-600 text-white font-medium';
  const btnDefault = 'text-gray-600 hover:bg-gray-100';
  const btnDisabled = 'text-gray-300 cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {/* 처음 페이지 */}
      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnDefault}`}
      >
        {'|<'}
      </button>

      {/* 이전 페이지 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnDefault}`}
      >
        {'<'}
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnBase} ${page === currentPage ? btnActive : btnDefault}`}
        >
          {page + 1}
        </button>
      ))}

      {/* 다음 페이지 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`${btnBase} ${currentPage === totalPages - 1 ? btnDisabled : btnDefault}`}
      >
        {'>'}
      </button>

      {/* 마지막 페이지 */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
        className={`${btnBase} ${currentPage === totalPages - 1 ? btnDisabled : btnDefault}`}
      >
        {'>|'}
      </button>
    </div>
  );
};

export default Pagination;
