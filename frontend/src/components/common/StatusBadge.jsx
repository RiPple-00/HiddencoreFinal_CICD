import { getBadgeStyle } from '../../utils/boardUtils';

/**
 * 공통 배지 컴포넌트
 * 게시판 외 전체에서 사용 가능 (환자 상태, 일정 등)
 *
 * @param {string} type - BADGE_STYLES에 정의된 type 값
 * @param {string} [className] - 추가 Tailwind 클래스 (외부에서 크기/여백 조정 시 사용)
 */
const StatusBadge = ({ type, className = '' }) => {
  const { label, className: badgeClass } = getBadgeStyle(type);

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2 py-0.5 rounded text-xs font-medium
        ${badgeClass}
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
