import React from 'react';
import { Avatar, Button, Flex, Space, Spin } from 'antd';
import { Bubble, Prompts, Welcome } from '@ant-design/x';
import {
    CopyOutlined,
    DislikeOutlined,
    EllipsisOutlined,
    LikeOutlined,
    ReloadOutlined,
    RobotOutlined,
    ShareAltOutlined,
    UserOutlined,
} from '@ant-design/icons';

interface ChatListProps {
    styles: any;
    messages: any[];
    hotTopics: any;
    designGuide: any;
    onSubmit: (val: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    styles,
    messages,
    hotTopics,
    designGuide,
    onSubmit,
}) => {
    return (
        <div className={styles.chatList}>
            {messages?.length ? (
                /* 🌟 消息列表 */
                <Bubble.List
                    items={messages?.map((i) => ({
                        ...i.message,
                        classNames: {
                            content: i.status === 'loading' ? styles.loadingMessage : '',
                        },
                        typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                    }))}
                    style={{
                        height: '100%',
                        paddingInline: 'calc(10%)'
                    }}
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
                            loadingRender: () => <Spin size="small" />,
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
                <Space
                    direction="vertical"
                    size={16}
                    style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
                    className={styles.placeholder}
                >
                    <Welcome
                        variant="borderless"
                        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                        title="Hello, I'm Ant Design X"
                        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
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
                            className={styles.chatPrompt}
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
                            className={styles.chatPrompt}
                        />
                    </Flex>
                </Space>
            )}
        </div>
    );
};

export default ChatList; 