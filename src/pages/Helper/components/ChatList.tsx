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
} from '@ant-design/x';

import { Avatar, Button, Space, Spin } from 'antd';

import React from 'react';

import { MOCK_QUESTIONS, AGENT_PLACEHOLDER } from '../constants';

interface ChatListProps {
    styles: any;
    messages: any[];
    onUserSubmit: (val: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    styles,
    messages,
    onUserSubmit,
}) => {
    return (
        <div className={styles.chatList}>
            {messages?.length ? (
                /** 消息列表 */
                <Bubble.List
                    style={{ height: '100%', paddingInline: 16 }}
                    items={messages?.map((i) => ({
                        ...i.message,
                        classNames: {
                            content: i.status === 'loading' ? styles.loadingMessage : '',
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
                                <div className={styles.assistantHeader}>
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
                                <div className={styles.userHeader}>
                                    用户
                                </div>
                            ),
                        },
                    }}
                />
            ) : (
                <>
                    <Prompts
                        vertical
                        title="I can help："
                        items={MOCK_QUESTIONS.map((i) => ({ key: i, description: i }))}
                        onItemClick={(info) => onUserSubmit(info?.data?.description as string)}
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