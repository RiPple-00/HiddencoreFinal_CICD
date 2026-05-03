/**
 * 재사용 가능한 입력 필드 컴포넌트
 *
 * @param {string} label - 라벨 텍스트
 * @param {string} type - 입력 타입 (text, email, password 등)
 * @param {string} placeholder - 플레이스홀더
 * @param {string} error - 에러 메시지
 * @param {ReactNode} icon - 아이콘 (선택)
 */


import { forwardRef } from "react"

// forwardRef(type = 'text', ref)
const Input = forwardRef(({
label, // 입력창 위 텍스트 (예: "이메일")
type = 'text', // 기본값
placeholder, // 힌트
error, // 에러 메세지 문자열
icon, // 아이콘 컴포넌트
className = '', // 추가 css 
...props // 그 외 나머지 값들(onChange, disabled...)
}, ref) => {

  return (
    <div className="w-full">
      {/* 라벨: && label props이 있을때만 렌더링 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 입력 필드 컨테이너 */}
      <div className="relative">
        {/* 아이콘 */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
            {icon}
          </div>
        )}

        {/* 입력 필드 */}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
        //  ${icon ? 'pl-10' : ''}  아이콘이 있으면 왼쪽 여백 10만큼 추가 그렇지 않으면 공백
        //  ${className} : 추가 스타일 주입

          className={`
            w-full px-4 py-2
            ${icon ? 'pl-10' : ''}            
            border rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            outline-none transition
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

{/* <div>
    <label/>
<div>
<div>{icon}</div>
<input type="text"...../>
</div>
</div> */}

Input.displayName = 'Input'; // forwardRef 감싸면 DevTools 이름 사라짐 input 으로 재 정의하여 사용 import Input from ./Input

export default Input