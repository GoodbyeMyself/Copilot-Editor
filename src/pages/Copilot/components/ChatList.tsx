import React from 'react';
import { Button, Flex, Space } from 'antd';
import { Prompts, Welcome } from '@ant-design/x';
import { EllipsisOutlined, ShareAltOutlined } from '@ant-design/icons';

import { BaseChatList } from '@/components/shared/chat';

interface ChatListProps {
    messages: any[];
    hotTopics: any;
    designGuide: any;
    onSubmit: (val: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    messages,
    hotTopics,
    designGuide,
    onSubmit,
}) => {
    return (
        <div className="copilot-chat-list">
            {messages?.length ? (
                <BaseChatList
                    messages={messages}
                    onUserSubmit={onSubmit}
                    containerClassName="copilot-chat-list"
                    messageClassName="copilot-message-content"
                    loadingMessageClassName="copilot-loading-message"
                    cancelledLabelClassName="copilot-cancelled-label"
                    assistantHeaderClassName="copilot-assistant-header"
                    userHeaderClassName="copilot-user-header"
                    bubbleStyle={{ height: '100%' }}
                    bubblePadding="calc(10%)"
                />
            ) : (
                <Space
                    direction="vertical"
                    size={16}
                    style={{ paddingInline: 'calc(50% - 314px)' }}
                    className="copilot-placeholder"
                >
                    <Welcome
                        variant="borderless"
                        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                        title="Hello, I'm Copilot 智能助手"
                        description="基于 AI 打造更智能的数据查询与分析体验 ~"
                        style={{ marginBottom: 12 }}
                        extra={
                            <Space>
                                <Button icon={<ShareAltOutlined />} />
                                <Button icon={<EllipsisOutlined />} />
                            </Space>
                        }
                    />
                    <Flex gap={16}>
                        <Prompts
                            items={[hotTopics]}
                            styles={{
                                list: { height: '100%' },
                                item: {
                                    flex: 1,
                                    backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                                    borderRadius: 12,
                                    border: 'none',
                                },
                                subItem: { padding: 0, background: 'transparent' },
                            }}
                            onItemClick={(info) => {
                                onSubmit(info.data.description as string);
                            }}
                            className="copilot-chat-prompt"
                        />

                        <Prompts
                            items={[designGuide]}
                            styles={{
                                item: {
                                    flex: 1,
                                    backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                                    borderRadius: 12,
                                    border: 'none',
                                },
                                subItem: { background: '#ffffffa6' },
                            }}
                            onItemClick={(info) => {
                                onSubmit(info.data.description as string);
                            }}
                            className="copilot-chat-prompt"
                        />
                    </Flex>
                </Space>
            )}
        </div>
    );
};

export default ChatList; 