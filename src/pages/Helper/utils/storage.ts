import type { Conversation } from '@ant-design/x/es/conversations';

// localStorage 键名常量
const STORAGE_KEYS = {
    SESSION_LIST: 'helper_copilot_session_list',
    MESSAGE_HISTORY: 'helper_copilot_message_history',
    CURRENT_SESSION: 'helper_copilot_current_session',
} as const;

/**
 * 保存会话列表到 localStorage
 */
export const saveSessionList = (sessionList: Conversation[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.SESSION_LIST, JSON.stringify(sessionList));
    } catch (error) {
        console.error('保存会话列表失败:', error);
    }
};

/**
 * 从 localStorage 加载会话列表
 */
export const loadSessionList = (): Conversation[] | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SESSION_LIST);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('加载会话列表失败:', error);
        return null;
    }
};

/**
 * 保存消息历史记录到 localStorage
 */
export const saveMessageHistory = (messageHistory: Record<string, any>): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.MESSAGE_HISTORY, JSON.stringify(messageHistory));
    } catch (error) {
        console.error('保存消息历史失败:', error);
    }
};

/**
 * 从 localStorage 加载消息历史记录
 */
export const loadMessageHistory = (): Record<string, any> => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.MESSAGE_HISTORY);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('加载消息历史失败:', error);
        return {};
    }
};

/**
 * 保存当前会话ID到 localStorage
 */
export const saveCurrentSession = (sessionId: string): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } catch (error) {
        console.error('保存当前会话失败:', error);
    }
};

/**
 * 从 localStorage 加载当前会话ID
 */
export const loadCurrentSession = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
        console.error('加载当前会话失败:', error);
        return null;
    }
};

/**
 * 清除所有存储的数据
 */
export const clearAllStorage = (): void => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('清除存储数据失败:', error);
    }
}; 