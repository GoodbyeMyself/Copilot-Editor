import React from 'react';
import { Avatar, Button, message } from 'antd';
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
}) => {
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
                    onCurConversationChange(now);
                    onMessagesChange([]);
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
                activeKey={curConversation}
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
                        },
                        {
                            label: '删除',
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => {
                                const newList = conversations.filter((item) => item.key !== conversation.key);
                                const newKey = newList?.[0]?.key;
                                onConversationsChange(newList);
                                // 删除操作会修改 curConversation 并触发 onActiveChange，因此需要延迟执行以确保最终正确覆盖
                                // 此功能将在未来版本中修复
                                setTimeout(() => {
                                    if (conversation.key === curConversation) {
                                        onCurConversationChange(newKey);
                                        onMessagesChange(messageHistory?.[newKey] || []);
                                    }
                                }, 200);
                            },
                        },
                    ],
                })}
            />

            <div className="copilot-sider-footer">
                <Avatar size={24} />
                <Button type="text" icon={<QuestionCircleOutlined />} />
            </div>
        </div>
    );
};

export default ChatSider; 