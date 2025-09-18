import React from 'react';
import { Avatar, Button, Space, Spin } from 'antd';
import { Bubble, Prompts, Welcome, ThoughtChain as AntThoughtChain } from '@ant-design/x';
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

import { BaseChatListProps, StatusType } from '../types';
import { parseThinkContent, generateMessageKey, hasCancelMark, splitCancelContent } from '../utils';
import { useThinkTiming } from '../hooks/useThinkTiming';

// ThoughtChain 组件类型兜底
const ThoughtChain: any = AntThoughtChain as any;

interface BaseChatListComponentProps extends BaseChatListProps {
    // 样式相关
    containerClassName?: string;
    messageClassName?: string;
    loadingMessageClassName?: string;
    cancelledLabelClassName?: string;
    assistantHeaderClassName?: string;
    userHeaderClassName?: string;
    
    // 空状态相关
    showWelcome?: boolean;
    welcomeTitle?: string;
    welcomeDescription?: string;
    welcomeIcon?: string;
    showPrompts?: boolean;
    promptsTitle?: string;
    promptsItems?: Array<{ key: string; description: string }>;
    
    // 布局相关
    bubbleStyle?: React.CSSProperties;
    bubblePadding?: string;
}

const BaseChatList: React.FC<BaseChatListComponentProps> = ({
    messages,
    className = '',
    onUserSubmit,
    containerClassName = '',
    messageClassName = '',
    loadingMessageClassName = '',
    cancelledLabelClassName = '',
    assistantHeaderClassName = '',
    userHeaderClassName = '',
    showWelcome = true,
    welcomeTitle = "Hi! I'm Copilot 智能助手",
    welcomeDescription = "基于 AI 打造更智能的数据查询与分析体验 ~",
    welcomeIcon = "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp",
    showPrompts = true,
    promptsTitle = "我可以帮助您：",
    promptsItems = [],
    bubbleStyle = {},
    bubblePadding = '16px',
}) => {
    const { recordThinkStart, calculateAndRecordDuration } = useThinkTiming();

    const getStatusIcon = (status: StatusType) => {
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

    const renderCancelContent = (content: string) => {
        if (!hasCancelMark(content)) {
            return content as any;
        }

        const parts = splitCancelContent(content);
        return (
            <>
                {parts[0]}
                <div className={cancelledLabelClassName}>--- [请求已取消] ---</div>
                {parts.slice(1).join('--- [请求已取消] ---')}
            </>
        );
    };

    const renderMessageContent = (message: any, idx: number) => {
        const { content, role } = message?.message || {};
        const { think, rest, hasThink, thinkClosed } = parseThinkContent(content);

        const isAssistant = role === 'assistant';
        const isLoading = message.status === 'loading';
        const showLoadingChain = isAssistant && hasThink && (isLoading || !thinkClosed);

        const msgKey = generateMessageKey(message, idx);

        // 记录思考开始时间
        if (isAssistant && hasThink && !thinkClosed) {
            recordThinkStart(msgKey);
        }

        // 计算思考用时
        const metaDuration = (message?.message as any)?.meta?.durationSec as number | undefined;

        const durationSec = calculateAndRecordDuration(msgKey, metaDuration);

        const chainTitle = showLoadingChain ? '思考中...' : `已深度思考（用时 ${durationSec} 秒）`;

        const contentNode = (
            <>
                {isAssistant && hasThink ? (
                    (() => {
                        const nodeStatus: StatusType = (
                            message?.status === 'error' ? 'error' : (showLoadingChain ? 'pending' : 'success')
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
                <div className={messageClassName}>
                    {renderCancelContent(rest)}
                </div>
            </>
        );

        return {
            ...message.message,
            content: contentNode,
            classNames: {
                content: isLoading ? loadingMessageClassName : '',
            },
            typing: isLoading ? { step: 5, interval: 20, suffix: <>💗</> } : false,
        };
    };

    return (
        <div className={`base-chat-list ${containerClassName} ${className}`}>
            {messages?.length ? (
                <Bubble.List
                    style={{ 
                        height: '100%', 
                        paddingInline: bubblePadding,
                        ...bubbleStyle 
                    }}
                    items={messages?.map(renderMessageContent)}
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
                                <div className={assistantHeaderClassName}>
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
                                    <span>Generating content, please wait...</span>
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
                                <div className={userHeaderClassName}>
                                    用户
                                </div>
                            ),
                        },
                    }}
                />
            ) : (
                <>
                    {showWelcome && (
                        <Welcome
                            style={{
                                backgroundImage: 'linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)',
                                borderStartStartRadius: 4,
                            }}
                            icon={welcomeIcon}
                            title={welcomeTitle}
                            description={welcomeDescription}
                        />
                    )}
                    {showPrompts && promptsItems.length > 0 && (
                        <Prompts
                            vertical
                            title={promptsTitle}
                            items={promptsItems.map((i) => ({ key: i.key, description: i.description }))}
                            onItemClick={(info) => onUserSubmit?.(info?.data?.description as string)}
                            style={{
                                marginInline: 16,
                            }}
                            styles={{
                                title: { fontSize: 14 },
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default BaseChatList;