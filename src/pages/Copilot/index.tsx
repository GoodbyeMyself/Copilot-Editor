import React from 'react';

import { PageContainer } from '@ant-design/pro-components';

import { type GetProp, message } from 'antd';

import {
    Attachments,
    useXAgent,
    useXChat,
} from '@ant-design/x';

import { useEffect, useRef, useState } from 'react';

import './styles.css';
// 定义常量
import { DEFAULT_CONVERSATIONS_ITEMS, DESIGN_GUIDE, SENDER_PROMPTS, getHotTopics } from './constant';
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

    // 从localStorage加载会话列表，如果没有则使用默认值
    const [conversations, setConversations] = useState(() => 
        loadFromStorage(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS_ITEMS)
    );

    // 从localStorage加载当前会话，如果没有则使用默认值
    const [curConversation, setCurConversation] = useState(() => {
        const stored = loadFromStorage(STORAGE_KEYS.CURRENT_CONVERSATION, null);
        const loadedConversations = loadFromStorage(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS_ITEMS);
        // 确保当前会话在会话列表中存在
        if (stored && loadedConversations.some((conv: any) => conv.key === stored)) {
            return stored;
        }
        return loadedConversations[0]?.key || DEFAULT_CONVERSATIONS_ITEMS[0].key;
    });

    // 添加一个状态来标记是否是首次加载（用于控制是否显示欢迎页面）
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

    const [inputValue, setInputValue] = useState('');

    // 保存AI已经输出的内容
    const currentAIContent = useRef<string>('');

    /**
     * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
     */

    // ==================== Runtime ====================
    const [agent] = useXAgent<BubbleDataType>({
        baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
        model: 'DeepSeek-R1-Distill-Qwen-7B',
        dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
    });

    const loading = agent.isRequesting();

    const { onRequest, messages, setMessages } = useXChat({
        agent,
        requestFallback: (currentMessage, { error }) => {
            if (error?.name === 'AbortError') {
                // 获取AI已经输出的内容（originMessage的content）
                const existingContent = currentAIContent.current || '';
                const cancelledContent = existingContent 
                    ? `${existingContent}\n\n --- [请求已取消] ---`
                    : '请求已取消';
                
                return {
                    content: cancelledContent,
                    role: 'assistant',
                };
            }
            return {
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
            } else if (
                originMessage?.content?.includes('<think>') &&
                !originMessage?.content.includes('</think>') &&
                currentContent
            ) {
                content = `${originMessage?.content}</think>${currentContent}`;
            } else {
                content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
            }
            return {
                content: content,
                role: 'assistant',
            };
        },
        resolveAbortController: (controller) => {
            abortController.current = controller;
        },
    });

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
        setCurConversation(conversationKey);
        const conversationMessages = messageHistory[conversationKey] || [];
        
        // 只有当消息实际不同时才更新
        if (JSON.stringify(conversationMessages) !== JSON.stringify(messages)) {
            setMessages(conversationMessages);
        }
    };

    // ==================== localStorage 持久化 ====================
    // 保存会话列表到localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }, [conversations]);

    // 保存当前会话到localStorage
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
