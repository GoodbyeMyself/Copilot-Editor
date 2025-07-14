import React, { useState } from 'react';
import { Avatar, Button, message, Modal, Input } from 'antd';
import { Conversations } from '@ant-design/x';
import { EditOutlined, DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ChatSiderProps {
    conversations: any[];
    curConversation: string;
    messageHistory: Record<string, any>;
    isRequesting: boolean;
    abortController: React.MutableRefObject<AbortController | null>;
    onConversationsChange: (conversations: any[]) => void;
    onCurConversationChange: (key: string) => void;
    onMessagesChange: (messages: any[]) => void;
    onMessageHistoryChange?: (history: Record<string, any>) => void;
    isInitialLoad?: boolean;
}

const ChatSider: React.FC<ChatSiderProps> = ({
    conversations,
    curConversation,
    messageHistory,
    isRequesting,
    abortController,
    onConversationsChange,
    onCurConversationChange,
    onMessagesChange,
    onMessageHistoryChange,
    isInitialLoad = false,
}) => {
    // 重命名相关状态
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameConversationKey, setRenameConversationKey] = useState<string>('');
    const [newConversationName, setNewConversationName] = useState<string>('');

    // 处理重命名
    const handleRename = (conversationKey: string, currentName: string) => {
        setRenameConversationKey(conversationKey);
        setNewConversationName(currentName);
        setRenameModalVisible(true);
    };

    // 确认重命名
    const handleRenameConfirm = () => {
        if (!newConversationName.trim()) {
            message.error('会话名称不能为空');
            return;
        }

        const updatedConversations = conversations.map(conversation => 
            conversation.key === renameConversationKey 
                ? { ...conversation, label: newConversationName.trim() }
                : conversation
        );
        
        onConversationsChange(updatedConversations);
        setRenameModalVisible(false);
        setRenameConversationKey('');
        setNewConversationName('');
        message.success('重命名成功');
    };

    // 处理删除
    const handleDelete = (conversationKey: string) => {
        Modal.confirm({
            title: '删除会话',
            content: '确定要删除这个会话吗？此操作不可恢复。',
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                const newConversations = conversations.filter(conversation => conversation.key !== conversationKey);
                
                // 如果删除后没有会话了，创建一个新的默认会话
                if (newConversations.length === 0) {
                    const timeNow = dayjs().valueOf().toString();
                    const defaultConversation = { 
                        key: timeNow, 
                        label: '新会话 1', 
                        group: 'Today' 
                    };
                    onConversationsChange([defaultConversation]);
                    onCurConversationChange(timeNow);
                    onMessagesChange([]);
                } else {
                    onConversationsChange(newConversations);
                    // 如果删除的是当前会话，切换到第一个会话
                    if (conversationKey === curConversation) {
                        const newKey = newConversations[0].key;
                        onCurConversationChange(newKey);
                        onMessagesChange(messageHistory?.[newKey] || []);
                    }
                }
                
                // 删除对应的消息历史
                if (onMessageHistoryChange) {
                    const newHistory = { ...messageHistory };
                    delete newHistory[conversationKey];
                    onMessageHistoryChange(newHistory);
                }
                
                message.success('会话删除成功');
            },
        });
    };

    return (
        <div className="copilot-sider">
            {/* 🌟 Logo */}
            <div className="copilot-logo">
                <img
                    src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                    draggable={false}
                    alt="logo"
                    width={24}
                    height={24}
                />
                <span>独立式 Copilot</span>
            </div>

            {/* 🌟 添加会话 */}
            <Button
                onClick={() => {
                    if (isRequesting) {
                        message.error(
                            '消息正在请求中，您可以在请求完成后创建新会话或立即中止它...',
                        );
                        return;
                    }

                    const now = dayjs().valueOf().toString();
                    const newConversations = [
                        {
                            key: now,
                            label: `新会话 ${conversations.length + 1}`,
                            group: 'Today',
                        },
                        ...conversations,
                    ];
                    onConversationsChange(newConversations);
                    // 使用 onCurConversationChange 而不是直接调用 onMessagesChange
                    onCurConversationChange(now);
                }}
                type="link"
                className="copilot-add-btn"
                icon={<PlusOutlined />}
            >
                新建会话
            </Button>

            {/* 🌟 会话管理 */}
            <Conversations
                items={conversations}
                className="copilot-conversations"
                activeKey={isInitialLoad ? undefined : curConversation}
                onActiveChange={async (val) => {
                    // 安全地中止当前请求
                    if (abortController.current) {
                        try {
                            abortController.current.abort('切换会话');
                        } catch (error) {
                            console.warn('中止请求时出错:', error);
                        }
                    }
                    // 等待中止操作完成，避免时序问题
                    setTimeout(() => {
                        onCurConversationChange(val);
                        onMessagesChange(messageHistory?.[val] || []);
                    }, 100);
                }}
                groupable
                styles={{ item: { padding: '0 8px' } }}
                menu={(conversation) => ({
                    items: [
                        {
                            label: '重命名',
                            key: 'rename',
                            icon: <EditOutlined />,
                            onClick: () => handleRename(conversation.key, String(conversation.label || '')),
                        },
                        {
                            label: '删除',
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => handleDelete(conversation.key),
                        },
                    ],
                })}
            />

            {/* 🌟 底部 */}
            <div className="copilot-sider-footer">
                <Avatar size={24} />
                <Button type="text" icon={<QuestionCircleOutlined />} />
            </div>

            {/* 重命名模态框 */}
            <Modal
                title="重命名会话"
                open={renameModalVisible}
                onOk={handleRenameConfirm}
                onCancel={() => {
                    setRenameModalVisible(false);
                    setRenameConversationKey('');
                    setNewConversationName('');
                }}
                okText="确定"
                cancelText="取消"
            >
                <Input
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="请输入新的会话名称"
                    onPressEnter={handleRenameConfirm}
                />
            </Modal>
        </div>
    );
};

export default ChatSider; 