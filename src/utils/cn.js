import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind 클래스명을 안전하게 병합해주는 유틸리티
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
