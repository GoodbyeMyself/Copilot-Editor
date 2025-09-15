import React from 'react';
import { Avatar, Button, Flex, Space, Spin } from 'antd';
import { Bubble, Prompts, Welcome, ThoughtChain as AntThoughtChain } from '@ant-design/x';
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
    // 解析包含 <think> 思考过程 的消息内容
    const parseThinkContent = (content?: string) => {
        if (!content) return { think: '', rest: '', hasThink: false, thinkClosed: true };
        const start = content.indexOf('<think>');
        if (start === -1) return { think: '', rest: content, hasThink: false, thinkClosed: true };
        const end = content.indexOf('</think>');
        if (end === -1) {
            const think = content.slice(start + 7);
            const rest = content.slice(0, start);
            return { think, rest, hasThink: true, thinkClosed: false };
        }
        const think = content.slice(start + 7, end);
        const rest = content.slice(0, start) + content.slice(end + 8);
        return { think, rest, hasThink: true, thinkClosed: true };
    };

    // 为保证类型兼容，将 ThoughtChain 以 any 使用，便于自定义状态映射
    const ThoughtChain: any = AntThoughtChain as any;

    // 记录思考开始时间与用时（秒），用于“思考中/已深度思考（用时 xxxx 秒）”显示
    const thinkStartRef = React.useRef<Map<string, number>>(new Map());
    const thinkDurationRef = React.useRef<Map<string, number>>(new Map());

    return (
        <div className="copilot-chat-list">
            {messages?.length ? (
                /* 🌟 消息列表 */
                <Bubble.List
                    items={messages?.map((i, idx) => {
                        const { content, role } = i?.message || {};
                        const { think, rest, hasThink, thinkClosed } = parseThinkContent(content);

                        const isAssistant = role === 'assistant';
                        const isLoading = i.status === 'loading';
                        const showLoadingChain = isAssistant && hasThink && (isLoading || !thinkClosed);

                        // 计算 key：尽量使用稳定 id/key，避免退化为索引
                        const msgKey = (
                            i?.id ||
                            i?.message?.id ||
                            i?.key ||
                            i?.message?.key ||
                            String(idx)
                        ) as string;

                        // 记录思考开始时间
                        if (isAssistant && hasThink && !thinkClosed && !thinkStartRef.current.has(msgKey)) {
                            thinkStartRef.current.set(msgKey, Date.now());
                        }

                        // 思考闭合时计算用时
                        if (isAssistant && hasThink && thinkClosed && !thinkDurationRef.current.has(msgKey)) {
                            const startAt = thinkStartRef.current.get(msgKey);
                            if (startAt) {
                                const elapsedSec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
                                thinkDurationRef.current.set(msgKey, elapsedSec);
                            }
                        }

                        // 兜底：当请求已不在 loading，但 <think> 未闭合时，也进行一次用时结算
                        if (
                            isAssistant &&
                            hasThink &&
                            !thinkClosed &&
                            !isLoading &&
                            !thinkDurationRef.current.has(msgKey)
                        ) {
                            const startAt = thinkStartRef.current.get(msgKey);
                            if (startAt) {
                                const elapsedSec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
                                thinkDurationRef.current.set(msgKey, elapsedSec);
                            }
                        }

                        const metaDuration = (i?.message as any)?.meta?.durationSec as number | undefined;
                        const mapDuration = thinkDurationRef.current.get(msgKey);
                        const durationSec = (
                            typeof metaDuration === 'number'
                                ? metaDuration
                                : (typeof mapDuration === 'number' ? mapDuration : 0)
                        );
                        const chainTitle = showLoadingChain
                            ? '思考中...'
                            : `已深度思考（用时 ${durationSec} 秒）`;

                        // 将内容替换为 ThoughtChain + 可见答案
                        const contentNode = (
                            <div>
                                {isAssistant && hasThink ? (
                                    <ThoughtChain
                                        key={`${msgKey}-${thinkClosed ? 'closed' : 'open'}`}
                                        items={[
                                            {
                                                title: chainTitle,
                                                content: think,
                                            },
                                        ]}
                                        // 将请求/思考中的状态映射给 ThoughtChain
                                        loading={!!showLoadingChain}
                                        // 思考中禁用折叠（强制展开）；结束后允许折叠并默认收起
                                        collapsible={showLoadingChain ? false : { open: false }}
                                    />
                                ) : null}
                                {rest}
                            </div>
                        );

                        return {
                            ...i.message,
                            content: contentNode,
                            classNames: {
                                content: isLoading ? 'copilot-loading-message' : '',
                            },
                            typing: isLoading ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                        };
                    })}
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
                                <div className="copilot-assistant-header">
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
                                <div className="copilot-user-header">
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
                    style={{ paddingInline: 'calc(50% - 314px)' }}
                    className="copilot-placeholder"
                >
                    <Welcome
                        variant="borderless"
                        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                        title="Hello, I'm Copilot 智能助手"
                        description="基于 AI，提供 SQL 查询产品接口解决方案，打造更智能的数据查询与分析体验 ~"
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