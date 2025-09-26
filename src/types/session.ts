// 会话结束事件类型定义

// 会话结束原因枚举
export type SessionEndReason = 
    | 'completed'      // 正常完成
    | 'aborted'        // 手动终止
    | 'switched'       // 会话切换
    | 'deleted'        // 会话删除
    | 'new_session'    // 创建新会话
    | 'unmounted';     // 组件卸载

// 会话结束事件数据接口
export interface SessionEndEventData {
    sessionId: string;
    reason: SessionEndReason;
    messageCount?: number;
    lastMessage?: any;
    timestamp: number;
}

// 会话结束事件处理函数类型
export type SessionEndHandler = (data: SessionEndEventData) => void;