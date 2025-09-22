import { useCallback, useRef } from 'react';

/**
 * 防抖滚动Hook - 用于减少频繁的滚动操作
 */
export function useDebouncedScroll(delay: number = 16) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollTimeRef = useRef<number>(0);

    const debouncedScroll = useCallback((callback: () => void) => {
        const now = Date.now();
        
        // 如果距离上次滚动时间小于延迟，则清除之前的定时器
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 设置新的定时器
        timeoutRef.current = setTimeout(() => {
            callback();
            lastScrollTimeRef.current = now;
        }, delay);

    }, [delay]);

    const immediateScroll = useCallback((callback: () => void) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        callback();
        lastScrollTimeRef.current = Date.now();
    }, []);

    return {
        debouncedScroll,
        immediateScroll
    };
}