import { ThinkContent } from './types';

/**
 * 解析包含 <think> 思考过程的消息内容
 * @param content 消息内容
 * @returns 解析后的思考内容和剩余内容
 */
export const parseThinkContent = (content?: string): ThinkContent => {
    if (!content) return { think: '', rest: '', hasThink: false, thinkClosed: true };
    
    const start = content.indexOf('<think>');
    if (start === -1) return { think: '', rest: content, hasThink: false, thinkClosed: true };
    
    const end = content.indexOf('</think>');
    if (end === -1) {
        const think = content.slice(start + 7);
        const rest = content.slice(0, start);
        return { think, rest, hasThink: true, thinkClosed: false };
    }
    
    const think = content.slice(start + 7, end);
    const rest = content.slice(0, start) + content.slice(end + 8);
    return { think, rest, hasThink: true, thinkClosed: true };
};

/**
 * 计算思考用时（秒）
 * @param startTime 开始时间戳
 * @returns 用时（秒）
 */
export const calculateThinkDuration = (startTime: number): number => {
    return Math.max(0, Math.round((Date.now() - startTime) / 1000));
};

/**
 * 生成消息的唯一键
 * @param message 消息对象
 * @param index 索引
 * @returns 唯一键
 */
export const generateMessageKey = (message: any, index: number): string => {
    // 优先使用嵌套的 message.id 作为稳定键，避免外层包装对象的 id 在状态切换时变化
    return (
        message?.message?.id ||
        message?.message?.key ||
        message?.id ||
        message?.key ||
        String(index)
    );
};

/**
 * 检查内容是否包含取消标记
 * @param content 内容
 * @returns 是否包含取消标记
 */
export const hasCancelMark = (content: string): boolean => {
    return typeof content === 'string' && content.includes('--- [请求已取消] ---');
};

/**
 * 分割取消标记内容
 * @param content 内容
 * @returns 分割后的内容数组
 */
export const splitCancelContent = (content: string): string[] => {
    return content.split('--- [请求已取消] ---');
};