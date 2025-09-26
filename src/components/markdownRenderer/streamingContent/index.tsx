import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { StreamingMarkdownRenderer } from '../index';
import { useDebouncedScroll } from '@/hooks/use-debounced-scroll';
import styles from './styles.less';

interface StreamingContentProps {
    content: string;
    isStreaming: boolean;
    onContentUpdate?: () => void;
    className?: string;
    scrollContainer?: HTMLElement | null;
    autoScroll?: boolean;
}

/**
 * 专门用于SSE流式内容的优化组件
 * 特点：
 * 1. 减少不必要的重新渲染
 * 2. 智能滚动管理
 * 3. 内容变化时的平滑过渡
 */
const StreamingContent: React.FC<StreamingContentProps> = ({
    content,
    isStreaming,
    onContentUpdate,
    className,
    scrollContainer,
    autoScroll = true
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousContentRef = useRef<string>('');
    const { debouncedScroll, immediateScroll } = useDebouncedScroll(50); // 增加防抖时间，减少滚动频率

    // 检测内容是否为增量更新
    const isIncremental = useMemo(() => {
        const prevContent = previousContentRef.current;
        const isIncrement = content.startsWith(prevContent) && content.length > prevContent.length;
        return isIncrement;
    }, [content]);

    // 平滑滚动到底部的函数
    const scrollToBottom = useCallback(() => {
        if (!autoScroll || !scrollContainer) return;
        
        // 使用requestAnimationFrame确保在下一帧执行
        requestAnimationFrame(() => {
            try {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            } catch (error) {
                // 降级到直接设置scrollTop
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        });
    }, [autoScroll, scrollContainer]);

    // 处理内容更新
    useEffect(() => {
        if (content !== previousContentRef.current) {
            // 如果是流式输出且为增量内容，使用防抖滚动
            if (isStreaming && isIncremental) {
                debouncedScroll(scrollToBottom);
            } else {
                // 非增量内容或非流式，立即滚动
                immediateScroll(scrollToBottom);
            }

            previousContentRef.current = content;
            onContentUpdate?.();
        }
    }, [content, isStreaming, isIncremental, debouncedScroll, immediateScroll, scrollToBottom, onContentUpdate]);

    // 使用 memo 来避免不必要的重新渲染
    const renderedContent = useMemo(() => {
        return (
            <StreamingMarkdownRenderer>
                {content}
            </StreamingMarkdownRenderer>
        );
    }, [content]);

    return (
        <div 
            ref={containerRef}
            className={`${styles.streamingContainer} ${isStreaming ? styles.streaming : styles.static} ${className || ''}`}
        >
            {renderedContent}
        </div>
    );
};

export default StreamingContent;