import React, { useState } from 'react';
import { Avatar, Button, Modal, Input, App } from 'antd';
import { Conversations } from '@ant-design/x';
import { EditOutlined, DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ChatSiderProps {
    conversations: any[];
    curConversation: string | null;
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
    // 使用 App.useApp() 获取 message 和 modal 方法
    const { message, modal } = App.useApp();
    
    // 重命名相关状态
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameConversationKey, setRenameConversationKey] = useState<string>('');
    const [newConversationName, setNewConversationName] = useState<string>('');

    // 处理重命名
    const handleRename = (conversationKey: string, currentName: string) => {
        // 检查是否正在请求中，如果是则阻止重命名并显示提示
        if (isRequesting) {
            message.error('请先等待会话输出完成，再进行会话重命名');
            return;
        }
        
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
        // 检查是否正在请求中，如果是则阻止删除并显示提示
        if (isRequesting) {
            message.error('请先等待会话输出完成，再进行会话删除');
            return;
        }
        
        modal.confirm({
            title: '删除会话',
            content: '确定要删除这个会话吗？此操作不可恢复。',
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                const newConversations = conversations.filter(conversation => conversation.key !== conversationKey);
                
                // 删除会话，如果删除后没有会话了，则清空会话列表
                onConversationsChange(newConversations);
                
                // 如果删除的是当前会话，且还有其他会话，切换到第一个会话
                if (conversationKey === curConversation && newConversations.length > 0) {
                    const newKey = newConversations[0].key;
                    onCurConversationChange(newKey);
                    onMessagesChange(messageHistory?.[newKey] || []);
                } else if (conversationKey === curConversation && newConversations.length === 0) {
                    // 如果删除的是当前会话，且没有其他会话了，设置为null
                    onCurConversationChange('');
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
            {conversations.length === 0 ? (
                <div className="copilot-empty-state">
                    <div className="copilot-empty-content">
                        <div className="copilot-empty-icon">
                            <img
                                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                                alt="logo"
                                width={48}
                                height={48}
                            />
                        </div>
                        <div className="copilot-empty-text">
                            <h3>欢迎使用 Copilot Editor</h3>
                            <p>点击上方&ldquo;新建会话&rdquo;开始您的第一次对话</p>
                        </div>
                    </div>
                </div>
            ) : (
                <Conversations
                    items={conversations}
                    className="copilot-conversations"
                    activeKey={isInitialLoad ? undefined : (curConversation || undefined)}
                    onActiveChange={async (val) => {
                        // 检查是否正在请求中，如果是则阻止切换并显示提示
                        if (isRequesting) {
                            message.error('请先等待会话输出完成，再进行会话切换');
                            return;
                        }
                        
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
                                onClick: (event) => {
                                    // 阻止事件冒泡，防止点击重命名时选中会话
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
                                    // 阻止事件冒泡，防止点击删除时选中会话
                                    event?.domEvent?.stopPropagation?.();
                                    handleDelete(conversation.key);
                                },
                            },
                        ],
                    })}
                />
            )}

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