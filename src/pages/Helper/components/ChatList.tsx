import {
    CopyOutlined,
    DislikeOutlined,
    LikeOutlined,
    ReloadOutlined,
    RobotOutlined,
    UserOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';

import {
    Bubble,
    Prompts,
    Welcome,
    ThoughtChain as AntThoughtChain,
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
    // 解析包含 <think> 的消息
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

    // ThoughtChain 组件类型兜底
    const ThoughtChain: any = AntThoughtChain as any;

    // 记录思考开始时间与用时（秒），用于“思考中/已深度思考（用时 xxxx 秒）”显示
    const thinkStartRef = React.useRef<Map<string, number>>(new Map());
    const thinkDurationRef = React.useRef<Map<string, number>>(new Map());

    const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'success':
                return <CheckCircleOutlined />;
            case 'error':
                return <InfoCircleOutlined />;
            case 'pending':
                return <LoadingOutlined />;
            default:
                return undefined;
        }
    };

    return (
        <div className="helper-chat-list">
            {messages?.length ? (
                /** 消息列表 */
                <Bubble.List
                    style={{ height: '100%', paddingInline: 16 }}
                    items={messages?.map((i, idx) => {
                        const { content, role } = i?.message || {};
                        const { think, rest, hasThink, thinkClosed } = parseThinkContent(content);

                        const isAssistant = role === 'assistant';
                        const isLoading = i.status === 'loading';
                        const showLoadingChain = isAssistant && hasThink && (isLoading || !thinkClosed);

                        const msgKey = (
                            i?.id || i?.message?.id || i?.key || i?.message?.key || String(idx)
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
                        if (isAssistant && hasThink && !thinkClosed && !isLoading && !thinkDurationRef.current.has(msgKey)) {
                            const startAt = thinkStartRef.current.get(msgKey);
                            if (startAt) {
                                const elapsedSec = Math.max(0, Math.round((Date.now() - startAt) / 1000));
                                thinkDurationRef.current.set(msgKey, elapsedSec);
                            }
                        }

                        const metaDuration = (i?.message as any)?.meta?.durationSec as number | undefined;
                        const mapDuration = thinkDurationRef.current.get(msgKey);
                        const durationSec = typeof metaDuration === 'number' ? metaDuration : (typeof mapDuration === 'number' ? mapDuration : 0);
                        const chainTitle = showLoadingChain ? '思考中...' : `已深度思考（用时 ${durationSec} 秒）`;

                        const CANCEL_MARK = '--- [请求已取消] ---';
                        const contentNode = (
                            <>
                                {isAssistant && hasThink ? (
                                    (() => {
                                        const nodeStatus: 'pending' | 'success' | 'error' = (
                                            i?.status === 'error' ? 'error' : (showLoadingChain ? 'pending' : 'success')
                                        );
                                        const nodeIcon = getStatusIcon(nodeStatus);
                                        return (
                                            <ThoughtChain
                                                key={`${msgKey}-${thinkClosed ? 'closed' : 'open'}`}
                                                items={[{ title: chainTitle, content: think, status: nodeStatus, icon: nodeIcon }]}
                                                loading={!!showLoadingChain}
                                                collapsible={showLoadingChain ? false : { open: false }}
                                            />
                                        );
                                    })()
                                ) : null}
                                {(() => {
                                    if (typeof rest === 'string' && rest.includes(CANCEL_MARK)) {
                                        const parts = rest.split(CANCEL_MARK);
                                        return (
                                            <>
                                                {parts[0]}
                                                <div className="helper-cancelled-label">{CANCEL_MARK}</div>
                                                {parts.slice(1).join(CANCEL_MARK)}
                                            </>
                                        );
                                    }
                                    return rest as any;
                                })()}
                            </>
                        );

                        return {
                            ...i.message,
                            content: contentNode,
                            classNames: {
                                content: isLoading ? 'helper-loading-message' : '',
                            },
                            typing: isLoading ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                        };
                    })}
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
                        title="Hi! I'm Copilot 智能助手"
                        description="基于 AI，提供 SQL 查询产品接口解决方案，打造更智能的数据查询与分析体验 ~"
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