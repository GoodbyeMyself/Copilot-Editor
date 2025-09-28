
import React, { useRef, useState } from 'react';

// 助手式 公共布局
import CopilotLayout from '@/layouts/Copilot/layout';
import type { SessionEndEventData } from '@/types/session';

import './styles.less';


const HelperPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);
    const copilotRef = useRef<any>(null);

    // ==================== 会话结束事件处理 =================
    const handleSessionEnd = (data: SessionEndEventData) => {
        // --
        console.log('🔔 会话结束事件:', data);
        
        // 根据不同的结束原因执行不同的业务逻辑
        switch (data.reason) {
            case 'completed':
                // --
                console.log(`✅ 会话 ${data.sessionId} 正常完成，消息数量: ${data.messageCount}`);
                // 这里可以添加正常完成的业务逻辑，例如：记录会话统计、发送完成通知、保存会话摘要
                break;
                
            case 'aborted':
                // --
                console.log(`⏹️ 会话 ${data.sessionId} 被手动终止，消息数量: ${data.messageCount}`);
                // 这里可以添加手动终止的业务逻辑，例如：记录终止原因、清理未完成的任务、发送终止通知
                break;
                
            case 'switched':
                // --
                console.log(`🔄 从会话 ${data.sessionId} 切换到其他会话，消息数量: ${data.messageCount}`);
                // 这里可以添加会话切换的业务逻辑，例如：保存当前会话状态、记录会话使用时长、预加载新会话数据
                break;
                
            case 'deleted':
                // --
                console.log(`🗑️ 会话 ${data.sessionId} 被删除，消息数量: ${data.messageCount}`);
                // 这里可以添加会话删除的业务逻辑，例如：清理相关数据、记录删除日志、释放相关资源
                break;
                
            case 'new_session':
                // --
                console.log(`🆕 创建新会话，旧会话 ${data.sessionId} 结束，消息数量: ${data.messageCount}`);
                // 这里可以添加创建新会话的业务逻辑，例如：保存旧会话数据、初始化新会话环境、记录会话创建日志
                break;
                
            case 'unmounted':
                // --
                console.log(`📤 组件卸载，会话 ${data.sessionId} 结束，消息数量: ${data.messageCount}`);
                // 这里可以添加组件卸载的业务逻辑，例如：保存会话状态、清理资源、发送离线通知
                break;
                
            default:
                console.log(`❓ 未知的会话结束原因: ${data.reason}`);
        }
      
        // 这里可以处理 外部业务响应
        // todo
    };

    return (
        <div
            className="helper-page"
        >
            <CopilotLayout
                onCopilotRefReady={(ref) => { copilotRef.current = ref.current; }}
                onClose={() => setCopilotOpen(false)}
                onSessionEnd={handleSessionEnd}
                copilotWidth={{
                    defaultSize: 45,
                    minSize: 45,
                    maxSize: 80
                }}
            >
                {!copilotOpen && (
                    <div
                        onClick={() => {
                            copilotRef.current?.expand();
                            setCopilotOpen(true);
                        }}
                        className="helper-workarea-header-button"
                    >
                        ✨ AI Copilot
                    </div>
                )}
            </CopilotLayout>
        </div>
    );
};

export default HelperPage;
