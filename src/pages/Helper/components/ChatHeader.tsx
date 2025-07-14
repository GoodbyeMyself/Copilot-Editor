import {
    CloseOutlined,
    CommentOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';

import {
    Conversations,
} from '@ant-design/x';

import type { Conversation } from '@ant-design/x/es/conversations';

import { Button, Popover, Space, message, Modal } from 'antd';

import dayjs from 'dayjs';

import React from 'react';

import { clearAllStorage } from '../utils/storage';

interface ChatHeaderProps {
    sessionList: Conversation[];
    curSession: string;
    messages: any[];
    isRequesting: boolean;
    onSetCopilotOpen: (open: boolean) => void;
    onSetSessionList: (sessions: Conversation[]) => void;
    onSetCurSession: (session: string) => void;
    onSetMessages: (messages: any[]) => void;
    onAbort: () => void;
    onClearHistory?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    sessionList,
    curSession,
    messages,
    isRequesting,
    onSetCopilotOpen,
    onSetSessionList,
    onSetCurSession,
    onSetMessages,
    onAbort,
    onClearHistory,
}) => {

    const handleClearHistory = () => {
        Modal.confirm({
            title: '清除历史记录',
            content: '确定要清除所有会话历史记录吗？此操作不可恢复。',
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                clearAllStorage();
                onClearHistory?.();
                message.success('历史记录已清除');
            },
        });
    };

    return (
        <div className="helper-chat-header">
            <div className="helper-header-title">✨ AI Copilot</div>
            <Space size={0}>
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        if (isRequesting) {
                            message.error(
                                'Message is Requesting, you can create a new conversation after request done or abort it right now...',
                            );
                            return;
                        }

                        if (messages?.length) {
                            const timeNow = dayjs().valueOf().toString();
                            onAbort();
                            // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                            // In future versions, the sessionId capability will be added to resolve this problem.
                            setTimeout(() => {
                                onSetSessionList([
                                    { key: timeNow, label: 'New session', group: 'Today' },
                                    ...sessionList,
                                ]);
                                onSetCurSession(timeNow);
                                onSetMessages([]);
                            }, 100);
                        } else {
                            message.error('It is now a new conversation.');
                        }
                    }}
                    className="helper-header-button"
                />
                <Popover
                    placement="bottom"
                    styles={{ body: { padding: 0, maxHeight: 600 } }}
                    content={
                        <div>
                            <Conversations
                                items={sessionList?.map((i) =>
                                    i.key === curSession ? { ...i, label: `[current] ${i.label}` } : i,
                                )}
                                activeKey={curSession}
                                groupable
                                onActiveChange={async (val) => {
                                    onAbort();
                                    // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                                    // In future versions, the sessionId capability will be added to resolve this problem.
                                    setTimeout(() => {
                                        onSetCurSession(val);
                                        // 消息恢复逻辑已移至主组件的onSetCurSession回调中处理
                                    }, 100);
                                }}
                                styles={{ item: { padding: '0 8px' } }}
                                className="helper-conversations"
                            />
                            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                                <Button 
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={handleClearHistory}
                                    style={{ width: '100%' }}
                                >
                                    清除历史记录
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <Button type="text" icon={<CommentOutlined />} className="helper-header-button" />
                </Popover>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => onSetCopilotOpen(false)}
                    className="helper-header-button"
                />
            </Space>
        </div>
    );
};

export default ChatHeader; 