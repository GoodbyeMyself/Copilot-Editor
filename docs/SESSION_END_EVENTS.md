# Copilot 会话结束事件钩子

## 概述

Copilot 组件现在支持会话结束事件钩子，可以在会话结束时触发自定义的业务逻辑。这个功能允许外部业务系统监听和处理各种会话结束场景。

## 功能特性

- ✅ **正常完成**：AI 完成回复后触发
- ✅ **手动终止**：用户点击中止按钮时触发
- ✅ **会话切换**：切换到其他会话时触发
- ✅ **会话删除**：删除会话时触发
- ✅ **创建新会话**：创建新会话时触发（旧会话结束）
- ✅ **组件卸载**：组件卸载时触发

## 类型定义

```typescript
// 会话结束原因
export type SessionEndReason = 
    | 'completed'      // 正常完成
    | 'aborted'        // 手动终止
    | 'switched'       // 会话切换
    | 'deleted'        // 会话删除
    | 'new_session'    // 创建新会话
    | 'unmounted';     // 组件卸载

// 会话结束事件数据
export interface SessionEndEventData {
    sessionId: string;        // 会话ID
    reason: SessionEndReason; // 结束原因
    messageCount?: number;    // 消息数量
    lastMessage?: any;        // 最后一条消息
    timestamp: number;        // 时间戳
}

// 事件处理函数类型
export type SessionEndHandler = (data: SessionEndEventData) => void;
```

## 使用方法

### 1. 在 CopilotLayout 中使用

```tsx
import React from 'react';
import CopilotLayout from '@/layouts/Copilot/layout';
import type { SessionEndEventData } from '@/types/session';

const MyComponent = () => {
    const handleSessionEnd = (data: SessionEndEventData) => {
        console.log('会话结束:', data);
        
        // 根据不同原因执行不同逻辑
        switch (data.reason) {
            case 'completed':
                // 正常完成的处理逻辑
                break;
            case 'aborted':
                // 手动终止的处理逻辑
                break;
            // ... 其他情况
        }
    };

    return (
        <CopilotLayout
            onSessionEnd={handleSessionEnd}
        >
            {/* 您的内容 */}
        </CopilotLayout>
    );
};
```

### 2. 在 Helper 页面中的示例

```tsx
// src/pages/Helper/index.tsx
const handleSessionEnd = (data: SessionEndEventData) => {
    console.log('🔔 会话结束事件:', data);
    
    switch (data.reason) {
        case 'completed':
            console.log(\`✅ 会话 \${data.sessionId} 正常完成，消息数量: \${data.messageCount}\`);
            // 记录会话统计、发送完成通知、保存会话摘要
            break;
            
        case 'aborted':
            console.log(\`⏹️ 会话 \${data.sessionId} 被手动终止，消息数量: \${data.messageCount}\`);
            // 记录终止原因、清理未完成的任务、发送终止通知
            break;
            
        case 'switched':
            console.log(\`🔄 从会话 \${data.sessionId} 切换到其他会话\`);
            // 保存当前会话状态、记录会话使用时长
            break;
            
        case 'deleted':
            console.log(\`🗑️ 会话 \${data.sessionId} 被删除\`);
            // 清理相关数据、记录删除日志、释放相关资源
            break;
            
        case 'unmounted':
            console.log(\`📤 组件卸载，会话 \${data.sessionId} 结束\`);
            // 保存会话状态、清理资源、发送离线通知
            break;
    }

    // 通用处理逻辑
    const sessionDuration = Date.now() - data.timestamp;
    console.log(\`📊 会话持续时间: \${sessionDuration}ms\`);
    
    // 调用外部API
    // analytics.trackSessionEnd(data);
};
```

## 业务场景示例

### 1. 会话统计分析

```typescript
const handleSessionEnd = (data: SessionEndEventData) => {
    // 发送统计数据到分析服务
    analytics.track('session_ended', {
        sessionId: data.sessionId,
        reason: data.reason,
        messageCount: data.messageCount,
        duration: Date.now() - data.timestamp
    });
};
```

### 2. 自动保存会话摘要

```typescript
const handleSessionEnd = (data: SessionEndEventData) => {
    if (data.reason === 'completed' && data.messageCount > 0) {
        // 生成会话摘要
        generateSessionSummary(data.sessionId, data.lastMessage);
    }
};
```

### 3. 资源清理

```typescript
const handleSessionEnd = (data: SessionEndEventData) => {
    if (data.reason === 'deleted' || data.reason === 'unmounted') {
        // 清理相关资源
        cleanupSessionResources(data.sessionId);
    }
};
```

### 4. 通知系统

```typescript
const handleSessionEnd = (data: SessionEndEventData) => {
    if (data.reason === 'aborted') {
        // 发送终止通知
        notificationService.send({
            type: 'session_aborted',
            sessionId: data.sessionId,
            timestamp: data.timestamp
        });
    }
};
```

## 注意事项

1. **异步处理**：事件处理函数应该是非阻塞的，避免影响用户体验
2. **错误处理**：在事件处理函数中添加适当的错误处理
3. **性能考虑**：避免在事件处理函数中执行耗时操作
4. **数据持久化**：确保重要数据在会话结束前已经保存

## 更新日志

- **v1.0.0** - 初始版本，支持所有会话结束场景的事件触发