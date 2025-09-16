import { useRef } from 'react';
import { calculateThinkDuration } from '../utils';

/**
 * 思考时间管理 Hook
 * 用于跟踪和管理消息的思考时间
 */
export const useThinkTiming = () => {
    const thinkStartRef = useRef<Map<string, number>>(new Map());
    const thinkDurationRef = useRef<Map<string, number>>(new Map());

    /**
     * 记录思考开始时间
     * @param messageKey 消息键
     */
    const recordThinkStart = (messageKey: string) => {
        if (!thinkStartRef.current.has(messageKey)) {
            thinkStartRef.current.set(messageKey, Date.now());
        }
    };

    /**
     * 计算并记录思考用时
     * @param messageKey 消息键
     * @param metaDuration 元数据中的用时
     * @returns 用时（秒）
     */
    const calculateAndRecordDuration = (messageKey: string, metaDuration?: number): number => {
        // 如果已经有记录的用时，直接返回
        if (thinkDurationRef.current.has(messageKey)) {
            return thinkDurationRef.current.get(messageKey) || 0;
        }

        // 优先使用元数据中的用时
        if (typeof metaDuration === 'number') {
            thinkDurationRef.current.set(messageKey, metaDuration);
            return metaDuration;
        }

        // 计算实际用时
        const startAt = thinkStartRef.current.get(messageKey);
        if (startAt) {
            const elapsedSec = calculateThinkDuration(startAt);
            thinkDurationRef.current.set(messageKey, elapsedSec);
            return elapsedSec;
        }

        return 0;
    };

    /**
     * 清理指定消息的时间记录
     * @param messageKey 消息键
     */
    const clearTiming = (messageKey: string) => {
        thinkStartRef.current.delete(messageKey);
        thinkDurationRef.current.delete(messageKey);
    };

    /**
     * 清理所有时间记录
     */
    const clearAllTiming = () => {
        thinkStartRef.current.clear();
        thinkDurationRef.current.clear();
    };

    return {
        recordThinkStart,
        calculateAndRecordDuration,
        clearTiming,
        clearAllTiming,
    };
};