import {clsx} from 'clsx'; // class jsx 의 약자 
import { twMerge } from 'tailwind-merge';

/**
 * 클래스명을 조건부로 결합하고, Tailwind 클래스 충돌을 해결합니다.
 *
 * 사용 예시:
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4')
 * → 'py-1 px-4 bg-blue-500' (px-2와 px-4 충돌 시 px-4 우선)
 */


export function cn(...inputs){
    return twMerge(clsx(inputs));
}