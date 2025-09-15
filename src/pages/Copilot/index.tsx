import React from 'react';

import { PageContainer } from '@ant-design/pro-components';

import { type GetProp, App } from 'antd';

import {
    Attachments,
    useXAgent,
    useXChat,
} from '@ant-design/x';

import { useEffect, useRef, useState } from 'react';

import './styles.less';
// 定义常量
import { DESIGN_GUIDE, SENDER_PROMPTS, getHotTopics } from './constant';
// 导入子组件
import { ChatSider, ChatList, SenderHeader, ChatSender } from './components';

type BubbleDataType = {
    role: string;
    content: string;
};

// localStorage 键名常量
const STORAGE_KEYS = {
    CONVERSATIONS: 'copilot_conversations',
    MESSAGE_HISTORY: 'copilot_message_history',
    CURRENT_CONVERSATION: 'copilot_current_conversation',
};

// 从localStorage加载数据的工具函数
const loadFromStorage = (key: string, defaultValue: any) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.warn(`从 localStorage 加载 ${key} 失败:`, error);
        return defaultValue;
    }
};

// 保存数据到localStorage的工具函数
const saveToStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`保存 ${key} 到 localStorage 失败:`, error);
    }
};

const AccessPage: React.FC = () => {
    // 使用 App.useApp() 获取 message 方法
    const { message } = App.useApp();
    
    const abortController = useRef<AbortController | null>(null);

    // 使用 CSS 类名获取 HOT_TOPICS 配置
    const HOT_TOPICS = getHotTopics({
        hotTopicIcon1: 'copilot-hot-topic-icon-1',
        hotTopicIcon2: 'copilot-hot-topic-icon-2',
        hotTopicIcon3: 'copilot-hot-topic-icon-3',
        hotTopicIcon4: 'copilot-hot-topic-icon-4',
        hotTopicIcon5: 'copilot-hot-topic-icon-5',
    });

    // ==================== State ====================
    // 从localStorage加载会话记录，如果没有则使用默认值
    const [messageHistory, setMessageHistory] = useState<Record<string, any>>(() => 
        loadFromStorage(STORAGE_KEYS.MESSAGE_HISTORY, {})
    );

    // 从localStorage加载会话列表，如果没有则使用空数组
    const [conversations, setConversations] = useState(() => 
        loadFromStorage(STORAGE_KEYS.CONVERSATIONS, [])
    );

    // 从localStorage加载当前会话，如果没有则使用默认值
    const [curConversation, setCurConversation] = useState(() => {
        const stored = loadFromStorage(STORAGE_KEYS.CURRENT_CONVERSATION, null);
        const loadedConversations = loadFromStorage(STORAGE_KEYS.CONVERSATIONS, []);
        
        // 如果会话列表为空，返回null表示显示欢迎页
        if (loadedConversations.length === 0) {
            return null;
        }
        
        // 如果有存储的会话ID，且该会话在列表中存在，则使用它
        if (stored && loadedConversations.some((conv: any) => conv.key === stored)) {
            return stored;
        }
        
        // 否则使用第一个会话
        return loadedConversations[0]?.key || null;
    });

    // 添加一个状态来标记是否是首次加载（用于控制是否显示欢迎页面）
    const [isInitialLoad, setIsInitialLoad] = useState(() => {
        const loadedConversations = loadFromStorage(STORAGE_KEYS.CONVERSATIONS, []);
        // 如果会话列表为空，显示欢迎页
        return loadedConversations.length === 0;
    });

    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

    const [inputValue, setInputValue] = useState('');

    // 保存AI已经输出的内容
    const currentAIContent = useRef<string>('');
    // 当前这轮 assistant 消息的稳定 id（贯穿流式与取消）
    const currentAssistantId = useRef<string>('');
    // 本轮 <think> 开始时间戳（毫秒）
    const currentThinkStartAt = useRef<number | null>(null);
    // 本轮思考用时（秒），在正常闭合或取消时计算
    const currentThinkDurationSec = useRef<number | null>(null);

    const generateStableId = () => {
        try {
            // 优先使用原生 uuid（若可用）
            // @ts-ignore
            if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
                // @ts-ignore
                return crypto.randomUUID();
            }
        } catch {}
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    };

    /**
     * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
     */

    // ==================== Runtime ====================
    const [agent] = useXAgent<BubbleDataType>({
        baseURL: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-reasoner',
        dangerouslyApiKey: 'Bearer sk-6a18e966275e47818f06d0a3238278b1',
    });

    const loading = agent.isRequesting();

    const { onRequest, messages, setMessages } = useXChat({
        agent,
        requestFallback: (currentMessage, { error }) => {
            if (error?.name === 'AbortError') {
                // 获取AI已经输出的内容（originMessage的content）
                const existingContent = currentAIContent.current || '';
                // 如果存在未闭合的 <think>，在取消时补齐闭合以触发用时结算
                const hasOpenThink = existingContent.includes('<think>') && !existingContent.includes('</think>');
                const normalized = hasOpenThink ? `${existingContent}</think>` : existingContent;
                const cancelledContent = normalized
                    ? `${normalized}\n\n --- [请求已取消] ---`
                    : '请求已取消';
                const durationSec = currentThinkStartAt.current
                    ? Math.max(0, Math.round((Date.now() - currentThinkStartAt.current) / 1000))
                    : 0;
                
                return {
                    id: currentAssistantId.current,
                    content: cancelledContent,
                    role: 'assistant',
                    meta: {
                        thinkStartAt: currentThinkStartAt.current ?? undefined,
                        durationSec,
                    },
                };
            }
            return {
                id: currentAssistantId.current,
                content: '请求失败，请重试！',
                role: 'assistant',
            };
        },
        transformMessage: (info) => {
            const { originMessage, chunk } = info || {};
            
            // 保存AI已经输出的内容
            currentAIContent.current = originMessage?.content || '';
            
            let currentContent = '';
            let currentThink = '';
            try {
                if (chunk?.data && !chunk?.data.includes('DONE')) {
                    const message = JSON.parse(chunk?.data);
                    currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
                    currentContent = message?.choices?.[0]?.delta?.content || '';
                }
            } catch (error) {
                console.error('Transform message error:', error);
            }

            let content = '';

            if (!originMessage?.content && currentThink) {
                content = `<think>${currentThink}`;
                if (!currentThinkStartAt.current) {
                    currentThinkStartAt.current = Date.now();
                }
            } else if (
                originMessage?.content?.includes('<think>') &&
                !originMessage?.content.includes('</think>') &&
                currentContent
            ) {
                content = `${originMessage?.content}</think>${currentContent}`;
                // 正常闭合时结算一次用时（秒）
                if (currentThinkStartAt.current && currentThinkDurationSec.current === null) {
                    currentThinkDurationSec.current = Math.max(
                        0,
                        Math.round((Date.now() - currentThinkStartAt.current) / 1000),
                    );
                }
            } else {
                content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
            }
            return {
                id: currentAssistantId.current,
                content: content,
                role: 'assistant',
                meta:
                    currentThinkStartAt.current || currentThinkDurationSec.current !== null
                        ? {
                              thinkStartAt: currentThinkStartAt.current ?? undefined,
                              durationSec:
                                  currentThinkDurationSec.current !== null
                                      ? currentThinkDurationSec.current
                                      : undefined,
                          }
                        : undefined,
            };
        },
        resolveAbortController: (controller) => {
            abortController.current = controller;
        },
    });

    // ==================== 页面刷新清理逻辑 ====================
    useEffect(() => {
        // 页面刷新或关闭时的清理函数
        const handleBeforeUnload = () => {
            // 如果有正在进行的请求，尝试中止它
            if (abortController.current) {
                try {
                    abortController.current.abort('页面刷新');
                } catch (error) {
                    console.warn('页面刷新时中止请求失败:', error);
                }
            }
        };

        // 组件卸载时的清理函数
        const handleUnload = () => {
            if (abortController.current) {
                try {
                    abortController.current.abort('组件卸载');
                } catch (error) {
                    console.warn('组件卸载时中止请求失败:', error);
                }
            }
        };

        // 添加页面刷新/关闭事件监听器
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        // 清理函数
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            
            // 组件卸载时也要中止请求
            if (abortController.current) {
                try {
                    abortController.current.abort('组件卸载');
                } catch (error) {
                    console.warn('组件卸载时中止请求失败:', error);
                }
            }
        };
    }, []);

    // ==================== Event ====================
    const onSubmit = (val: string) => {
        if (!val) return;

        if (loading) {
            message.error('请求正在进行中，请等待请求完成。');
            return;
        }

        // 如果是首次加载，提交消息时结束首次加载状态
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }

        // 为本轮 assistant 输出生成稳定 id，并重置思考开始时间/用时
        currentAssistantId.current = generateStableId();
        currentThinkStartAt.current = null;
        currentThinkDurationSec.current = null;

        onRequest({
            stream: true,
            message: { role: 'user', content: val },
        });
    };

    // 处理会话切换
    const handleConversationChange = (conversationKey: string) => {
        // 如果切换到相同的会话，不需要做任何操作
        if (conversationKey === curConversation && !isInitialLoad) {
            return;
        }
        
        // 手动点击会话时，结束首次加载状态并加载对话内容
        setIsInitialLoad(false);
        
        // 如果传入的是空字符串，设置为null
        const newConversationKey = conversationKey || null;
        setCurConversation(newConversationKey);
        
        if (newConversationKey) {
            const conversationMessages = messageHistory[newConversationKey] || [];
            
            // 只有当消息实际不同时才更新
            if (JSON.stringify(conversationMessages) !== JSON.stringify(messages)) {
                setMessages(conversationMessages);
            }
        } else {
            // 如果没有当前会话，清空消息
            setMessages([]);
        }
    };

    // ==================== localStorage 持久化 ====================
    // 保存会话列表到 localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }, [conversations]);

    // 保存当前会话到 localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_CONVERSATION, curConversation);
    }, [curConversation]);

    // 保存消息历史到localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.MESSAGE_HISTORY, messageHistory);
    }, [messageHistory]);

    // 添加一个ref来缓存上一次的消息，避免重复比较
    const prevMessagesRef = useRef<any[]>([]);
    // 添加一个ref来缓存上一次保存到历史的消息
    const prevSavedMessagesRef = useRef<Record<string, any[]>>({});

    // 只有在非首次加载时才自动加载当前会话的消息
    useEffect(() => {
        if (!isInitialLoad && curConversation) {
            const currentMessages = messageHistory[curConversation] || [];
            // 只有当消息实际不同时才更新，避免无限循环
            if (JSON.stringify(currentMessages) !== JSON.stringify(prevMessagesRef.current)) {
                prevMessagesRef.current = currentMessages;
                setMessages(currentMessages);
            }
        }
    }, [curConversation, isInitialLoad]); // 移除 messageHistory 和 setMessages 从依赖数组

    // ==================== 组件渲染 ====================
    const senderHeader = (
        <SenderHeader
            attachmentsOpen={attachmentsOpen}
            attachedFiles={attachedFiles}
            onAttachmentsOpenChange={setAttachmentsOpen}
            onAttachedFilesChange={setAttachedFiles}
        />
    );

    useEffect(() => {
        // 保存消息历史到状态和localStorage
        if (messages?.length && curConversation) {
            // 检查是否与上次保存的消息相同
            const lastSavedMessages = prevSavedMessagesRef.current[curConversation];
            if (JSON.stringify(lastSavedMessages) !== JSON.stringify(messages)) {
                prevSavedMessagesRef.current[curConversation] = messages;
                setMessageHistory((prev) => {
                    // 避免不必要的状态更新
                    const currentMessages = prev[curConversation];
                    if (JSON.stringify(currentMessages) !== JSON.stringify(messages)) {
                        return {
                            ...prev,
                            [curConversation]: messages,
                        };
                    }
                    return prev;
                });
            }
        }
    }, [messages, curConversation]);

    return (
        <PageContainer
            ghost
        >
            <div className="copilot-layout">
                <ChatSider
                    conversations={conversations}
                    curConversation={curConversation}
                    messageHistory={messageHistory}
                    isRequesting={agent.isRequesting()}
                    abortController={abortController}
                    onConversationsChange={setConversations}
                    onCurConversationChange={handleConversationChange}
                    onMessagesChange={setMessages}
                    onMessageHistoryChange={setMessageHistory}
                    isInitialLoad={isInitialLoad}
                />

                <div className="copilot-chat">
                    <ChatList
                        messages={isInitialLoad ? [] : messages}
                        hotTopics={HOT_TOPICS}
                        designGuide={DESIGN_GUIDE}
                        onSubmit={onSubmit}
                    />
                    <ChatSender
                        senderPrompts={SENDER_PROMPTS}
                        inputValue={inputValue}
                        loading={loading}
                        senderHeader={senderHeader}
                        abortController={abortController}
                        onSubmit={onSubmit}
                        onInputChange={setInputValue}
                        onAttachmentsToggle={() => setAttachmentsOpen(!attachmentsOpen)}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

export default AccessPage;
