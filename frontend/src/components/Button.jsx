/**
 * 재사용 가능한 버튼 컴포넌트
 *
 * @param {string} variant - 버튼 스타일 ('primary' | 'secondary' | 'outline')
 * @param {string} size - 버튼 크기 ('sm' | 'md' | 'lg')
 * @param {ReactNode} children - 버튼 내용
 * @param {function} onClick - 클릭 핸들러
 * @param {string} className - 추가 클래스
 * @param {boolean} disabled - 비활성화 여부
 */

const Button = ( {
    variant = 'primary', // 기본값
    size = 'md', // 중간 크기
    children, // 버튼안에 들어갈 내용
    onClick, // 클릭시 실행할 함수
    className = '', // css 
    disabled = false, // 비활성화
    type ='button', 
    ...props // 나머지 props들 관리

} ) => {

 // 기본 스타일
  const baseStyles = 'font-medium rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md';

  // variant별 스타일
  const variantStyles = {
    primary: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 focus:ring-emerald-400 disabled:from-gray-300 disabled:to-gray-400',
    secondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-400 disabled:bg-orange-50',
    outline: 'border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-400 disabled:border-gray-300 disabled:text-gray-300',
    danger: 'bg-red-400 text-white hover:bg-red-500 focus:ring-red-400 disabled:bg-red-200',
  };

  // size별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

    return (
    <button
     type={type}
      onClick={onClick}
      disabled={disabled}  // 단순 변수 전달 disabled=true -> disabled={disabled} 
      //문자열 안에 변수 삽입 `${ }  `
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>

      {children}
    </button>
    );
};

export default Button;