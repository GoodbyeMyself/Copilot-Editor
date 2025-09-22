import React, { useRef, useEffect } from 'react';
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

import MarkdownRenderer, { StreamingMarkdownRenderer } from '@/components/base/MarkdownRenderer';
import StreamingContent from '@/components/base/StreamingContent';
import styles from './BaseChatList.module.less';

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 查找真正的滚动容器并平滑滚动到底部
    const scrollToBottom = (smooth: boolean = true) => {
        requestAnimationFrame(() => {
            // 首先尝试通过containerClassName找到外层滚动容器
            const outerContainer = document.querySelector(`.${containerClassName}`) as HTMLElement;
            if (outerContainer && outerContainer.scrollHeight > outerContainer.clientHeight) {
                outerContainer.scrollTo({
                    top: outerContainer.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
                return;
            }

            // 降级：查找页面中的copilot-chat-list容器
            const copilotContainer = document.querySelector('.copilot-chat-list') as HTMLElement;
            if (copilotContainer && copilotContainer.scrollHeight > copilotContainer.clientHeight) {
                copilotContainer.scrollTo({
                    top: copilotContainer.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
                return;
            }

            // 最终降级：使用ref容器
            const container = scrollContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }
        });
    };

    // 监听消息变化，平滑滚动
    useEffect(() => {
        if (messages && messages.length > 0) {
            // 新消息使用平滑滚动
            scrollToBottom(true);
        }
    }, [messages]);

    // 监听loading状态，持续但温和的滚动
    useEffect(() => {
        const hasLoadingMessage = messages?.some(msg => (msg?.message as any)?.status === 'loading');
        if (hasLoadingMessage) {
            // 首次立即滚动
            scrollToBottom(false);
            
            // 然后使用较低频率的平滑滚动
            const interval = setInterval(() => {
                scrollToBottom(true);
            }, 300); // 降低频率到300ms，使用平滑滚动
            
            return () => clearInterval(interval);
        }
    }, [messages]);

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

    const renderCancelContent = (content: string, isStreaming: boolean = false) => {
        if (!hasCancelMark(content)) {
            // 如果是流式输出，使用 StreamingContent 组件
            if (isStreaming) {
                // 找到真正的滚动容器
                const getScrollContainer = () => {
                    const outerContainer = document.querySelector(`.${containerClassName}`) as HTMLElement;
                    if (outerContainer && outerContainer.scrollHeight > outerContainer.clientHeight) {
                        return outerContainer;
                    }
                    const copilotContainer = document.querySelector('.copilot-chat-list') as HTMLElement;
                    if (copilotContainer && copilotContainer.scrollHeight > copilotContainer.clientHeight) {
                        return copilotContainer;
                    }
                    return scrollContainerRef.current;
                };

                return (
                    <StreamingContent
                        content={content}
                        isStreaming={isStreaming}
                        scrollContainer={getScrollContainer()}
                        className={messageClassName}
                        autoScroll={true}
                        onContentUpdate={() => scrollToBottom(false)} // SSE流式输出使用即时滚动
                    />
                );
            }
            return <MarkdownRenderer>{content}</MarkdownRenderer>;
        }

        const parts = splitCancelContent(content);
        const RendererComponent = isStreaming ? StreamingMarkdownRenderer : MarkdownRenderer;
        
        return (
            <>
                <RendererComponent>{parts[0]}</RendererComponent>
                <div className={cancelledLabelClassName}>--- [请求已取消] ---</div>
                <RendererComponent>{parts.slice(1).join('--- [请求已取消] ---')}</RendererComponent>
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
                    {renderCancelContent(rest, isLoading)}
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
        <div className={`base-chat-list ${containerClassName} ${className}`} ref={scrollContainerRef}>
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
                                <div className={styles.footerButtons}>
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
                                    User
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