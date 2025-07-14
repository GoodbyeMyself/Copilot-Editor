import {
    CopyOutlined,
    DislikeOutlined,
    LikeOutlined,
    ReloadOutlined,
    RobotOutlined,
    UserOutlined,
} from '@ant-design/icons';

import {
    Bubble,
    Prompts,
    Welcome
} from '@ant-design/x';

import { Avatar, Button, Space, Spin } from 'antd';

import React from 'react';

import { MOCK_QUESTIONS, AGENT_PLACEHOLDER } from '../constants';

interface ChatListProps {
    messages: any[];
    onUserSubmit?: (val: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    messages,
    onUserSubmit,
}) => {
    return (
        <div className="helper-chat-list">
            {messages?.length ? (
                /** 消息列表 */
                <Bubble.List
                    style={{ height: '100%', paddingInline: 16 }}
                    items={messages?.map((i) => ({
                        ...i.message,
                        classNames: {
                            content: i.status === 'loading' ? 'helper-loading-message' : '',
                        },
                        typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                    }))}
                    roles={{
                        assistant: {
                            placement: 'start',
                            avatar: (
                                <Avatar 
                                    style={{ backgroundColor: '#1677ff' }}
                                    icon={<RobotOutlined />}
                                />
                            ),
                            header: (
                                <div className="helper-assistant-header">
                                    AI 助手
                                </div>
                            ),
                            footer: (
                                <div style={{ display: 'flex' }}>
                                    <Button type="text" size="small" icon={<ReloadOutlined />} />
                                    <Button type="text" size="small" icon={<CopyOutlined />} />
                                    <Button type="text" size="small" icon={<LikeOutlined />} />
                                    <Button type="text" size="small" icon={<DislikeOutlined />} />
                                </div>
                            ),
                            loadingRender: () => (
                                <Space>
                                    <Spin size="small" />
                                    {AGENT_PLACEHOLDER}
                                </Space>
                            ),
                        },
                        user: {
                            placement: 'end',
                            avatar: (
                                <Avatar 
                                    style={{ backgroundColor: '#87d068' }}
                                    icon={<UserOutlined />}
                                />
                            ),
                            header: (
                                <div className="helper-user-header">
                                    用户
                                </div>
                            ),
                        },
                    }}
                />
            ) : (
                <>
                    <Welcome
                        style={{
                            backgroundImage: 'linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)',
                            borderStartStartRadius: 4,
                        }}
                        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                        title="Hi! I'm SQL Copilot 智能助手"
                        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
                    />
                    <Prompts
                        vertical
                        title="我可以帮助您："
                        items={MOCK_QUESTIONS.map((i) => ({ key: i, description: i }))}
                        onItemClick={(info) => onUserSubmit?.(info?.data?.description as string)}
                        style={{
                            marginInline: 16,
                        }}
                        styles={{
                            title: { fontSize: 14 },
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default ChatList; 