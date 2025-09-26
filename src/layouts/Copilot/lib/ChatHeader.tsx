import {
    CloseOutlined,
    CommentOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from '@ant-design/icons';

import {
    Conversations,
} from '@ant-design/x';

import type { Conversation } from '@ant-design/x/es/conversations';

import { Button, Popover, Space, Modal, Input, App } from 'antd';

import dayjs from 'dayjs';

import React, { useState } from 'react';

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
    onDeleteSession: (sessionId: string) => void;
    onCollapsePanel?: () => void;
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
    onDeleteSession,
    onCollapsePanel,
}) => {
    // 使用 App.useApp() 获取 message 方法
    const { message } = App.useApp();
    
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameSessionId, setRenameSessionId] = useState<string>('');
    const [newSessionName, setNewSessionName] = useState<string>('');

    const handleRename = (sessionId: string, currentName: string) => {
        // 正在请求时禁止重命名，保持与 Copilot 对齐
        if (isRequesting) {
            message.error('请先等待会话输出完成，再进行会话重命名');
            return;
        }
        setRenameSessionId(sessionId);
        setNewSessionName(currentName);
        setRenameModalVisible(true);
    };

    const handleRenameConfirm = () => {
        if (!newSessionName.trim()) {
            message.error('会话名称不能为空');
            return;
        }

        const updatedSessionList = sessionList.map(session => 
            session.key === renameSessionId 
                ? { ...session, label: newSessionName.trim() }
                : session
        );
        
        onSetSessionList(updatedSessionList);
        setRenameModalVisible(false);
        setRenameSessionId('');
        setNewSessionName('');
        message.success('重命名成功');
    };

    const handleDelete = (sessionId: string) => {
        Modal.confirm({
            title: '删除会话',
            content: '确定要删除这个会话吗？此操作不可恢复。',
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                const newSessionList = sessionList.filter(session => session.key !== sessionId);
                
                // 如果删除后没有会话了，创建一个新的默认会话
                if (newSessionList.length === 0) {
                    const timeNow = dayjs().valueOf().toString();

                    const defaultSession = {
                        key: timeNow,
                        label: '新会话',
                        group: 'Today'
                    };

                    onSetSessionList([defaultSession]);
                    onSetCurSession(timeNow);
                    onSetMessages([]);
                } else {
                    onSetSessionList(newSessionList);
                    // 如果删除的是当前会话，清空消息显示欢迎页面，不切换到其他会话
                    if (sessionId === curSession) {
                        onSetMessages([]);
                        // 保持当前会话ID不变，通过清空消息来显示欢迎页面
                    }
                }
                
                onDeleteSession(sessionId);

                message.success('会话已删除');
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
                                    {
                                        key: timeNow,
                                        label: '新会话',
                                        group: 'Today'
                                    },
                                    ...sessionList,
                                ]);
                                onSetCurSession(timeNow);
                                onSetMessages([]);
                            }, 100);
                        } else {
                            message.error('已经是一个新的会话窗口了.');
                        }
                    }}
                    className="helper-header-button"
                />
                <Popover
                    placement="bottom"
                    styles={{ body: { padding: 0, maxHeight: 600 } }}
                    content={
                        <Conversations
                            items={sessionList?.map((i) => i)}
                            activeKey={curSession}
                            groupable
                            onActiveChange={async (val) => {
                                // 正在请求时禁止切换，保持与 Copilot 对齐
                                if (isRequesting) {
                                    message.error('请先等待会话输出完成，再进行会话切换');
                                    return;
                                }

                                // 安全中止当前请求
                                try {
                                    onAbort();
                                } catch (error) {
                                    // noop
                                }
                                // 避免时序问题
                                setTimeout(() => {
                                    onSetCurSession(val);
                                    // 消息恢复逻辑已移至主组件的onSetCurSession回调中处理
                                }, 100);
                            }}
                            styles={{ item: { padding: '0 8px' } }}
                            className="helper-conversations"
                            menu={(conversation) => ({
                                items: [
                                    {
                                        label: '重命名',
                                        key: 'rename',
                                        icon: <EditOutlined />,
                                        onClick: (event) => {
                                            event?.domEvent?.stopPropagation?.();
                                            handleRename(conversation.key, String(conversation.label || ''));
                                        },
                                    },
                                    {
                                        label: '删除',
                                        key: 'delete',
                                        icon: <DeleteOutlined />,
                                        danger: true,
                                        onClick: (event) => {
                                            event?.domEvent?.stopPropagation?.();
                                            handleDelete(conversation.key);
                                        },
                                    },
                                ],
                            })}
                        />
                    }
                >
                    <Button type="text" icon={<CommentOutlined />} className="helper-header-button" />
                </Popover>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => {
                        onSetCopilotOpen(false);
                        onCollapsePanel?.();
                    }}
                    className="helper-header-button"
                />
            </Space>

            {/* 重命名模态框 */}
            <Modal
                title="重命名会话"
                open={renameModalVisible}
                onOk={handleRenameConfirm}
                onCancel={() => {
                    setRenameModalVisible(false);
                    setRenameSessionId('');
                    setNewSessionName('');
                }}
                okText="确定"
                cancelText="取消"
            >
                <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="请输入新的会话名称"
                    onPressEnter={handleRenameConfirm}
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default ChatHeader; 